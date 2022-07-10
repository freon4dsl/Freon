// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@projectit/core";
import { CustomJsonActions, CustomJsonProjection } from "../editor";
import { CustomJsonTyperPart } from "../typer";
import { CustomJsonValidator } from "../validator";
import { CustomJsonStdlib } from "../stdlib";
import { JsonCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomJsonProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomJsonActions()];
    // add your custom validations here
    customValidations: JsonCheckerInterface[] = [new CustomJsonValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomJsonTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomJsonStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();