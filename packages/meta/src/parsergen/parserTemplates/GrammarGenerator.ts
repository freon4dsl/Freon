import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { BoolKeywords, FreEditProjectionGroup, FreEditUnit } from "../../editordef/metalanguage";
import { LimitedMaker } from "./LimitedMaker";
import { BinaryExpMaker } from "./BinaryExpMaker";
import { ChoiceRuleMaker } from "./ChoiceRuleMaker";
import { ConceptMaker } from "./ConceptMaker";
import { GrammarModel } from "./grammarModel";
import { LanguageAnalyser, FreAnalyser } from "./LanguageAnalyser";
import { GrammarPart } from "./grammarModel/GrammarPart";
import { LOG2USER, Names } from "../../utils";
import { ParserGenUtil } from "./ParserGenUtil";

export class GrammarGenerator {

    createGrammar(language: FreMetaLanguage, analyser: LanguageAnalyser, editUnit: FreEditUnit): GrammarModel | undefined{
        // create an empty model of the grammar and syntax analysis
        const grammar: GrammarModel = new GrammarModel(language);

        // add the standard option from the editor definition
        const defProjGroup: FreEditProjectionGroup | undefined = editUnit.getDefaultProjectiongroup();
        let stdBoolKeywords: BoolKeywords | undefined;
        let refSeparator: string | undefined;
        if (!!defProjGroup) {
            stdBoolKeywords = defProjGroup.standardBooleanProjection;
            refSeparator = defProjGroup.standardReferenceSeparator;
        }
        if (!!stdBoolKeywords) {
            grammar.trueValue = stdBoolKeywords.trueKeyword;
            grammar.falseValue = stdBoolKeywords.falseKeyword ? stdBoolKeywords.falseKeyword : '';
        }
        if (!!refSeparator) {
            grammar.refSeparator = refSeparator;
        }
        // find the projection group that can be used for the parser and unparser
        const projectionGroup:FreEditProjectionGroup | undefined = ParserGenUtil.findParsableProjectionGroup(editUnit);
        // if no projection group found, return
        if (!projectionGroup) {
            // todo better error message
            LOG2USER.error("No projection group found for generating a grammar.")
            return undefined;
        }

        // create the grammar rules and add them to the model
        this.createGrammarRules(grammar, projectionGroup, analyser);
        return grammar;
    }

    private createGrammarRules(grammar: GrammarModel, projectionGroup: FreEditProjectionGroup, myLanguageAnalyser: LanguageAnalyser) {
        // generate the rules for each unit
        for (const unitAnalyser of myLanguageAnalyser.unitAnalysers) {
            this.createRulesPerAnalyser(grammar, projectionGroup, unitAnalyser);
        }
        // do the same for the common analyser
        this.createRulesPerAnalyser(grammar, projectionGroup, myLanguageAnalyser.commonAnalyser);
    }

    private createRulesPerAnalyser(grammar: GrammarModel, projectionGroup: FreEditProjectionGroup, analyser: FreAnalyser) {
        const grammarPart: GrammarPart = new GrammarPart();
        if (!!analyser.unit) {
            grammarPart.unit = analyser.unit;
        }
        // create parse rules and syntax analysis methods for the concepts
        const conceptMaker: ConceptMaker = new ConceptMaker();
        grammarPart.rules.push(...conceptMaker.generateClassifiers(projectionGroup, analyser.classifiersUsed));

        // create parse rules and syntax analysis methods for the interfaces and abstracts
        const choiceRuleMaker: ChoiceRuleMaker = new ChoiceRuleMaker();
        grammarPart.rules.push(...choiceRuleMaker.generateChoiceRules(analyser.interfacesAndAbstractsUsed));

        // create parse rules and syntax analysis methods for the concepts that have sub-concepts
        grammarPart.rules.push(...choiceRuleMaker.generateSuperRules(analyser.conceptsWithSub));

        // create parse rules and syntax analysis methods for the binary expressions
        const binaryExpMaker: BinaryExpMaker = new BinaryExpMaker();
        // always use the default projection group for binary expressions
        let groupForBinaries: FreEditProjectionGroup = projectionGroup;
        if (projectionGroup.name !== Names.defaultProjectionName && !!projectionGroup.owningDefinition?.getDefaultProjectiongroup()) {
            groupForBinaries = projectionGroup.owningDefinition.getDefaultProjectiongroup()!;
        }
        if (analyser.binaryConceptsUsed.length > 0) {
            grammarPart.rules.push(...binaryExpMaker.generateBinaryExpressions(groupForBinaries, analyser.binaryConceptsUsed));
        }

        // create parse rules and syntax analysis methods for the limited concepts
        const limitedMaker: LimitedMaker = new LimitedMaker();
        grammarPart.rules.push(...limitedMaker.generateLimitedRules(analyser.limitedsReferred));

        // imports
        grammarPart.addToImports(analyser.classifiersUsed);
        grammarPart.addToImports(conceptMaker.imports);
        grammarPart.addToImports(choiceRuleMaker.imports);
        grammarPart.addToImports(limitedMaker.imports);
        grammarPart.addToImports(binaryExpMaker.imports);

        // add the rules to the grammar model
        grammar.parts.push(grammarPart);
    }
}
