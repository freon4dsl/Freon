// Generated by the ProjectIt Language Generator.
import {
    PiProjection,
    PiElement,
    Box,
    GridCellBox,
    HorizontalListBox,
    LabelBox,
    SvgBox,
    GridBox,
    createDefaultExpressionBox,
    AliasBox,
    Language,
    PI_BINARY_EXPRESSION_LEFT,
    PI_BINARY_EXPRESSION_RIGHT,
    PiTableDefinition, PiCompositeProjection
} from "@projectit/core";
import { OrExpression, SumExpression } from "../language/gen/index";
import { grid, gridcell, gridcellLast, gridCellOr, mycell, mygrid, or_gridcellFirst } from "./styles/CustomStyles";

const sumIcon = "M 6 5 L 6.406531 20.35309 L 194.7323 255.1056 L 4.31761 481.6469 L 3.767654 495.9135 L 373 494 C 376.606 448.306 386.512 401.054 395 356 L 383 353 C 371.817 378.228 363.867 405.207 340 421.958 C 313.834 440.322 279.304 438 249 438 L 79 438 L 252.2885 228.6811 L 96.04328 33.3622 L 187 32.99999 C 245.309 32.99999 328.257 18.91731 351.329 89.00002 C 355.273 100.98 358.007 113.421 359 126 L 372 126 L 362 5 L 6 5 L 6 5 L 6 5 L 6 5 L 6 5 z ";
const OPERATOR_COLUMN = 1;
const OPERAND_COLUMN = 2;


/**
 * Class CustomExampleProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These custom build additions are merged with the default and definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */

export class CustomExampleProjection implements PiProjection {
    rootProjection: PiCompositeProjection;
    name: string = "manual";
    isEnabled: boolean = true;

    constructor(name?: string) {
        if (!!name) {
            this.name = name;
        }
    }

    getTableDefinition(conceptName: string): PiTableDefinition {
        // Add any handmade table cells of your own before next statement
        return null;
    }

    getBox(element: PiElement): Box {
        // Add any handmade projections of your own before next statement

        // Uncomment to see a mathematical Sum symbol
        if (element instanceof SumExpression) {
            return this.createSumBox(element);
        }

        // Uncomment to see an alternative OR notation (only works up to two nested ors
        if (element instanceof OrExpression) {
            return this.createOrBoxGrid(element);
        }
        return null;
    }

    public createSumBox(sum: SumExpression): Box {
        const cells: GridCellBox[] = [
            new GridCellBox(sum, "Sum-from-cell",  3, 1,
                new HorizontalListBox(sum, "Sum-from-part", [
                    this.optionalPartBox(sum, "SumExpression-variable", "variable"),
                    new LabelBox(sum, "sum-from-equals", "="),
                    this.optionalPartBox(sum, "SumExpression-from", "from")
                ]),
                { columnSpan: 2,
                    style: mycell
                }),
            new GridCellBox(sum, "sum-icon-cell",2, 1,
                new SvgBox(sum, "sum-icon", sumIcon, {
                    width: 50,
                    height: 50,
                    selectable: false
                }),
                { style: mycell }
            ),
            new GridCellBox(sum, "sum-to-cell", 1, 1,
                this.optionalPartBox(sum, "SumExpression-to", "to"),
                { columnSpan: 2, style: mycell }
            ),
            new GridCellBox(sum, "sum-body-cell", 2, 2,
                new HorizontalListBox(sum, "sum-body", [
                    new LabelBox(sum, "sum-body-open", "["),
                    this.optionalPartBox(sum, "SumExpression-body", "body"),
                    new LabelBox(sum, "sum-body-close", "]")
                ]),
                { style: mycell }
            )
        ];
        const result = new GridBox(sum, "sum-all", cells, {
            style: mygrid
        });
        return createDefaultExpressionBox(sum, "sum-exp", [result]);
    }


    private optionalPartBox(element: PiElement, roleName: string, property: string): Box {
        const projectionToUse = !!this.rootProjection ? this.rootProjection : this;
        return !!element[property]
            ? projectionToUse.getBox(element[property])
            : new AliasBox(element, roleName, "[" + property + "]", { propertyName: property, conceptName: Language.getInstance().classifier(element.piLanguageConcept()).properties.get(property).type });
    }

    ////////////////////////////////////////////////////////////////////

    public createOrBoxGrid(exp: OrExpression): Box {
        const gridCells: GridCellBox[] = [];
        if (exp.left instanceof OrExpression) {
            gridCells.push(
                new GridCellBox(exp, "or-Box2-cell", 1, OPERATOR_COLUMN,
                    new LabelBox(exp, "or-Box2", () => "or"),
                    { style: gridCellOr, rowSpan: 3 }
                ),
                new GridCellBox(exp, "orBox3-cell", 1, OPERAND_COLUMN,
                    this.optionalPartBox(exp.left, PI_BINARY_EXPRESSION_LEFT, "left"),
                    { style: or_gridcellFirst }
                ),
                new GridCellBox(exp, "or-Box4-cell", 2, OPERAND_COLUMN,
                    this.optionalPartBox(exp.left, PI_BINARY_EXPRESSION_RIGHT, "right"),
                    { style: gridcell }
                ),
                new GridCellBox(exp, "or-Box5-cell", 3, OPERAND_COLUMN,
                    this.optionalPartBox(exp, PI_BINARY_EXPRESSION_RIGHT, "right"),
                    { style: gridcellLast }
                )
            );
        } else {
            gridCells.push(
                new GridCellBox(exp, "or-Box6-cell", 1, OPERATOR_COLUMN,
                    new LabelBox(exp, "or-Box3", () => "or"),
                    { style: gridCellOr, rowSpan: 2 }
                ),
                new GridCellBox(exp, "or-Box7-cell", 1, OPERAND_COLUMN,
                    this.optionalPartBox(exp, PI_BINARY_EXPRESSION_LEFT, "left"),
                    { style: or_gridcellFirst }
                ),
                new GridCellBox(exp, "or-Box8-cell", 2, OPERAND_COLUMN,
                    this.optionalPartBox(exp, PI_BINARY_EXPRESSION_RIGHT, "right"),
                    { style: gridcellLast }
                )
            );
        }
        return new GridBox(exp, "grid-or", gridCells,
            { style: grid }
        );
    }

}