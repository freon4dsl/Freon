import { PiLanguage } from "../../languagedef/metalanguage";
import { PiParser } from "../../utils";

const editorParser = require("./PiEditGrammar");
import { setCurrentFileName as editFileName } from "./NewPiEditCreators";
import { setCurrentFileName as expressionFileName } from "../../languagedef/parser/ExpressionCreators";
import { PiEditUnit } from "../metalanguage/NewPiEditDefLang";
import { NewPiEditChecker } from "../metalanguage/NewPiEditChecker";

export class PiEditParser extends PiParser<PiEditUnit> {
    language: PiLanguage;

    constructor(language: PiLanguage) {
        super();
        this.language = language;
        this.parser = editorParser;
        this.checker = new NewPiEditChecker(language);
    }

    protected merge(submodels: PiEditUnit[]): PiEditUnit {
        if (submodels.length > 0) {
            const result: PiEditUnit = submodels[0];
            submodels.forEach((sub, index) => {
                if (index > 0) {
                    result.projectiongroups.push(...sub.projectiongroups);
                }
            });
            return result;
        } else {
            return null;
        }
    }

    protected setCurrentFileName(file: string) {
        editFileName(file);
        expressionFileName(file);
    }

    protected getNonFatalParseErrors(): string[] {
        return [];
    }
}
