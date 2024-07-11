import { RHSPropEntry } from "./RHSPropEntry";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage";
import { makeIndent } from "../GrammarUtils";
import { ParserGenUtil } from "../../ParserGenUtil";

export class RHSBooleanWithSingleKeyWord extends RHSPropEntry {
    private readonly keyword: string = "";

    constructor(prop: FreMetaPrimitiveProperty, keyword: string) {
        super(prop);
        this.keyword = keyword;
        this.isList = false;
    }

    toGrammar(): string {
        return `'${this.keyword}'?` + this.doNewline();
    }

    toMethod(index: number, nodeName: string): string {
        return `// RHSBooleanWithSingleKeyWord
                if (!${nodeName}[${index}].isEmptyMatch) {
                    ${ParserGenUtil.internalName(this.property.name)} = true;
                }`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSBooleanWithKeyWord: " + this.property.name + ": " + this.keyword;
    }
}
