import { RHSPropPartWithSeparator } from "./RHSPropPartWithSeparator";
import { RHSPropEntry } from "./RHSPropEntry";
import { PiProperty } from "../../../../languagedef/metalanguage";
import { internalTransformNode} from "../../ParserGenUtil";
import { makeIndent } from "../GrammarUtils";

export class RHSListGroup extends RHSPropPartWithSeparator {
    // `(${propTypeName} '${joinText}' )* /* option C */`
    private entry: RHSPropEntry;

    constructor(prop: PiProperty, entry: RHSPropEntry, separator: string) {
        super(prop, separator);
        this.entry = entry;
        this.isList = true;
    }

    toGrammar(): string {
        return `( ${this.entry.toGrammar()} '${this.separatorText}' )*\n\t`;
    }

    toMethod(propIndex: number, nodeName: string): string {
        return `// RHSListGroup  
            if (!${nodeName}[${propIndex}].isEmptyMatch) {          
                ${this.property.name} = [];
                for (const subNode of ${nodeName}[${propIndex}].nonSkipChildren.toArray()) {
                    ${this.property.name}.push(this.${internalTransformNode}(this.getGroup(subNode).nonSkipChildren.toArray()[0]));
                }
            }`;
    }

    toString(depth: number): string {
        let indent = makeIndent(depth + 1);
        return indent + "RHSListGroup: " + indent + this.entry.toString(depth + 1) + " " + this.separatorText;
    }
}