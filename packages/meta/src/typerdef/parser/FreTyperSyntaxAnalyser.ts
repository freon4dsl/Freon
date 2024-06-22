// Generated by the Freon Language Generator.
import { net } from "net.akehurst.language-agl-processor";
import SyntaxAnalyser = net.akehurst.language.api.syntaxAnalyser.SyntaxAnalyser;
import SharedPackedParseTree = net.akehurst.language.api.sppt.SharedPackedParseTree;
import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
import SPPTLeaf = net.akehurst.language.api.sppt.SPPTLeaf;
import SPPTNode = net.akehurst.language.api.sppt.SPPTNode;
import { FreTyperDefSyntaxAnalyserPart } from ".";
import { MetaElementReference, FreMetaLangElement } from "../../languagedef/metalanguage";
import { FreParseLocation } from "../../utils";

/**
 *   Class MetaTyperSyntaxAnalyser is the main syntax analyser.
 *   The actual work is being done by its parts, one for each model unit,
 *   and one common part that contains the methods used in multiple units.
 *
 */
export class FreTyperSyntaxAnalyser implements SyntaxAnalyser {
    locationMap: any;
    filename: string = '';
    private _unit_TyperDef_analyser: FreTyperDefSyntaxAnalyserPart = new FreTyperDefSyntaxAnalyserPart(this);

    clear(): void {
        throw new Error("Method not implemented.");
    }

    transform<T>(sppt: SharedPackedParseTree): T {
        if (!!sppt.root) {
            return this.transformSharedPackedParseTreeNode(sppt.root) as unknown as T;
        } else {
            return null;
        }
    }

    public transformSharedPackedParseTreeNode(node: SPPTNode): any {
        try {
            if (node.isLeaf) {
                return this.transformSharedPackedParseTreeLeaf(node);
            } else if (node.isBranch) {
                return this.transformSharedPackedParseTreeBranch(node as SPPTBranch);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                if (e.message.startsWith("Syntax error in ") || e.message.startsWith("Error in MetaTyperSyntaxAnalyser")) {
                    throw e;
                } else {
                    // add more info to the error message
                    throw new Error(`Syntax error in "${node?.matchedText.trimEnd()}": ${e.message}`);
                }
            }
        }
    }

    private transformSharedPackedParseTreeLeaf(node: SPPTNode): any {
        let tmp = ((node as SPPTLeaf)?.nonSkipMatchedText).trim();
        if (tmp.length > 0) {
            if (tmp.startsWith('"')) {
                // stringLiteral, strip the surrounding quotes
                tmp = tmp.slice(1, tmp.length - 1);
                return tmp;
            } else if (tmp === "false") {
                // booleanLiteral
                return false;
            } else if (tmp === "true") {
                // booleanLiteral
                return true;
            } else if (Number.isInteger(parseInt(tmp, 10))) {
                // numberLiteral
                return parseInt(tmp, 10);
            } else {
                // identifier
                return tmp;
            }
        }
        return null;
    }

    private transformSharedPackedParseTreeBranch(branch: SPPTBranch): any {
        const brName: string = branch.name;
        if ("TyperDef" === brName) {
            return this._unit_TyperDef_analyser.transformTyperDef(branch);
        } else if ("FretTypeConcept" === brName) {
            return this._unit_TyperDef_analyser.transformFretTypeConcept(branch);
        } else if ("FretAnyTypeSpec" === brName) {
            return this._unit_TyperDef_analyser.transformFretAnyTypeSpec(branch);
        } else if ("FretInferenceRule" === brName) {
            return this._unit_TyperDef_analyser.transformFretInferenceRule(branch);
        } else if ("FretPropertyCallExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretPropertyCallExp(branch);
        } else if ("FretSelfExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretSelfExp(branch);
        } else if ("FretAnytypeExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretAnytypeExp(branch);
        } else if ("FretVarCallExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretVarCallExp(branch);
        } else if ("FretCreateExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretCreateExp(branch);
        } else if ("FretPropInstance" === brName) {
            return this._unit_TyperDef_analyser.transformFretPropInstance(branch);
        } else if ("FretFunctionCallExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretFunctionCallExp(branch);
        } else if ("FretLimitedInstanceExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretLimitedInstanceExp(branch);
        } else if ("FretWhereExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretWhereExp(branch);
        } else if ("FretVarDecl" === brName) {
            return this._unit_TyperDef_analyser.transformFretVarDecl(branch);
        } else if ("FretConformanceRule" === brName) {
            return this._unit_TyperDef_analyser.transformFretConformanceRule(branch);
        } else if ("FretEqualsRule" === brName) {
            return this._unit_TyperDef_analyser.transformFretEqualsRule(branch);
        } else if ("FretLimitedRule" === brName) {
            return this._unit_TyperDef_analyser.transformFretLimitedRule(branch);
        } else if ("FretClassifierSpec" === brName) {
            return this._unit_TyperDef_analyser.transformFretClassifierSpec(branch);
        } else if ("FretTypeRule" === brName) {
            return this._unit_TyperDef_analyser.transformFretTypeRule(branch);
        } else if ("FretExp" === brName) {
            return this._unit_TyperDef_analyser.transformFretExp(branch);
        } else if ("__fre_binary_FretExp" === brName) {
            return this._unit_TyperDef_analyser.transform__fre_binary_FretExp(branch);
        } else if ("FretProperty" === brName) {
            return this._unit_TyperDef_analyser.transformFretProperty(branch);
        } else if ("__fre_reference" === brName) {
            return this.transform__fre_reference(branch);
        } else {
            throw new Error(`Error in FreTyperSyntaxAnalyser: ${brName} not handled for node '${branch?.matchedText}'`);
        }
    }

