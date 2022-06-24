import { PiDelta, PiPartDelta, PiPartListDelta, PiPrimDelta, PiPrimListDelta, PiTransactionDelta } from "./PiDelta";
import { PiModelUnit } from "../ast";
import { modelUnit } from "../ast-utils";
import { PiLogger } from "../logging";

const LOGGER: PiLogger = new PiLogger("PiUndoStackManager");
export class PiUndoStackManager {
    changeSource: PiModelUnit;

    public undoStack: PiDelta[] = [];
    public redoStack: PiDelta[] = [];
    private inIgnoreState: boolean = false;
    private inTransaction: boolean = false;
    private currentTransaction: PiTransactionDelta;
    private inUndo: boolean = false;

    constructor(unit: PiModelUnit) {
       this.changeSource = unit;
    }

    public startTransaction() {
        this.inTransaction = true;
    }

    public endTransaction() {
        this.inTransaction = false;
        this.currentTransaction = null;
    }

    public startIgnore() {
        this.inIgnoreState = true;
    }

    public endIgnore() {
        this.inIgnoreState = false;
    }

    /**
     * A temporary method, because during testing we use the same manager
     */
    public cleanStacks() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public executeUndo() {
        this.inUndo = true; // make sure incoming changes are stored on redo stack
        // console.log("executing undo for unit: "+ unit.name)
        const delta = this.undoStack.pop();
        if (!!delta) {
            PiUndoStackManager.reverseDelta(delta);
        }
        this.inUndo = false;
    }

    public executeRedo() {
        const delta = this.redoStack.pop();
        if (!!delta) {
            PiUndoStackManager.reverseDelta(delta);
        }
    }

    public addDelta(delta: PiDelta) {
        // console.log("in transaction: " + this.inTransaction);
        if (!this.inIgnoreState) {
            if (this.inUndo) {
                this.addRedo(delta);
            } else {
                this.addUndo(delta);
            }
        }
    }

    private addUndo(delta: PiDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index);
                this.undoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.undoStack.push(delta);
            // console.log("PiUndoManager: added undo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private addRedo(delta: PiDelta) {
        if (this.inTransaction) {
            if (this.currentTransaction === null || this.currentTransaction === undefined) {
                this.currentTransaction = new PiTransactionDelta(modelUnit(delta.owner), delta.owner, delta.propertyName, delta.index);
                this.redoStack.push(this.currentTransaction);
            }
            this.currentTransaction.internalDeltas.push(delta);
            // console.log("PiUndoManager: IN TRANSACTION added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        } else {
            this.redoStack.push(delta);
            // console.log("PiUndoManager: added redo for " + delta.owner.piLanguageConcept() + "[" + delta.propertyName + "]");
        }
    }

    private static reverseDelta(delta: PiDelta) {
        // console.log(`reverseDelta<${delta.constructor.name}>:  ${delta.toString()} `);
        if (delta instanceof PiPartDelta || delta instanceof PiPrimDelta) {
            if (PiUndoStackManager.hasIndex(delta)) {
                if (PiUndoStackManager.checkIndex(delta)) {
                    delta.owner[delta.propertyName][delta.index] = delta.oldValue;
                } else {
                    LOGGER.error(`cannot reverse ${delta.toString()} because the index is incorrect`);
                }
            } else {
                delta.owner[delta.propertyName] = delta.oldValue;
            }
        } else if (delta instanceof PiPartListDelta || delta instanceof PiPrimListDelta) {
            if (delta.removed.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, 0, ...delta.removed );
            }
            if (delta.added.length > 0) {
                delta.owner[delta.propertyName].splice(delta.index, delta.added.length );
            }
        } else if (delta instanceof PiTransactionDelta) {
            // TODO
            console.log("reverse of transaction delta to be done");
        }
    }

    private static hasIndex(delta: PiDelta): boolean {
        return delta.index !== null && delta.index !== undefined;
    }

    private static checkIndex(delta: PiDelta): boolean {
        return delta.index >= 0 && delta.index < delta.owner[delta.propertyName].length;
    }

}
