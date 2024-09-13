import { RHSPropEntry } from "./RHSPropEntry.js";
import { FreMetaPrimitiveProperty } from "../../../../languagedef/metalanguage/index.js";
import { getPrimCall, makeIndent } from "../GrammarUtils.js";
import { ParserGenUtil } from "../../ParserGenUtil.js";

export class RHSPrimListEntry extends RHSPropEntry {
    constructor(prop: FreMetaPrimitiveProperty) {
        super(prop);
        this.isList = true;
    }

    toGrammar(varName?: string): string {
        if (!varName || varName.length <= 0) {
            varName = ParserGenUtil.internalName(this.property.name);
        }
        return `${varName}:${getPrimCall(this.property.type)}*` + this.doNewline();
    }

    // @ts-ignore
    toMethod(index: number, nodeName: string, mainAnalyserName: string): string {
        // const baseType: string = GenerationUtil.getBaseTypeAsString(this.property);
        return `${this.property.name}: ${ParserGenUtil.internalName(this.property.name)} // RHSPrimListEntry\n`;
    }

    toString(depth: number): string {
        const indent = makeIndent(depth);
        return indent + "RHSPrimListEntry: " + this.property.name;
    }
}