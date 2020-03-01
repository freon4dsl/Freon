// Generated by the ProjectIt Language Generator.
import * as uuid from "uuid";
import { WithType } from "./WithType";
import { PiElement, PiExpression, PiBinaryExpression } from "@projectit/core";
import { model, observablepart } from "@projectit/model";
import { LanguageConceptType } from "./Language";
import { DemoExpression } from "./DemoExpression";
import { DemoAttributeType } from "./DemoAttributeType";
import { DemoType } from "./DemoType";
import { DemoPlaceholderExpression } from "./DemoPlaceholderExpression";

@model
export abstract class DemoBinaryExpression extends DemoExpression implements PiBinaryExpression, WithType {
    readonly $type: LanguageConceptType = "DemoBinaryExpression";

    constructor(id?: string) {
        super(id);

        this.left = new DemoPlaceholderExpression();
        this.right = new DemoPlaceholderExpression();
    }

    @observablepart left: DemoExpression = new DemoPlaceholderExpression();

    @observablepart right: DemoExpression = new DemoPlaceholderExpression();

    get$Type(): LanguageConceptType {
        return this.$type;
    }

    piIsExpression(): boolean {
        return true;
    }

    piIsBinaryExpression(): boolean {
        return true;
    }

    piIsExpressionPlaceHolder(): boolean {
        return false;
    }

    public piSymbol(): string {
        return "unknown";
    }

    piPriority(): number {
        return -1;
    }

    public piLeft(): DemoExpression {
        return this.left;
    }

    public piRight(): DemoExpression {
        return this.right;
    }

    public piSetLeft(value: DemoExpression): void {
        this.left = value;
    }

    public piSetRight(value: DemoExpression): void {
        this.right = value;
    }
}
