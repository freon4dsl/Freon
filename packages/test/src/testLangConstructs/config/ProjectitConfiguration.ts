// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@projectit/core";
import { CustomLangConstructsActions, CustomLangConstructsProjection } from "../editor";
import { CustomLangConstructsTyperPart } from "../typer";
import { CustomLangConstructsValidator } from "../validator";
import { CustomLangConstructsStdlib } from "../stdlib";
import { LangConstructsCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomLangConstructsProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomLangConstructsActions()];
    // add your custom validations here
    customValidations: LangConstructsCheckerInterface[] = [new CustomLangConstructsValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomLangConstructsTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomLangConstructsStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();