    /**
     * Generic method to get the children of a branch. Throws an error if no children can be found.
     */
    public getChildren(branch: SPPTBranch): any {
        if (!!branch && !!branch.nonSkipChildren) {
            try {
                return branch.nonSkipChildren.toArray();
            } catch (e: unknown) {
                if (e instanceof Error) {
                    throw new Error(`Cannot follow branch: ${e.message} (${branch.matchedText.trimEnd()})`);
                }
            }
        }
        return null;
    }

    /**
     * Generic method to get the optional group of a branch. Throws an error if no group can be found.
     */
    public getGroup(branch: SPPTBranch) {
        // take the first element in the [0..1] optional group or multi branch
        let group: any = branch;
        let stop: boolean = false;
        while (!stop) {
            let nextOne: any = null;
            try {
                nextOne = group.nonSkipChildren.toArray()[0];
            } catch (e: unknown) {
                if (e instanceof Error) {
                    throw new Error(`Cannot follow group: ${e.message} (${group.matchedText})`);
                }
            }
            if (!nextOne.name.includes("multi") && !nextOne.name.includes("group")) {
                stop = true; // found a branch with actual content, return its parent!
            } else {
                group = nextOne;
            }
        }
        return group;
    }

    public transform__fre_reference(branch: SPPTBranch) {
        if (branch.name.includes("multi") || branch.name.includes("List")) {
            return this.transformSharedPackedParseTreeList<string>(branch, "::::");
        } else {
            return this.transformSharedPackedParseTreeLeaf(branch);
        }
    }

    /**
     * Generic method to transform references
     * ...FreNodeRef = identifier;
     */
    public freNodeRef<T extends FreMetaLangElement>(branch: SPPTBranch, typeName: string): MetaElementReference<T> {
        const referred: string | T = this.transformSharedPackedParseTreeNode(branch);
        if (referred === null || referred === undefined) {
            throw new Error(`Syntax error in "${branch?.parent?.matchedText}": cannot create empty reference`);
        } else if (typeof referred === "string" && (referred as string).length === 0) {
            throw new Error(`Syntax error in "${branch?.parent?.matchedText}": cannot create empty reference`);
        } else {
            return this.makeFreElementReferenceWithLocation(referred, typeName, branch);
        }
    }

    private makeFreElementReferenceWithLocation<T extends FreMetaLangElement>(referred: string | T, typeName: string, branch: SPPTBranch) {
        const result = MetaElementReference.create<T>(referred, typeName);
        const location = FreParseLocation.create({ filename: this.filename, line: branch.location.line, column: branch.location.column });
        result.aglParseLocation = location;
        return result;
    }

    /**
     * Generic method to transform lists
     */
    public transformSharedPackedParseTreeList<T>(branch: SPPTBranch, separator?: string): T[] {
        const result: T[] = [];
        const children = this.getChildren(branch);
        if (!!children) {
            for (const child of children) {
                const element: any = this.transformSharedPackedParseTreeNode(child);
                if (element !== null && element !== undefined) {
                    if (separator === null || separator === undefined) {
                        result.push(element);
                    } else {
                        if (element !== separator) {
                            result.push(element);
                        }
                    }
                }
            }
        }
        return result;
    }

    /**
     * Generic method to transform lists of references
     */
    public transformSharedPackedParseTreeRefList<T extends FreMetaLangElement>(
        branch: SPPTBranch,
        typeName: string,
        separator?: string
    ): MetaElementReference<T>[] {
        const result: MetaElementReference<T>[] = [];
        const children = this.getChildren(branch);
        if (!!children) {
            for (const child of children) {
                const refName: any = this.transformSharedPackedParseTreeNode(child);
                if (refName !== null && refName !== undefined) {
                    if (separator === null || separator === undefined) {
                        result.push(this.makeFreElementReferenceWithLocation(refName, typeName, branch));
                    } else {
                        if (refName !== separator) {
                            result.push(this.makeFreElementReferenceWithLocation(refName, typeName, branch));
                        }
                    }
                }
            }
        }
        return result;
    }

    public location(branch: net.akehurst.language.api.sppt.SPPTBranch) {
        return FreParseLocation.create({
            filename: this.filename,
            line: branch.location.line,
            column: branch.location.column
        });
    }
}
