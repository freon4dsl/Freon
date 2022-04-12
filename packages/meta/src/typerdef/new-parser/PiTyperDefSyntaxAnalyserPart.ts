// Generated by the ProjectIt Language Generator.
import { net } from "net.akehurst.language-agl-processor";
import SPPTBranch = net.akehurst.language.api.sppt.SPPTBranch;
import {
    PiElementReference,
    PiClassifier,
    PiLimitedConcept,
    PiInstance, PiProperty, PiConcept
} from "../../languagedef/metalanguage";
import {
    PiTyperDef,
    PitAnyTypeSpec,
    PitPropertyCallExp,
    PitSelfExp,
    PitAnytypeExp,
    PitLimitedInstanceExp,
    PitWhereExp,
    PitFunctionCallExp,
    PitInferenceRule,
    PitLimitedRule,
    PitExp,
    PitProperty,
    PitEqualsExp,
    PitConformsExp
} from "../new-metalanguage";
import { PiTyperSyntaxAnalyser } from "./PiTyperSyntaxAnalyser";
import { PiParseLocation } from "../../utils";
import { PitTypeConcept } from "../new-metalanguage/PitTypeConcept";
import { PitClassifierSpec } from "../new-metalanguage/PitClassifierSpec";
import { PitTypeRule } from "../new-metalanguage/PitTypeRule";
import { PitVarCallExp } from "../new-metalanguage/expressions/PitVarCallExp";
import { PitVarDecl } from "../new-metalanguage/PitVarDecl";
import { PitCreateExp } from "../new-metalanguage/expressions/PitCreateExp";
import { PitPropInstance } from "../new-metalanguage/PitPropInstance";
import { PitBinaryExp } from "../new-metalanguage/expressions/PitBinaryExp";
import { PitConformanceRule } from "../new-metalanguage/PitConformanceRule";
import { PitEqualsRule } from "../new-metalanguage/PitEqualsRule";

export class PiTyperDefSyntaxAnalyserPart {
    mainAnalyser: PiTyperSyntaxAnalyser;

    constructor(mainAnalyser: PiTyperSyntaxAnalyser) {
        this.mainAnalyser = mainAnalyser;
    }

