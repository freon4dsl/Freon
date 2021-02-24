// Generated by the ProjectIt Language Generator.
import {
    KeyboardShortcutBehavior,
    PiBinaryExpressionCreator,
    PiCustomBehavior,
    PiExpressionCreator,
    PiActions,
    Box, PiTriggerType, PiEditor, AliasBox, isAliasBox, isOptionalBox, PiElement
} from "@projectit/core";
import { PiCaret } from "@projectit/core";
import { AttributeRef, NumberLiteralExpression, ParameterRef } from "../language/gen";

/**
 * Class CustomExampleActions provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These custom build additions are merged with the default and definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */

export class CustomExampleActions implements PiActions {
    binaryExpressionCreators: PiBinaryExpressionCreator[] = MANUAL_BINARY_EXPRESSION_CREATORS;
    customBehaviors: PiCustomBehavior[] = MANUAL_CUSTOM_BEHAVIORS;
    expressionCreators: PiExpressionCreator[] = MANUAL_EXPRESSION_CREATORS;
    keyboardActions: KeyboardShortcutBehavior[] = MANUAL_KEYBOARD;

}
export const MANUAL_EXPRESSION_CREATORS: PiExpressionCreator[] = [
    // Add your own custom expression creators here
    {
        trigger: /[0-9]/,
        activeInBoxRoles: ["PiBinaryExpression-right", "PiBinaryExpression-left", "Method-body", "OrExpression-left", "OrExpression-right",
        "IfExpression-condition", "IfExpression-whenTrue", "IfExpression-whenFalse", "SumExpression-from", "SumExpression-to",
        "SumExpression-body", "AbsExpression-expr"],
        expressionBuilder: (box: Box, trigger: PiTriggerType, editor: PiEditor) => {
            const parent = box.element;
            const x = new NumberLiteralExpression();
            x.value = trigger.toString();
            parent[(box as AliasBox).propertyName] = x;
            return x;
        },
        boxRoleToSelect: "NumberLiteralExpression-value",
        caretPosition: PiCaret.RIGHT_MOST
    }
];

export const MANUAL_BINARY_EXPRESSION_CREATORS: PiBinaryExpressionCreator[] = [
    // Add your own custom binary expression creators here
];

export const MANUAL_CUSTOM_BEHAVIORS: PiCustomBehavior[] = [
    // Add your own custom behavior here
    {
        activeInBoxRoles: ["optional-baseEntity"],
        action: (box, trigger, editor): PiElement => {
            if ( isAliasBox(box)) {
                const parent = box.parent;
                if ( isOptionalBox(parent)) {
                    parent.mustShow = true;
                }
            }
            return null;
        },
        trigger: "add-base"
    },
    {
        trigger: ".",
        activeInBoxRoles: ["ExExpression-appliedfeature"],
        action: (box, trigger, editor): PiElement => {
            const elem = box.element;
            if ( elem instanceof ParameterRef) {
                const applied = new AttributeRef();
                elem.appliedfeature = applied;
                return applied;
            }
            return null;
        }
    }
];

export const MANUAL_KEYBOARD: KeyboardShortcutBehavior[] = [
    // Add your own custom keyboard shortcuts here
];
