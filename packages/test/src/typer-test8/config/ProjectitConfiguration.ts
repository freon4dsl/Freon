// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@projectit/core";
import { CustomProjectYActions, CustomProjectYProjection } from "../editor";
import { CustomProjectYTyperPart } from "../typer";
import { CustomProjectYValidator } from "../validator";
import { CustomProjectYStdlib } from "../stdlib";
import { ProjectYCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomProjectYProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomProjectYActions()];
    // add your custom validations here
    customValidations: ProjectYCheckerInterface[] = [new CustomProjectYValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomProjectYTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomProjectYStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();