    /**
     * Method to transform branches that match the following rule:
     * PiTyperDef = 'typer'
     *	 ( 'istype' '\{' [ __pi_reference / ',' ]* '}' )?
     *	 PitTypeConcept*
     *	 ( 'hastype' '\{' [ __pi_reference / ',' ]* '}' )?
     *	 PitAnyTypeSpec?
     *	 PitClassifierSpec* ;
     * @param branch
     * @private
     */
    public transformPiTyperDef(branch: SPPTBranch): PiTyperDef {
        // console.log('transformPiTyperDef called: ' + branch.name);
        let __types: PiElementReference<PiClassifier>[];
        let __typeConcepts: PitTypeConcept[];
        let __conceptsWithType: PiElementReference<PiClassifier>[];
        let __anyTypeSpec: PitAnyTypeSpec;
        let __classifierSpecs: PitClassifierSpec[];
        const children = this.mainAnalyser.getChildren(branch);
        if (!children[1].isEmptyMatch) {
            // RHSOptionalGroup
            const _optGroup = this.mainAnalyser.getGroup(children[1]);
            const _propItem = this.mainAnalyser.getChildren(_optGroup);

            __types = this.mainAnalyser.transformSharedPackedParseTreeRefList<PiClassifier>(_propItem[2], "PiClassifier", ","); // RHSRefListWithSeparator
        } // RHSPartListEntry
        if (children[2].name !== "PitTypeConcept") {
            __typeConcepts = this.mainAnalyser.transformSharedPackedParseTreeList<PitTypeConcept>(children[2]);
        } else {
            // special case: only when this entry is the single rhs entry of this rule
            __typeConcepts = [];
            for (const child of children) {
                __typeConcepts.push(this.mainAnalyser.transformSharedPackedParseTreeNode(child));
            }
        }
        if (!children[3].isEmptyMatch) {
            // RHSOptionalGroup
            const _optGroup = this.mainAnalyser.getGroup(children[3]);
            const _propItem = this.mainAnalyser.getChildren(_optGroup);

            __conceptsWithType = this.mainAnalyser.transformSharedPackedParseTreeRefList<PiClassifier>(_propItem[2], "PiClassifier", ","); // RHSRefListWithSeparator
        }
        if (!children[4].isEmptyMatch) {
            // RHSOptionalGroup
            const _optBranch = this.mainAnalyser.getChildren(children[4]);
            __anyTypeSpec = this.mainAnalyser.transformSharedPackedParseTreeNode(_optBranch[0]); // RHSPartEntry
        } // RHSPartListEntry
        if (children[5].name !== "PitClassifierSpec") {
            __classifierSpecs = this.mainAnalyser.transformSharedPackedParseTreeList<PitClassifierSpec>(children[5]);
        } else {
            // special case: only when this entry is the single rhs entry of this rule
            __classifierSpecs = [];
            for (const child of children) {
                __classifierSpecs.push(this.mainAnalyser.transformSharedPackedParseTreeNode(child));
            }
        }
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PiTyperDef.create({
            __types: __types,
            typeConcepts: __typeConcepts,
            __conceptsWithType: __conceptsWithType,
            anyTypeSpec: __anyTypeSpec,
            classifierSpecs: __classifierSpecs,
            agl_location: location
        });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitTypeConcept = 'type' identifier ( 'base' __pi_reference )?
     *	 '\{'
     *	 ( PitProperty ';' )*
     *	 '}' ;
     * @param branch
     * @private
     */
    public transformPitTypeConcept(branch: SPPTBranch): PitTypeConcept {
        // console.log('transformPitTypeConcept called: ' + branch.name);
        let __name: string;
        let __base: PiElementReference<PiConcept>;
        let __properties: PitProperty[];
        const children = this.mainAnalyser.getChildren(branch);
        __name = this.mainAnalyser.transformSharedPackedParseTreeNode(children[1]); // RHSPrimEntry

        if (!children[2].isEmptyMatch) {
            // RHSOptionalGroup
            const _optGroup = this.mainAnalyser.getGroup(children[2]);
            const _propItem = this.mainAnalyser.getChildren(_optGroup);
            __base = this.mainAnalyser.piElemRef<PiConcept>(_propItem[1], "PiConcept"); // RHSRefEntry
        } // RHSListGroup
        __properties = [];
        const _myList = this.mainAnalyser.getChildren(children[4]);
        _myList.forEach(subNode => {
            const _transformed = this.mainAnalyser.transformSharedPackedParseTreeNode(subNode.nonSkipChildren?.toArray()[0]);
            if (!!_transformed) {
                __properties.push(_transformed);
            }
        });
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitTypeConcept.create({ name: __name, base: __base, properties: __properties, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitAnyTypeSpec = 'anytype' '\{'
     *	 PitTypeRule*
     *	 '}' ;
     * @param branch
     * @private
     */
    public transformPitAnyTypeSpec(branch: SPPTBranch): PitAnyTypeSpec {
        // console.log('transformPitAnyTypeSpec called: ' + branch.name);
        let __rules: PitTypeRule[];
        const children = this.mainAnalyser.getChildren(branch); // RHSPartListEntry
        if (children[2].name !== "PitTypeRule") {
            __rules = this.mainAnalyser.transformSharedPackedParseTreeList<PitTypeRule>(children[2]);
        } else {
            // special case: only when this entry is the single rhs entry of this rule
            __rules = [];
            for (const child of children) {
                __rules.push(this.mainAnalyser.transformSharedPackedParseTreeNode(child));
            }
        }
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitAnyTypeSpec.create({ rules: __rules, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitInferenceRule = 'infertype' PitExp ';' ;
     * @param branch
     * @private
     */
    public transformPitInferenceRule(branch: SPPTBranch): PitInferenceRule {
        // console.log('transformPitInferenceRule called: ' + branch.name);
        let __exp: PitExp;
        const children = this.mainAnalyser.getChildren(branch);
        __exp = this.mainAnalyser.transformSharedPackedParseTreeNode(children[1]); // RHSPartEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitInferenceRule.create({ exp: __exp, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitPropertyCallExp = PitExp '.' __pi_reference ;
     * @param branch
     * @private
     */
    public transformPitPropertyCallExp(branch: SPPTBranch): PitPropertyCallExp {
        // console.log('transformPitPropertyCallExp called: ' + branch.name);
        let __source: PitExp;
        let __property: PiElementReference<PiProperty>;
        const children = this.mainAnalyser.getChildren(branch);
        __source = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPartEntry
        __property = this.mainAnalyser.piElemRef<PiProperty>(children[2], "PiProperty"); // RHSRefEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitPropertyCallExp.create({ source: __source, __property: __property, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitSelfExp = 'self' ;
     * @param branch
     * @private
     */
    public transformPitSelfExp(branch: SPPTBranch): PitSelfExp {
        // console.log('transformPitSelfExp called: ' + branch.name);

        const children = this.mainAnalyser.getChildren(branch);
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitSelfExp.create({ agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitAnytypeExp = 'anytype' ;
     * @param branch
     * @private
     */
    public transformPitAnytypeExp(branch: SPPTBranch): PitAnytypeExp {
        // console.log('transformPitAnytypeExp called: ' + branch.name);

        const children = this.mainAnalyser.getChildren(branch);
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitAnytypeExp.create({ agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitVarCallExp = __pi_reference ;
     * @param branch
     * @private
     */
    public transformPitVarCallExp(branch: SPPTBranch): PitVarCallExp {
        // console.log('transformPitVarCallExp called: ' + branch.name);
        let __variable: PiElementReference<PitVarDecl>;
        const children = this.mainAnalyser.getChildren(branch);
        __variable = this.mainAnalyser.piElemRef<PitVarDecl>(children[0], "PitVarDecl"); // RHSRefEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitVarCallExp.create({ __variable: __variable, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitCreateExp = __pi_reference '\{' [ PitPropInstance / ',' ]* '}' ;
     * @param branch
     * @private
     */
    public transformPitCreateExp(branch: SPPTBranch): PitCreateExp {
        // console.log('transformPitCreateExp called: ' + branch.name);
        let __type: PiElementReference<PiClassifier>;
        let __propertyDefs: PitPropInstance[];
        const children = this.mainAnalyser.getChildren(branch);
        __type = this.mainAnalyser.piElemRef<PiClassifier>(children[0], "PiClassifier"); // RHSRefEntry
        __propertyDefs = this.mainAnalyser.transformSharedPackedParseTreeList<PitPropInstance>(children[2], ","); // RHSPartListWithSeparator

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitCreateExp.create({ __type: __type, propertyDefs: __propertyDefs, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitPropInstance = __pi_reference ':' PitExp ;
     * @param branch
     * @private
     */
    public transformPitPropInstance(branch: SPPTBranch): PitPropInstance {
        // console.log('transformPitPropInstance called: ' + branch.name);
        let __property: PiElementReference<PiProperty>;
        let __value: PitExp;
        const children = this.mainAnalyser.getChildren(branch);
        __property = this.mainAnalyser.piElemRef<PiProperty>(children[0], "PiProperty"); // RHSRefEntry
        __value = this.mainAnalyser.transformSharedPackedParseTreeNode(children[2]); // RHSPartEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitPropInstance.create({ __property: __property, value: __value, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitFunctionCallExp = identifier '(' [ PitExp / ',' ]* ')' ;
     * @param branch
     * @private
     */
    public transformPitFunctionCallExp(branch: SPPTBranch): PitFunctionCallExp {
        // console.log('transformPitFunctionCallExp called: ' + branch.name);
        let __calledFunction: string;
        let __arguments: PitExp[];
        const children = this.mainAnalyser.getChildren(branch);
        __calledFunction = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPrimEntry
        __arguments = this.mainAnalyser.transformSharedPackedParseTreeList<PitExp>(children[2], ","); // RHSPartListWithSeparator

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitFunctionCallExp.create({ calledFunction: __calledFunction, actualParameters: __arguments, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitLimitedInstanceExp = ( __pi_reference ':' )?
     *	 __pi_reference ;
     * @param branch
     * @private
     */
    public transformPitLimitedInstanceExp(branch: SPPTBranch): PitLimitedInstanceExp {
        // console.log('transformPitLimitedInstanceExp called: ' + branch.name);
        let __myLimited: PiElementReference<PiLimitedConcept>;
        let __myInstance: PiElementReference<PiInstance>;
        const children = this.mainAnalyser.getChildren(branch);
        if (!children[0].isEmptyMatch) {
            // RHSOptionalGroup
            const _optGroup = this.mainAnalyser.getGroup(children[0]);
            const _propItem = this.mainAnalyser.getChildren(_optGroup);
            __myLimited = this.mainAnalyser.piElemRef<PiLimitedConcept>(_propItem[0], "PiLimitedConcept"); // RHSRefEntry
        }
        __myInstance = this.mainAnalyser.piElemRef<PiInstance>(children[1], "PiInstance"); // RHSRefEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitLimitedInstanceExp.create({ __myLimited: __myLimited, __myInstance: __myInstance, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitWhereExp = PitVarDecl 'where' '\{'
     *	 ( __pi_binary_PitExp ';' )*
     *	 '}' ;
     * @param branch
     * @private
     */
    public transformPitWhereExp(branch: SPPTBranch): PitWhereExp {
        // console.log('transformPitWhereExp called: ' + branch.name);
        let __variable: PitVarDecl;
        let __conditions: PitBinaryExp[];
        const children = this.mainAnalyser.getChildren(branch);
        __variable = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPartEntry
        // RHSBinExpListWithTerminator
        __conditions = [];
        const _myList = this.mainAnalyser.getChildren(children[3]);
        _myList.forEach(subNode => {
            const _transformed = this.mainAnalyser.transformSharedPackedParseTreeNode(subNode.nonSkipChildren?.toArray()[0]);
            if (!!_transformed) {
                __conditions.push(_transformed);
            }
        });
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitWhereExp.create({ variable: __variable, conditions: __conditions, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitVarDecl = identifier ':' __pi_reference ;
     * @param branch
     * @private
     */
    public transformPitVarDecl(branch: SPPTBranch): PitVarDecl {
        // console.log('transformPitVarDecl called: ' + branch.name);
        let __name: string;
        let __type: PiElementReference<PiClassifier>;
        const children = this.mainAnalyser.getChildren(branch);
        __name = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPrimEntry
        __type = this.mainAnalyser.piElemRef<PiClassifier>(children[2], "PiClassifier"); // RHSRefEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitVarDecl.create({ name: __name, __type: __type, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitConformanceRule = 'conformsto' PitExp ';' ;
     * @param branch
     * @private
     */
    public transformPitConformanceRule(branch: SPPTBranch): PitConformanceRule {
        // console.log('transformPitConformanceRule called: ' + branch.name);
        let __exp: PitExp;
        const children = this.mainAnalyser.getChildren(branch);
        __exp = this.mainAnalyser.transformSharedPackedParseTreeNode(children[1]); // RHSPartEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitConformanceRule.create({ exp: __exp, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitEqualsRule = 'equalsto' PitExp ';' ;
     * @param branch
     * @private
     */
    public transformPitEqualsRule(branch: SPPTBranch): PitEqualsRule {
        // console.log('transformPitEqualsRule called: ' + branch.name);
        let __exp: PitExp;
        const children = this.mainAnalyser.getChildren(branch);
        __exp = this.mainAnalyser.transformSharedPackedParseTreeNode(children[1]); // RHSPartEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitEqualsRule.create({ exp: __exp, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitLimitedRule = PitExp ';' ;
     * @param branch
     * @private
     */
    public transformPitLimitedRule(branch: SPPTBranch): PitLimitedRule {
        // console.log('transformPitLimitedRule called: ' + branch.name);
        let __exp: PitExp;
        const children = this.mainAnalyser.getChildren(branch);
        __exp = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPartEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitLimitedRule.create({ exp: __exp, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitClassifierSpec = __pi_reference '\{'
     *	 PitTypeRule*
     *	 '}' ;
     * @param branch
     * @private
     */
    public transformPitClassifierSpec(branch: SPPTBranch): PitClassifierSpec {
        // console.log('transformPitClassifierSpec called: ' + branch.name);
        let __myClassifier: PiElementReference<PiClassifier>;
        let __rules: PitTypeRule[];
        const children = this.mainAnalyser.getChildren(branch);
        __myClassifier = this.mainAnalyser.piElemRef<PiClassifier>(children[0], "PiClassifier"); // RHSRefEntry
        // RHSPartListEntry
        if (children[2].name !== "PitTypeRule") {
            __rules = this.mainAnalyser.transformSharedPackedParseTreeList<PitTypeRule>(children[2]);
        } else {
            // special case: only when this entry is the single rhs entry of this rule
            __rules = [];
            for (const child of children) {
                __rules.push(this.mainAnalyser.transformSharedPackedParseTreeNode(child));
            }
        }
        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitClassifierSpec.create({ __myClassifier: __myClassifier, rules: __rules, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitProperty = identifier ':' __pi_reference ;
     * @param branch
     * @private
     */
    public transformPitProperty(branch: SPPTBranch): PitProperty {
        // console.log('transformPitProperty called: ' + branch.name);
        let __name: string;
        let __type: PiElementReference<PiClassifier>;
        const children = this.mainAnalyser.getChildren(branch);
        __name = this.mainAnalyser.transformSharedPackedParseTreeNode(children[0]); // RHSPrimEntry
        __type = this.mainAnalyser.piElemRef<PiClassifier>(children[2], "PiClassifier"); // RHSRefEntry

        const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
        return PitProperty.create({ name: __name, refType: __type, agl_location: location });
    }

    /**
     * Method to transform branches that match the following rule:
     * PitTypeRule = PitInferenceRule
     *    | PitConformanceRule
     *    | PitEqualsRule
     *    | PitLimitedRule  ;
     * @param branch
     * @private
     */
    public transformPitTypeRule(branch: SPPTBranch): PitTypeRule {
        // console.log('transformPitTypeRule called: ' + branch.name);
        return this.mainAnalyser.transformSharedPackedParseTreeNode(branch.nonSkipChildren.toArray()[0]);
    }

    /**
     * Method to transform branches that match the following rule:
     * PitExp = PitPropertyCallExp
     *    | PitSelfExp
     *    | PitAnytypeExp
     *    | PitVarCallExp
     *    | PitCreateExp
     *    | PitLimitedInstanceExp
     *    | PitWhereExp
     *    | PitFunctionCallExp
     *    | __pi_binary_PitExp ;
     * @param branch
     * @private
     */
    public transformPitExp(branch: SPPTBranch): PitExp {
        // console.log('transformPitExp called: ' + branch.name);
        return this.mainAnalyser.transformSharedPackedParseTreeNode(branch.nonSkipChildren.toArray()[0]);
    }

    /**
     * Generic method to transform binary expressions, which are parsed
     * according to these rules:
     * __pi_binary_PitExp = [PitExp / __pi_binary_operator]2+ ;
     * leaf __pi_binary_operator = 'conformsto' | 'equalsto' ;
     *
     * In this method we build a crooked tree, which in a later phase needs to be balanced
     * according to the priorities of the operators.
     * @param branch
     * @private
     */
    public transform__pi_binary_PitExp(branch: SPPTBranch): PitExp {
        // console.log('transform__pi_binary_PitExp called: ' + branch.name);
        const children = branch.nonSkipChildren.toArray();
        let index = 0;
        let first = this.mainAnalyser.transformSharedPackedParseTreeNode(children[index++]);
        while (index < children.length) {
            let operator = this.mainAnalyser.transformSharedPackedParseTreeNode(children[index++]);
            let second = this.mainAnalyser.transformSharedPackedParseTreeNode(children[index++]);
            let combined: PitExp = null;
            const location = PiParseLocation.create({filename: this.mainAnalyser.filename, line: branch.location.line, column: branch.location.column});
            switch (operator) {
                case "equalsto": {
                    combined = PitEqualsExp.create({ left: first, right: second, agl_location: location });
                    break;
                }
                case "conformsto": {
                    combined = PitConformsExp.create({ left: first, right: second, agl_location: location });
                    break;
                }
                default: {
                    combined = null;
                }
            }
            first = combined;
        }
        return first;
    }
}
