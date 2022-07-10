// Generated by the ProjectIt Language Generator.
import { PiProjection, PiActions, PiTyperPart, PiStdlib } from "@projectit/core";
import { CustomScoperTestActions, CustomScoperTestProjection } from "../editor";
import { CustomScoperTestTyperPart } from "../typer";
import { CustomScoperTestValidator } from "../validator";
import { CustomScoperTestStdlib } from "../stdlib";
import { ScoperTestCheckerInterface } from "../validator/gen";

/**
 * Class ProjectitConfiguration is the place where you can add all your customisations.
 * These will be used through the 'projectitConfiguration' constant by any generated
 * part of your language environment.
 */
class ProjectitConfiguration {
    // add your custom editor projections here
    customProjection: PiProjection[] = [new CustomScoperTestProjection("manual")];
    // add your custom editor actions here
    customActions: PiActions[] = [new CustomScoperTestActions()];
    // add your custom validations here
    customValidations: ScoperTestCheckerInterface[] = [new CustomScoperTestValidator()];
    // add your custom type-providers here
    customTypers: PiTyperPart[] = [new CustomScoperTestTyperPart()];
    // add extra predefined instances here
    customStdLibs: PiStdlib[] = [new CustomScoperTestStdlib()];
}

export const projectitConfiguration = new ProjectitConfiguration();