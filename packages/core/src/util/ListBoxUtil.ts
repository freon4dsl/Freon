// the following two imports are needed, to enable use of the names without the prefix 'Keys', avoiding 'Keys.MetaKey'
import { editorEnvironment } from "../../../playground/dist/webapp/WebappConfiguration";
import { MetaKey, PiKey } from "./Keys";
import * as Keys from "./Keys";
import { PiUtils, wait, PiLogger } from "./internal";
import {
    AliasBox,
    Box,
    HorizontalListBox,
    VerticalListBox,
    PiEditor,
    KeyboardShortcutBehavior, isTextBox
} from "../editor";
import { PiElement } from "../language";


const LOGGER = new PiLogger("ListBoxUtil");

export function boxAbove(box: Box): Box {
    wait(0);
    const x = box.actualX;
    const y = box.actualY;
    let result: Box = box.nextLeafLeft;
    let tmpResult = result;
    LOGGER.log("boxAbove: " + x + ", " + y);
    while (result !== null) {
        LOGGER.log("previous : " + result.role + "  " + result.actualX + ", " + result.actualY);
        if (isOnPreviousLine(tmpResult, result) && isOnPreviousLine(box, tmpResult)) {
            return tmpResult;
        }
        if (isOnPreviousLine(box, result)) {
            if (result.actualX <= x) {
                return result;
            }
        }
        const next = result.nextLeafLeft;
        tmpResult = result;
        result = next;
    }
    return result;
}

export function boxBelow(box: Box): Box {
    const x = box.actualX + editorEnvironment.editor.scrollX;
    const y = box.actualY + editorEnvironment.editor.scrollX;
    let result: Box = box.nextLeafRight;
    let tmpResult = result;
    LOGGER.log("boxBelow " + box.role + ": " + Math.round(x) + ", " + Math.round(y) + " text: " +
        (isTextBox(box) ? box.getText() : "NotTextBox" ));
    while (result !== null) {
        LOGGER.log("next : " + result.role + "  " + Math.round(result.actualX + editorEnvironment.editor.scrollX) + ", " + Math.round(result.actualY+ editorEnvironment.editor.scrollY));
        if (isOnNextLine(tmpResult, result) && isOnNextLine(box, tmpResult)) {
            LOGGER.log("Found box below 1 [" + (!!tmpResult ? tmpResult.role : "null") + "]");
            return tmpResult;
        }
        if (isOnNextLine(box, result)) {
            if (result.actualX+ editorEnvironment.editor.scrollX + result.actualWidth >= x) {
                LOGGER.log("Found box below 2 [" + (!!result ? result.role : "null") + "]");
                return result;
            }
        }
        const next = result.nextLeafRight;
        tmpResult = result;
        result = next;
    }
    LOGGER.log("Found box below 3 [ null ]");
    return result;
}

function isOnPreviousLine(ref: Box, other: Box): boolean {
    const margin = 5;
    return other.actualY + margin < ref.actualY;
}

function isOnNextLine(ref: Box, other: Box): boolean {
    return isOnPreviousLine(other, ref);
}

export function firstVerticalBoxParent(box: Box): Box[] {
    const resultL: Box[] = [];
    resultL.push(box);
    let result: Box = box;
    while (result.parent) {
        result = result.parent;
        resultL.push(result);
        if (result instanceof VerticalListBox) {
            return resultL;
        }
    }
    return resultL;
}

export function createVerticalListBox<E extends PiElement>(
    element: PiElement,
    role: string,
    list: E[],
    placeholderRole: string,
    elementCreator: (box: Box, editor: PiEditor) => E,
    editor: PiEditor
): Box {
    LOGGER.log("createVerticalListBox");
    const result = new VerticalListBox(element, role, []);

    for (let index = 0; index < list.length; index++) {
        const ent = list[index];
        const line = new HorizontalListBox(element, role + "-hor-" + index, [
            editor.projection.getBox(ent),
            new AliasBox(ent, "list-for-" + role, "    ", { roleNumber: index })
        ]);
        result.addChild(line);
    }

    return result;
}

/**
 * Create a keyboard shortcut for use in an element list
 * @param collectionRole
 * @param elementCreator
 * @param roleToSelect
 */
export function createKeyboardShortcutForList<ELEMENT_TYPE extends PiElement>(
    collectionRole: string,
    elementCreator: (box: Box, editor: PiEditor) => ELEMENT_TYPE,
    roleToSelect: string
): KeyboardShortcutBehavior {
    const listKeyboardShortcut: KeyboardShortcutBehavior = {
        trigger: { meta: MetaKey.None, keyCode: Keys.ENTER },
        activeInBoxRoles: ["list-for-" + collectionRole],
        action: async (box: Box, key: PiKey, editor: PiEditor): Promise<PiElement> => {
            LOGGER.log("createKeyboardShortcutForList: Action: list-for-" + collectionRole);
            const element = box.element;
            const proc = element.piContainer();
            const parent: PiElement = proc.container;
            PiUtils.CHECK(parent[proc.propertyName][proc.propertyIndex] === element);
            // CHECK(parent instanceof ProElement);
            // if (parent instanceof DemoModel) {
            const newElement: ELEMENT_TYPE = elementCreator(box, editor);
            parent[proc.propertyName].splice(proc.propertyIndex + 1, 0, newElement);
            // wait(0);
            // editor.selectElement(newElement, roleToSelect);

            if (!!roleToSelect) {
                LOGGER.log("List select element for role " + roleToSelect);
                editor.selectElement(newElement, roleToSelect);
            } else {
                LOGGER.log("List select first leaf " + roleToSelect);
                editor.selectElement(newElement);
                LOGGER.log("List select first editable leaf NOW " + roleToSelect);
                editor.selectFirstEditableChildBox();
                // await editor.selectFirstLeafChildBox();
            }
            // }
            return null;
        }
    };
    return listKeyboardShortcut;
}
