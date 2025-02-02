import {
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
    FreEditNormalProjection,
    FreEditProjectionLine,
    FreOptionalPropertyProjection,
} from "../metalanguage/index.js";
import { EditorDefaults } from "../metalanguage/EditorDefaults.js";

export class FreEditParseUtil {
    /** Normalizing means:
     * - break lines at newline,
     * - remove empty lines
     * - set indent property per line and then remove all indent items
     * - all FreEditParseNewline and FreEditParseProjectionIndent instances are removed.
     */
    public static normalize(projection: FreEditNormalProjection): void {
        // everything is parsed as one line, now break this line on ParsedNewLines and remove empty lines

        // find the indentation of the complete projection, which should be ignored
        let ignoredIndent = 100; // begin with an arbitrary large amount

        // find the line with the least indentation
        projection.lines.forEach((line) => {
            const firstItem = line.items[0];
            if (firstItem instanceof FreEditParsedProjectionIndent) {
                if (line.items.length > 1) {
                    // indent + someething after the indent, otherwise it's just an empty line
                    ignoredIndent = Math.min(ignoredIndent, firstItem.amount);
                }
                // else ignore empty line with only an indents
                // } else if (!(firstItem instanceof FreOptionalPropertyProjection && firstItem.lines.length > 1)) { // multi-line optionals are handled below
            } else if (firstItem instanceof FreOptionalPropertyProjection && firstItem.lines.length > 1) {
                // multi-line optionals are handled below
                ignoredIndent = 0;
            } else if (line.items.length !== 0) {
                ignoredIndent = 0;
            }
            // console.log("calculated ignored indent on line " + index + " to be " + ignoredIndent + ", in \n\t" + line.toString())
            line.items.forEach((item) => {
                if (item instanceof FreOptionalPropertyProjection) {
                    if (item.lines.length > 1) {
                        // it's a multi-line optional, so regard its lines as well, but skip the first which holds '[?'
                        item.lines.forEach((subLine, subIndex) => {
                            if (subIndex !== 0) {
                                const firstInnerItem = subLine.items[0];
                                if (firstInnerItem instanceof FreEditParsedProjectionIndent) {
                                    ignoredIndent = Math.min(ignoredIndent, firstInnerItem.amount);
                                } else {
                                    // no parsed indent found, thus first item is in column 0
                                    ignoredIndent = 0;
                                }
                            }
                            // console.log("OPTIONAL: calculated ignored indent on line "
                            // + index + " to be " + ignoredIndent + ", subIndex: " + subIndex + ", " + subLine.toString());
                        });
                    }
                }
            });
        });

        // determine the indent of each line, while ignoring the 'ignoredIndent'
        FreEditParseUtil.determineIndents(projection.lines, ignoredIndent);

        // remove all indent items, as they are not needed anymore
        FreEditParseUtil.removeParsedItems(projection.lines);
    }

    private static removeParsedItems(lines: FreEditProjectionLine[]) {
        lines.forEach((line) => {
            line.items = line.items.filter((item) => !(item instanceof FreEditParsedProjectionIndent));
            line.items.forEach((item) => {
                if (item instanceof FreOptionalPropertyProjection) {
                    FreEditParseUtil.removeParsedItems(item.lines);
                }
            });
        });
    }

    private static determineIndents(lines: FreEditProjectionLine[], ignoredIndent: number) {
        // find indent of first line and substract that from all other lines
        // set indent of each line to the remainder
        lines.forEach((line) => {
            const firstItem = line.items[0];
            if (firstItem instanceof FreEditParsedProjectionIndent) {
                line.indent = firstItem.amount - ignoredIndent;
                line.items.splice(0, 1);
            }
            line.items.forEach((item) => {
                if (item instanceof FreOptionalPropertyProjection) {
                    FreEditParseUtil.determineIndents(item.lines, ignoredIndent);
                }
            });
        });
    }

    public static normalizeLine(line: FreEditProjectionLine): FreEditProjectionLine[] {
        const result: FreEditProjectionLine[] = [];
        let currentLine = new FreEditProjectionLine();
        // handle an empty projection: error message will be given by the checker
        if (line === null || line === undefined) {
            return result;
        }
        // else: handle a normal projection
        const lastItemIndex = line.items.length - 1;
        line.items.forEach((item, index) => {
            if (item instanceof FreEditParsedProjectionIndent) {
                this.normalizeIndent(item);
                // add the location to the new line for error messaging
                if (!currentLine.location) {
                    currentLine.location = item.location;
                }
                currentLine.items.push(item);
            } else if (item instanceof FreEditParsedNewline) {
                // make a new line
                result.push(currentLine);
                currentLine = new FreEditProjectionLine();
            } else if (item instanceof FreOptionalPropertyProjection) {
                if (item.lines[0].items[0] instanceof FreEditParsedNewline) {
                    // in this case the optional projection starts on a new line
                    item.lines = FreEditParseUtil.normalizeLine(item.lines[0]);
                }
                currentLine.items.push(item);
            } else {
                currentLine.items.push(item);
            }
            if (lastItemIndex === index) {
                result.push(currentLine);
            }
        });
        return result;
    }

    /**
     * Calculates the `amount` of indentation.
     */
    private static normalizeIndent(indent: FreEditParsedProjectionIndent): void {
        let spaces = 0;
        for (const char of indent.indent) {
            if (char === "\t") {
                // calculate based on spaces before the tab
                const spacesBeforeTab: number = spaces % EditorDefaults.globalIndent;
                spaces += EditorDefaults.globalIndent - spacesBeforeTab;
            } else if (char === " ") {
                spaces += 1;
            }
        }
        indent.amount = spaces;
    }
}
