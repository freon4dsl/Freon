// Generated by the Freon Language Generator.
import { FreNode, FreType, FreTyper } from "@projectit/core";
import { DemoEnvironment } from "../config/gen/DemoEnvironment";
import { DemoEntity } from "../language/gen";

/**
 * Class 'CustomDemoTyperPart' is meant to be a convient place to add any
 * custom code for type checking.
 */
export class CustomDemoTyperPart implements FreTyper {
    mainTyper: FreTyper;

    isType(modelelement: FreNode): boolean | null {
        return null;
    }

    inferType(modelelement: FreNode): FreType | null {
        return null;
    }

    equals(type1: FreType, type2: FreType): boolean | null {
        return null;
    }

    conforms(type1: FreType, type2: FreType): boolean | null {
        return null;
    }

    conformsList(typelist1: FreType[], typelist2: FreType[]): boolean | null {
        // console.log(`Third level is called, length: ${typelist1.length}, kind: ${typelist1[0].$typename}`);
        if (typelist1.length > 0 && (typelist1[0].toAstElement() instanceof DemoEntity)) {
            if (typelist1.length !== typelist2.length) {
                return false;
            }
            let result: boolean = true;
            const maxLength = typelist1.length;
            for (let i = 0; i < maxLength; i++) {
                // console.log(`comparing typelist1[${i}]: ${(typelist1[i]).toAstElement()?.piId()} with typelist2[${maxLength - i - 1}]: ${typelist2[maxLength - i -1].toAstElement()?.piId()}`);
                result = DemoEnvironment.getInstance().typer.conforms(typelist1[i], typelist2[maxLength - i - 1]);
                if (result === false) {
                    return result;
                }
            }
            return result;
        } else {
            return null;
        }
    }

    commonSuper(typelist: FreType[]): FreType | null {
        return null;
    }

    public getSuperTypes(type: FreType): FreType[] | null {
        return null;
    }
}
