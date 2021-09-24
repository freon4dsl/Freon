import {
    ListJoinType,
    PiEditConcept,
    PiEditProjectionItem, PiEditProjectionLine,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConcept,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType
} from "../../../languagedef/metalanguage";
import { Names } from "../../../utils";
import { ParserGenUtil } from "./ParserGenUtil";
import { ConceptRule, GrammarRule } from "./grammarModel/GrammarRules";
import {
    RHSBooleanWithKeyWord,
    RHSLimitedRefEntry,
    RHSLimitedRefListEntry,
    RHSLimitedRefListWithSeparator,
    RHSLimitedRefOptionalEntry,
    RHSListGroup,
    RHSOptionalGroup, RHSPartEntry, RHSPartListEntry, RHSPartListEntryWithSeparator, RHSPartOptionalEntry,
    RHSPrimEntry,
    RHSPrimListEntry,
    RHSPrimListEntryWithSeparator,
    RHSPrimOptionalEntry,
    RHSPropEntry, RHSRefEntry, RHSRefListEntry, RHSRefListWithSeparator, RHSRefOptionalEntry, RHSText,
    RightHandSideEntry
} from "./grammarModel/RHSEntries";


export class ConceptMaker {
    // generatedParseRules: string[] = [];
    // generatedSyntaxAnalyserMethods: string[] = [];
    // branchNames: string[] = [];
    imports: PiClassifier[] = [];

    generateConcepts(editUnit: PiEditUnit, conceptsUsed: PiConcept[]): GrammarRule[] {
        let rules: GrammarRule[] = [];
        for (const piConcept of conceptsUsed) {
            // find editDef for this concept
            const conceptDef: PiEditConcept = editUnit.findConceptEditor(piConcept);

            let rule: ConceptRule = new ConceptRule(piConcept);
            for(const l of conceptDef.projection.lines) {
                rule.ruleParts.push(...this.doLine(l, false));
            }
            rules.push(rule);
        }
        return rules;
    }

    private doLine(line: PiEditProjectionLine, inOptionalGroup: boolean): RightHandSideEntry[] {
        const subs = this.addItems(line.items, inOptionalGroup);
        // to manage the layout of the grammar, we set 'addNewLineToGrammar' of the last entry in the line
        subs[subs.length-1].addNewLineToGrammar = true;
        return subs;
    }

    private addItems(list: PiEditProjectionItem[], inOptionalGroup: boolean): RightHandSideEntry[] {
        let parts: RightHandSideEntry[] = [];
        if (!!list && list.length > 0) {
            list.forEach((item) => {
                if (item instanceof PiEditSubProjection) {
                    // TODO check: I expect exactly one property projection in a sub projection
                    // hack: item should be optional but it is not ????
                    // TODO find out why
                    // if (item.optional) {
                        // console.log(`found optional group for: ${item.optionalProperty().expression.findRefOfLastAppliedFeature().name}`);
                        parts.push(new RHSOptionalGroup(item.optionalProperty().expression.findRefOfLastAppliedFeature(), this.addItems(item.items, true)));
                    // } else {
                    //     console.error("XXXXXXXXXXXXX")
                    //     parts.push(new RHSGroup(this.addItems(item.items)));
                    // }
                } else if (item instanceof PiEditPropertyProjection) {
                    parts.push(this.makePropPart(item, inOptionalGroup));
                } else if (item instanceof PiEditProjectionText) {
                    parts.push(...this.makeTextPart(item));
                }
            });
        }
        return parts;
    }

