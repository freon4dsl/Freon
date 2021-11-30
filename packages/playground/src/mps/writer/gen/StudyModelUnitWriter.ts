// Generated by the ProjectIt Language Generator.
import { PiNamedElement, PiWriter } from "@projectit/core";
import { StudyEveryConcept } from "../../language/gen";

/**
 * SeparatorType is used to unparse lists.
 * NONE means only space(s) between the elements.
 * Terminator means that every element is terminated with a certain string.
 * Separator means that in between elements a certain string is placed.
 */
enum SeparatorType {
    NONE = "NONE",
    Terminator = "Terminator",
    Separator = "Separator"
}

/**
 * Class ExampleModelUnitWriter provides methods to return a string representation of an instance of
 * elements of language Example.
 * It is, amongst others, used to create error messages in the validator.
 */
export class StudyModelUnitWriter implements PiWriter {
    output: string[] = []; // stores the result, one line per array element
    currentLine: number = 0; // keeps track of the element in 'output' that we are working on

    /**
     * Returns a string representation of 'modelelement'.
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     * Note that the single-line-string cannot be parsed into a correct model.
     *
     * @param modelelement
     * @param startIndent
     * @param short
     */
    public writeToString(modelelement: StudyEveryConcept, startIndent?: number, short?: boolean): string {
        return ""
    }

    /**
     * Returns a string representation of 'modelelement', divided into an array of strings,
     * each of which contain a single line (without newline).
     * If 'short' is present and true, then a single-line result will be given.
     * Otherwise, the result is always a multi-line string.
     *
     * @param modelelement
     * @param startIndent
     * @param short
     */
    public writeToLines(modelelement: StudyEveryConcept, startIndent?: number, short?: boolean): string[] {
        return [];
    }

    /**
     * Returns the name of 'modelelement' if it has one, else returns
     * a short unparsing of 'modelelement'.
     * Used by the validator to produce readable error messages.
     *
     * @param modelelement
     */
    public writeNameOnly(modelelement: StudyEveryConcept): string {
        return "";
    }

}
