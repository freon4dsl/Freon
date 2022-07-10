import { PiEditor } from "../editor";
import { PiValidator } from "../validator";
import { PiScoper } from "../scoper";
import { PiTyper } from "../typer";
import { PiStdlib } from "../stdlib";
import { PiWriter } from "../writer";
import { PiReader } from "../reader";
import { PiModel } from "../ast";

export interface PiEnvironment {
    /**
     * Creates a new model, an implementation of the language defined in the .ast file
     * @param name
     */
    newModel(modelName: string): PiModel;

    scoper: PiScoper;
    typer: PiTyper;
    validator: PiValidator;
    editor: PiEditor;
    stdlib: PiStdlib;
    writer: PiWriter;
    reader: PiReader;

    languageName: string;
    fileExtensions: Map<string, string>;
}