    private makePropPart(item: PiEditPropertyProjection, inOptionalGroup: boolean): RHSPropEntry {
        const prop = item.expression.findRefOfLastAppliedFeature();
        if (!!prop) {
            const propType: PiClassifier = prop.type.referred; // more efficient to determine referred only once
            this.imports.push(propType);
            if (prop instanceof PiPrimitiveProperty) {
                if (propType === PiPrimitiveType.boolean && !!item.keyword) {
                    // TODO list???
                    return new RHSBooleanWithKeyWord(prop, item.keyword);
                } else if (!prop.isList) {
                    if (!prop.isOptional || inOptionalGroup) {
                        return new RHSPrimEntry(prop);
                    } else {
                        return new RHSPrimOptionalEntry(prop);
                    }
                } else {
                    let joinText = this.makeListJoinText(item.listJoin?.joinText);
                    if (joinText.length == 0) {
                        return new RHSPrimListEntry(prop); // propTypeName*
                    } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                        return new RHSPrimListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                    } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                        const sub1 = new RHSPrimEntry(prop);
                        return new RHSListGroup(prop, sub1, joinText);  // `(${propTypeName} '${joinText}' )* /* option C */`
                    }
                }
            } else if (propType instanceof PiLimitedConcept) {
                if (!prop.isList) {
                    if (!prop.isOptional || inOptionalGroup) {
                        return new RHSLimitedRefEntry(prop);
                    } else {
                        return new RHSLimitedRefOptionalEntry(prop);
                    }
                } else {
                    let joinText = this.makeListJoinText(item.listJoin?.joinText);
                    if (joinText.length == 0) {
                        return new RHSLimitedRefListEntry(prop); // propTypeName*
                    } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                        return new RHSLimitedRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                    } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                        const sub1 = new RHSLimitedRefEntry(prop);
                        return new RHSListGroup(prop, sub1, joinText);  // `(${propTypeName} '${joinText}' )* /* option C */`
                    }
                }
            } else if (propType instanceof PiBinaryExpressionConcept) {
                console.log("asking for a binary: " + propType.name)
                // TODO
            } else if (!prop.isList && prop.isPart && (!prop.isOptional || inOptionalGroup)) {           // (non-list, part, non-optional)
                return new RHSPartEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && prop.isPart && (prop.isOptional && !inOptionalGroup)) {            // (non-list, part, optional)
                return new RHSPartOptionalEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && !prop.isPart && (!prop.isOptional || inOptionalGroup)) {          // (non-list, reference, non-optional)
                return new RHSRefEntry(prop); //`${propTypeName} /* option E */`;
            } else if (!prop.isList && !prop.isPart && (prop.isOptional && !inOptionalGroup)) {           // (non-list, reference, optional)
                return new RHSRefOptionalEntry(prop); //`${propTypeName} /* option E */`;
            } else if (prop.isList && prop.isPart) {                                // (list, part, optionality not relevant)
                let joinText = this.makeListJoinText(item.listJoin?.joinText);
                if (joinText.length == 0) {
                    return new RHSPartListEntry(prop); // propTypeName*
                } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                    return new RHSPartListEntryWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSPartEntry(prop);
                    return new RHSListGroup(prop, sub1, joinText);  // `(${propTypeName} '${joinText}' )* /* option C */`
                }
            } else if (prop.isList && !prop.isPart) {                               // (list, reference, optionality not relevant)
                let joinText = this.makeListJoinText(item.listJoin?.joinText);
                if (joinText.length == 0) {
                    return new RHSRefListEntry(prop); // propTypeName*
                } else if (item.listJoin?.joinType === ListJoinType.Separator) {
                    return new RHSRefListWithSeparator(prop, joinText); // [ propTypeName / "joinText" ]
                } else if (item.listJoin?.joinType === ListJoinType.Terminator) {
                    const sub1 = new RHSRefEntry(prop);
                    return new RHSListGroup(prop, sub1, joinText);   // `(${propTypeName} '${joinText}' )* /* option C */`
                }
            }
        }
        return null;
    }

    private makeTextPart(item: PiEditProjectionText): RHSText[] {
        let result: RHSText[] = [];
        const trimmed = item.text.trim();
        let splitted: string[];
        if (trimmed.includes(" ")) { // we need to add a series of texts with whitespace between them
            splitted = trimmed.split(" ");
            splitted.forEach(str => {
                if (str.length > 0) {
                    result.push(new RHSText(`\'${ParserGenUtil.escapeRelevantChars(str)}\' `));
                }
            });
            return result;
        } else {
            if (trimmed.length > 0) {
                result.push(new RHSText(`\'${ParserGenUtil.escapeRelevantChars(trimmed)}\' `));
            }
        }
        return result;
    }

    private makeListJoinText(joinText: string): string {
        let result: string = "";
        if (!!joinText) {
            result = joinText.trimRight();
        }
        // TODO should test on all manners of whitespace
        if (result == "\\n" || result == "\\n\\n" || result == "\\t" || result == "\\r") {
            result = "";
        }
        return result;
    }
}
