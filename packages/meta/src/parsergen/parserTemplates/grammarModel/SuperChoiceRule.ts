import { GrammarRule } from "./GrammarRule";
import { PiBinaryExpressionConcept, PiClassifier } from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { BinaryExpMaker } from "../BinaryExpMaker";
import { internalTransformNode, ParserGenUtil } from "../ParserGenUtil";

export class SuperChoiceRule extends GrammarRule {
    // the same as ChoiceRule, except that the call to the implementors is never to '__pi_super_...'
    implementors: PiClassifier[];
    myConcept: PiClassifier;

    constructor(ruleName: string, myConcept: PiClassifier, implementors: PiClassifier[]) {
        super();
        this.ruleName = ruleName;
        this.implementors = implementors;
        this.myConcept = myConcept;
    }

    toGrammar(): string {
        let rule: string = "";
        if (this.implementors.length > 0) {
            // test to see if there is a binary expression concept here
            let implementorsNoBinaries = this.implementors.filter(sub => !(sub instanceof PiBinaryExpressionConcept));
            if (this.implementors.length != implementorsNoBinaries.length) { // there are binaries
                // exclude binary expression concepts
                rule = `${(this.ruleName)} = ${implementorsNoBinaries.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")}`;
                // add the special binary concept rule as choice
                rule += `\n    | ${BinaryExpMaker.specialBinaryRuleName} ;`;
            } else {
                // normal choice rule
                rule = `${(this.ruleName)} = ${this.implementors.map(implementor =>
                    `${Names.classifier(implementor)} `).join("\n    | ")} ;`;
            }
        } else {
            rule = `${this.ruleName} = 'ERROR' ; // there are no concepts that implement this interface or extend this abstract concept`;
        }
        return rule;
    }

    toMethod(): string {
        return `
            ${ParserGenUtil.makeComment(this.toGrammar())}
            private transform${this.ruleName}(branch: SPPTBranch) : ${Names.classifier(this.myConcept)} {
                // console.log('transform${this.ruleName} called: ' + branch.name);
                return this.${internalTransformNode}(branch.nonSkipChildren.toArray()[0]);
            }`;
    }
}