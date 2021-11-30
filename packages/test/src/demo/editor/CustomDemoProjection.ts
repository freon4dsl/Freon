// Generated by the ProjectIt Language Generator.
import {
    PiProjection,
    PiElement,
    Box,
    createDefaultExpressionBox,
    KeyPressAction,
    TextBox,
    styleToCSS
} from "@projectit/core";
import * as projectitStyles from "../editor/styles/styles";
import { DemoNumberLiteralExpression } from "../language/gen";

export class CustomDemoProjection implements PiProjection {
    rootProjection: PiProjection;
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }

    getBox(element: PiElement): Box {
        if (element instanceof DemoNumberLiteralExpression) {
            return this.getDemoNumberLiteralExpressionBox(element);
        }

        return null;
    }

    public getDemoNumberLiteralExpressionBox(exp: DemoNumberLiteralExpression) {
        return createDefaultExpressionBox(exp, "number-literal", [
            new TextBox(exp, "num-literal-value", () => exp.value.toString(), (v: string) => (exp.value = Number.parseInt(v)), {
                deleteWhenEmpty: true,
                style: styleToCSS(projectitStyles.stringLiteral),
                keyPressAction: (currentText: string, key: string, index: number) => {
                    return isNumber(currentText, key, index);
                }
            })
        ]);
    }
}

function isNumber(currentText: string, key: string, index: number): KeyPressAction {
    if (isNaN(Number(key))) {
        if (index === currentText.length) {
            return KeyPressAction.GOTO_NEXT;
        } else {
            return KeyPressAction.NOT_OK;
        }
    } else {
        return KeyPressAction.OK;
    }
}
