import {
    Names,
    FREON_CORE,
    EDITOR_FOLDER,
    VALIDATOR_GEN_FOLDER,
    TYPER_FOLDER,
    VALIDATOR_FOLDER,
    STDLIB_FOLDER,
    SCOPER_FOLDER,
} from "../../../utils/index.js";
import { FreMetaLanguage } from "../../metalanguage/index.js";

export class ConfigurationTemplate {
    generate(language: FreMetaLanguage, relativePath: string): string {
        const configurationName = Names.configuration;
        const workerName = Names.checkerInterface(language);
        return `
            import { ${Names.FreProjection}, ${Names.FreActions}, ${Names.FreTyperPart}, ${Names.FreStdlib}, ${Names.FrScoperPart} } from "${FREON_CORE}";
            import { ${Names.customActions(language)}, ${Names.customProjection(language)} } from "${relativePath}${EDITOR_FOLDER}/index.js";
            import { ${Names.customScoper(language)} } from "${relativePath}${SCOPER_FOLDER}/index.js";
            import { ${Names.customTyper(language)} } from "${relativePath}${TYPER_FOLDER}/${Names.customTyper(language)}.js";
            import { ${Names.customValidator(language)} } from "${relativePath}${VALIDATOR_FOLDER}/index.js";
            import { ${Names.customStdlib(language)} } from "${relativePath}${STDLIB_FOLDER}/${Names.customStdlib(language)}.js";
            import { ${workerName} } from "${relativePath}${VALIDATOR_GEN_FOLDER}/index.js";

            /**
             * Class ${configurationName} is the place where you can add all your customisations.
             * These will be used through the 'freonConfiguration' constant by any generated
             * part of your language environment.
             */
            class ${configurationName} {
                // add your custom editor projections here
                customProjection: ${Names.FreProjection}[] = [new ${Names.customProjection(language)}()];
                // add your custom editor actions here
                customActions: ${Names.FreActions}[] = [new ${Names.customActions(language)}()];
                // add your custom validations here
                customValidations: ${workerName}[] = [new ${Names.customValidator(language)}()];
                // add your custom scopers here
                customScopers: ${Names.FrScoperPart}[] = [new ${Names.customScoper(language)}()];
                // add your custom type-providers here
                customTypers: ${Names.FreTyperPart}[] = [new ${Names.customTyper(language)}()];
                // add extra predefined instances here
                customStdLibs: ${Names.FreStdlib}[] = [new ${Names.customStdlib(language)}()];
            }

            export const freonConfiguration = new ${configurationName}();
        `;
    }
}
