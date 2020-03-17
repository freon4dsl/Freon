import { AllDemoConcepts, DemoAttributeType } from "../language";
import {
    DemoModel,
    DemoEntity,
    DemoAttribute,
    DemoFunction,
    DemoVariable,
    DemoExpression,
    DemoPlaceholderExpression,
    DemoLiteralExpression,
    DemoStringLiteralExpression,
    DemoNumberLiteralExpression,
    DemoBooleanLiteralExpression,
    DemoAbsExpression,
    DemoBinaryExpression,
    DemoMultiplyExpression,
    DemoPlusExpression,
    DemoDivideExpression,
    DemoAndExpression,
    DemoOrExpression,
    DemoComparisonExpression,
    DemoLessThenExpression,
    DemoGreaterThenExpression,
    DemoEqualsExpression,
    DemoFunctionCallExpression,
    DemoIfExpression,
    DemoVariableRef
} from "../language";
import { DemoTyper } from "../typer/DemoTyper";
import { PiValidator, PiError } from "@projectit/core"
import { DemoValidationChecker } from "./DemoValidationChecker";

export class DemoValidator implements PiValidator {
    typer = new DemoTyper();


    public validate(modelelement: AllDemoConcepts, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];

        if (modelelement instanceof DemoModel) {
            result.concat(this.validateDemoModel(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoEntity) {
            result.concat(this.validateDemoEntity(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAttribute) {
            result.concat(this.validateDemoAttribute(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoFunction) {
            result.concat(this.validateDemoFunction(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoVariable) {
            result.concat(this.validateDemoVariable(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoExpression) {
            result.concat(this.validateDemoExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoPlaceholderExpression) {
            result.concat(this.validateDemoPlaceholderExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoLiteralExpression) {
            result.concat(this.validateDemoLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoStringLiteralExpression) {
            result.concat(this.validateDemoStringLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoNumberLiteralExpression) {
            result.concat(this.validateDemoNumberLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoBooleanLiteralExpression) {
            result.concat(this.validateDemoBooleanLiteralExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAbsExpression) {
            result.concat(this.validateDemoAbsExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoBinaryExpression) {
            result.concat(this.validateDemoBinaryExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoMultiplyExpression) {
            result.concat(this.validateDemoMultiplyExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoPlusExpression) {
            result.concat(this.validateDemoPlusExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoDivideExpression) {
            result.concat(this.validateDemoDivideExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoAndExpression) {
            result.concat(this.validateDemoAndExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoOrExpression) {
            result.concat(this.validateDemoOrExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoComparisonExpression) {
            result.concat(this.validateDemoComparisonExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoLessThenExpression) {
            result.concat(this.validateDemoLessThenExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoGreaterThenExpression) {
            result.concat(this.validateDemoGreaterThenExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoEqualsExpression) {
            result.concat(this.validateDemoEqualsExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoFunctionCallExpression) {
            result.concat(this.validateDemoFunctionCallExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoIfExpression) {
            result.concat(this.validateDemoIfExpression(modelelement, includeChildren));
        }
        if (modelelement instanceof DemoVariableRef) {
            result.concat(this.validateDemoVariableRef(modelelement, includeChildren));
        }

        return result;
    }

    validateDemoModel(modelelement: DemoModel, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        result = new DemoValidationChecker().checkDemoModel(modelelement, this.typer);

        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.entities.forEach(p => {
                result.concat(this.validateDemoEntity(p, includeChildren));
            });
            modelelement.functions.forEach(p => {
                result.concat(this.validateDemoFunction(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoEntity(modelelement: DemoEntity, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            modelelement.attributes.forEach(p => {
                result.concat(this.validateDemoAttribute(p, includeChildren));
            });
            modelelement.functions.forEach(p => {
                result.concat(this.validateDemoFunction(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoAttribute(modelelement: DemoAttribute, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoFunction(modelelement: DemoFunction, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.expression, includeChildren));
            modelelement.parameters.forEach(p => {
                result.concat(this.validateDemoVariable(p, includeChildren));
            });
        }

        return result;
    }

    validateDemoVariable(modelelement: DemoVariable, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoExpression(modelelement: DemoExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoPlaceholderExpression(modelelement: DemoPlaceholderExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoLiteralExpression(modelelement: DemoLiteralExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoStringLiteralExpression(modelelement: DemoStringLiteralExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoNumberLiteralExpression(modelelement: DemoNumberLiteralExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoBooleanLiteralExpression(modelelement: DemoBooleanLiteralExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoAbsExpression(modelelement: DemoAbsExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.expr, includeChildren));
        }

        return result;
    }

    validateDemoBinaryExpression(modelelement: DemoBinaryExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.left, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.right, includeChildren));
        }

        return result;
    }

    validateDemoMultiplyExpression(modelelement: DemoMultiplyExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here
        result = new DemoValidationChecker().checkMultiplyExpression(modelelement, this.typer);
        // check rules of baseconcept(s)
        result.concat(this.validateDemoBinaryExpression(modelelement, includeChildren));
        return result;
    }

    validateDemoPlusExpression(modelelement: DemoPlusExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoDivideExpression(modelelement: DemoDivideExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoAndExpression(modelelement: DemoAndExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoOrExpression(modelelement: DemoOrExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoComparisonExpression(modelelement: DemoComparisonExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoLessThenExpression(modelelement: DemoLessThenExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoGreaterThenExpression(modelelement: DemoGreaterThenExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoEqualsExpression(modelelement: DemoEqualsExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoFunctionCallExpression(modelelement: DemoFunctionCallExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }

    validateDemoIfExpression(modelelement: DemoIfExpression, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        if (!(includeChildren === undefined) && includeChildren) {
            result.concat(this.validateDemoExpression(modelelement.condition, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.whenTrue, includeChildren));
            result.concat(this.validateDemoExpression(modelelement.whenFalse, includeChildren));
        }

        return result;
    }

    validateDemoVariableRef(modelelement: DemoVariableRef, includeChildren?: boolean): PiError[] {
        let result: PiError[] = [];
        // include validations here

        return result;
    }
}
