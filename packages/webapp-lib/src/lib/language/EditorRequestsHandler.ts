import {
    Box,
    FreProjectionHandler,
    isActionBox,
    isActionTextBox,
    isListBox,
    FreLanguage,
    FreError,
    FreLogger,
    FreUndoManager,
    FreSearcher,
    FreErrorSeverity,
    type FreEnvironment,
} from "@freon4dsl/core";
import type { FreNode } from "@freon4dsl/core";
import {
    activeTab,
    errorsLoaded,
    errorTab,
    searchResultLoaded,
    searchResults,
    searchTab,
} from "../components/stores/InfoPanelStore.js";
import { EditorState } from "./EditorState.js";
import { setUserMessage } from "../components/stores/UserMessageStore.js";
import { WebappConfigurator } from "../WebappConfigurator.js";

const LOGGER = new FreLogger("EditorRequestsHandler"); // .mute();

export class EditorRequestsHandler {
    private static instance: EditorRequestsHandler = null;

    static getInstance(): EditorRequestsHandler {
        if (EditorRequestsHandler.instance === null) {
            EditorRequestsHandler.instance = new EditorRequestsHandler();
        }
        return EditorRequestsHandler.instance;
    }

    private langEnv: FreEnvironment = WebappConfigurator.getInstance().editorEnvironment;

    /**
     * Makes sure that the editor show the current unit using the projections selected by the user
     * @param name
     */
    enableProjections(names: string[]): void {
        LOGGER.log("enabling Projection " + names);
        const proj = this.langEnv.editor.projection;
        if (proj instanceof FreProjectionHandler) {
            proj.enableProjections(names);
        }
        // Let the editor know that the projections have changed.
        // TODO: This should go automatically through mobx.
        //       But observing the projections array does not work as expected.
        this.langEnv.editor.forceRecalculateProjection++;
    }

    /**
     * Makes sure that the editor shows the current unit using the projections selected or unselected by the user
     * @param name
     */
    // disableProjection(name: string): void {
    //     LOGGER.log("disabling Projection " + name);
    //     const proj = this.langEnv.editor.projection;
    //     if (proj instanceof FreProjectionHandler) {
    //         proj.disableProjection(name);
    //     }
    // }

    redo() {
        const unitInEditor = EditorState.getInstance().currentUnit;
        console.log("redo called: " + FreUndoManager.getInstance().nextRedoAsText(unitInEditor));
        if (!!unitInEditor) {
            FreUndoManager.getInstance().executeRedo(unitInEditor);
        }
    }

    undo() {
        const unitInEditor = EditorState.getInstance().currentUnit;
        LOGGER.log("undo called: " + FreUndoManager.getInstance().nextUndoAsText(unitInEditor));
        if (!!unitInEditor) {
            FreUndoManager.getInstance().executeUndo(unitInEditor);
        }
    }

    cut() {
        LOGGER.log("cut called");
        const tobecut: FreNode = this.langEnv.editor.selectedElement;
        if (!!tobecut) {
            EditorState.getInstance().deleteElement(tobecut);
            this.langEnv.editor.copiedElement = tobecut;
            // console.log("element " + this.langEnv.editor.copiedElement.freId() + " is stored ");
        } else {
            setUserMessage("Nothing selected", FreErrorSeverity.Warning);
        }
    }

    copy() {
        LOGGER.log("copy called");
        const tobecopied: FreNode = this.langEnv.editor.selectedElement;
        if (!!tobecopied) {
            this.langEnv.editor.copiedElement = tobecopied.copy();
            // console.log("element " + this.langEnv.editor.copiedElement.freId() + " is stored ");
        } else {
            setUserMessage("Nothing selected", FreErrorSeverity.Warning);
        }
    }

    paste() {
        LOGGER.log("paste called");
        const tobepasted = this.langEnv.editor.copiedElement;
        if (!!tobepasted) {
            const currentSelection: Box = this.langEnv.editor.selectedBox;
            const element: FreNode = currentSelection.node;
            if (!!currentSelection) {
                if (isActionTextBox(currentSelection)) {
                    if (isActionBox(currentSelection.parent)) {
                        if (
                            FreLanguage.getInstance().metaConformsToType(
                                tobepasted,
                                currentSelection.parent.conceptName,
                            )
                        ) {
                            // allow subtypes
                            // console.log("found text box for " + currentSelection.parent.conceptName + ", " + currentSelection.parent.propertyName);
                            EditorState.getInstance().pasteInElement(element, currentSelection.parent.propertyName);
                        } else {
                            setUserMessage(
                                "Cannot paste an " + tobepasted.freLanguageConcept() + " here.",
                                FreErrorSeverity.Warning,
                            );
                        }
                    }
                } else if (isListBox(currentSelection.parent)) {
                    if (FreLanguage.getInstance().metaConformsToType(tobepasted, element.freLanguageConcept())) {
                        // allow subtypes
                        // console.log('pasting in ' + currentSelection.role + ', prop: ' + currentSelection.parent.propertyName);
                        EditorState.getInstance().pasteInElement(
                            element.freOwnerDescriptor().owner,
                            currentSelection.parent.propertyName,
                            element.freOwnerDescriptor().propertyIndex + 1,
                        );
                    } else {
                        setUserMessage(
                            "Cannot paste an " + tobepasted.freLanguageConcept() + " here.",
                            FreErrorSeverity.Warning,
                        );
                    }
                } else {
                    // todo other pasting options ...
                }
            } else {
                setUserMessage(
                    "Cannot paste an " + tobepasted.freLanguageConcept() + " here.",
                    FreErrorSeverity.Warning,
                );
            }
        } else {
            setUserMessage("Nothing to be pasted", FreErrorSeverity.Warning);
            return;
        }
    }

    validate() {
        LOGGER.log("validate called");
        errorsLoaded.set(false);
        activeTab.set(errorTab);
        EditorState.getInstance().getErrors();
        errorsLoaded.set(true);
    }

    findText(stringToFind: string) {
        // todo loading of errors and search results should also depend on whether something has changed in the unit shown
        LOGGER.log("findText called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new FreSearcher();
        const results: FreNode[] = searcher.findString(
            stringToFind,
            EditorState.getInstance().currentUnit,
            this.langEnv.writer,
        );
        this.showSearchResults(results, stringToFind);
    }

    findStructure(elemToMatch: Partial<FreNode>) {
        LOGGER.log("findStructure called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new FreSearcher();
        const results: FreNode[] = searcher.findStructure(elemToMatch, EditorState.getInstance().currentUnit);
        this.showSearchResults(results, "elemToMatch");
    }

    findNamedElement(nameToFind: string, metatypeSelected: string) {
        LOGGER.log("findNamedElement called");
        searchResultLoaded.set(false);
        activeTab.set(searchTab);
        const searcher = new FreSearcher();
        const results: FreNode[] = searcher.findNamedElement(
            nameToFind,
            EditorState.getInstance().currentUnit,
            metatypeSelected,
        );
        this.showSearchResults(results, nameToFind);
    }

    private showSearchResults(results: FreNode[], stringToFind: string) {
        const itemsToShow: FreError[] = [];
        if (!results || results.length === 0) {
            itemsToShow.push(new FreError("No results for " + stringToFind, null, "", ""));
        } else {
            for (const elem of results) {
                // message: string, element: FreNode | FreNode[], locationdescription: string, severity?: FreErrorSeverity
                // todo show some part of the text string instead of the element id
                itemsToShow.push(new FreError(elem.freId(), elem, elem.freId(), ""));
            }
        }
        searchResults.set(itemsToShow);
        searchResultLoaded.set(true);
    }
}
