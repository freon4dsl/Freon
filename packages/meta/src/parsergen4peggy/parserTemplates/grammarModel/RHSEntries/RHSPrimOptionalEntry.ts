import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPrimOptionalEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = false;
    }

    toGrammar(varName?: string): string {
        if (!varName || varName.length <= 0) {
            varName = ParserGenUtil.internalName(this.property.name);
        }
        return `ws ${varName}:${getPrimCall(this.property.type)}? ws` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        return `// RHSPrimOptionalEntry
                ${this.property.name}: ${ParserGenUtil.internalName(this.property.name)}
            `;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimEntry: " + this.property.name;
    }
}