// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@projectit/core";
import { CustomParserOnConceptsActions, CustomParserOnConceptsProjection } from "../editor";
import { CustomParserOnConceptsTyperPart } from "../typer";
import { CustomParserOnConceptsValidator } from "../validator";
import { CustomParserOnConceptsStdlib } from "../stdlib";
import { ParserOnConceptsCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomParserOnConceptsProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomParserOnConceptsActions()];
    // add your custom validations here
    customValidations: ParserOnConceptsCheckerInterface[] = [new CustomParserOnConceptsValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomParserOnConceptsTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomParserOnConceptsStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();