// Generated by the ProjectIt Language Generator.
import { observable } from "mobx";
import * as uuid from "uuid";
import { WithType } from "./WithType";
import { PiElement, PiExpression, PiBinaryExpression } from "@projectit/core";
import { model } from "@projectit/model";
import { LanguageConceptType } from "./Language";
import { DemoAttributeType } from "./DemoAttributeType";
import { DemoType } from "./DemoType";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";
import { DemoExpression } from "./DemoExpression";
import { DemoLiteralExpression } from "./DemoLiteralExpression";

@model
export class DemoStringLiteralExpression extends DemoLiteralExpression implements PiExpression, WithType {
    readonly $type: LanguageConceptType = "DemoStringLiteralExpression";

    constructor(id?: string) {
        super(id);
    }

    @observable value: string;

    get$Type(): LanguageConceptType {
        return this.$type;
    }

    piIsExpression(): boolean {
        return true;
    }

    piIsBinaryExpression(): boolean {
        return false;
    }

    piIsExpressionPlaceHolder(): boolean {
        return false;
    }
}
