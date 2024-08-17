import {Box} from "../Box";
import {FreNode} from "../../../ast";
import {FreUtils} from "../../../util";
import {AbstractExternalPropertyBox} from "./AbstractExternalPropertyBox";

/**
 * This class represents an external component that replaces the native projection of a list of model properties, like "notes: NoteConcept[]".
 */
export class ExternalPartListBox extends AbstractExternalPropertyBox {
    readonly kind: string = "ExternalPartListBox";
    private _children: Box[] = [];

    constructor(externalComponentName: string, node: FreNode, role: string, propertyName: string, children: Box[], initializer?: Partial<ExternalPartListBox>) {
        super(externalComponentName, node, role, propertyName);
        FreUtils.initializeObject(this, initializer);
        children.forEach(b => this.addChildNoDirty(b));
    }

    /**
     * To be used when adding multiple children in one go, avoiding spurious isDirty() calls.
     * @param child
     * @private
     */
    private addChildNoDirty(child: Box | null) {
        if (!!child) {
            this._children.push(child);
            child.parent = this;
            // child.isVisible = false;
        }
    }

    get children(): ReadonlyArray<Box> {
        return this._children as ReadonlyArray<Box>;
    }

    getPropertyName(): string {
        return this.propertyName;
    }

    getPropertyValue(): FreNode[] {
        const val = this.node[this.propertyName];
        // if (typeof val === this.propertyClassifierName) {
            return val;
        // }
        // return undefined;
    }

    setPropertyValue(newValue: FreNode[]) {
        // todo add checks
        this.node[this.propertyName] = newValue;
    }

    // todo do we need more of the replace children functionality like in LayoutComponent??
}

export function isExternalPartListBox(b: Box): b is ExternalPartListBox {
    return b?.kind === "ExternalPartListBox"; // b instanceof ExternalPartListBox;
}