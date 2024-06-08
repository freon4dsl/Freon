import { FreMetaLanguage } from "../../languagedef/metalanguage";
import { FreGenericParser } from "../../utils";
import { ValidatorChecker } from "../metalanguage";
import { ValidatorDef } from "../metalanguage";
import { setCurrentFileName } from "./ValidatorCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";

import validatorParser  from "./ValidatorGrammar";

export class ValidatorParser extends FreGenericParser<ValidatorDef> {
    public language: FreMetaLanguage;

    constructor(language: FreMetaLanguage) {
        super();
        this.parser = validatorParser;
        this.language = language;
        this.checker = new ValidatorChecker(language);
    }

    protected merge(submodels: ValidatorDef[]): ValidatorDef {
        if (submodels.length > 0) {
            const result: ValidatorDef = submodels[0];
            const validatorName: string = submodels[0].validatorName;
            submodels.forEach((sub, index) => {
                if (index > 0) {
                     result.conceptRules.push(...sub.conceptRules);
                    // check whether all validatornames are equal
                     if (sub.validatorName !== validatorName) {
                         this.checker.errors.push(`The name of the validator defined in '${sub.location.filename}' is different from other .valid files.`);
                     }
                }
            });
            return result;
        } else {
            return null as any;
            // TODO rethink use of null, maybe make return type of function 'ValidatorDef | null'
        }
    }

    protected setCurrentFileName(file: string) {
        setCurrentFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
