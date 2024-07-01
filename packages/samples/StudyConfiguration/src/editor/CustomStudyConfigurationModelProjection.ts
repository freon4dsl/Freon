// Generated by the Freon Language Generator.
import {
    FreNode,
    Box,
    GridCellBox,
    LabelBox,
    SvgBox,
    GridBox,
    createDefaultExpressionBox,
    ActionBox,
    FreLanguage,
    FRE_BINARY_EXPRESSION_LEFT,
    FRE_BINARY_EXPRESSION_RIGHT,
    HorizontalListBox, FreProjection, FreProjectionHandler, FreTableDefinition, TableRowBox, HorizontalLayoutBox, MultiLineTextBox, BoxFactory, BoxUtil //, ExpandableBox
} from "@freon4dsl/core";
import { Description, Period, Event } from "../language/gen";

/**
 * Class CustomStudyConfigurationModelProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These are merged with the custom build additions and other definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on one of the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
export class CustomStudyConfigurationModelProjection implements FreProjection {
    name: string = "Manual";
    handler: FreProjectionHandler;
    // add your custom methods here
    nodeTypeToBoxMethod: Map<string, (node: FreNode) => Box> = new Map<string, (node: FreNode) => Box>([
        ["Description", this.createDescription],
        ["Period", this.createPeriod],
        ["Event", this.createEvent],
    ]);

    nodeTypeToTableDefinition: Map<string, () => FreTableDefinition> = new Map<string, () => FreTableDefinition>([
        // register your custom table definition methods here
        // ['NAME_OF_CONCEPT', this.TABLE_DEFINITION_FOR_CONCEPT],
    ]);

    getTableHeadersFor(projectionName: string): TableRowBox {
        return null;
    }

    ////////////////////////////////////////////////////////////////////

    createDescription (desc: Description): Box {
        return BoxFactory.horizontalLayout(
            desc,
            "Description-hlist-line-0",
            "",
            [
                new MultiLineTextBox(desc, "study-part-description",
                    () => { return desc.text},
                    (t: string) => { desc.text = t}
                )
            ],
            { selectable: false }
        );
    }

    createPeriod (period: Period): Box {
        return BoxFactory.verticalLayout(period, "Period-overall", "", [
            BoxFactory.horizontalLayout(
                period,
                "Period-hlist-line-0",
                "",
                [
                    BoxUtil.labelBox(period, "Period2:", "top-1-line-0-item-1"),
                    BoxUtil.textBox(period, "name")
                    
                ],
                { selectable: false }
            ),
            BoxUtil.emptyLineBox(period, "Period-empty-line-1"),
            BoxUtil.labelBox(period, "EVENTS2", "top-1-line-2-item-0"),
            BoxUtil.indentBox(
                period,
                4,
                "4",
                BoxUtil.verticalPartListBox(period, period.events, "events", null, this.handler)
            ),
            BoxUtil.emptyLineBox(period, "Period-empty-line-5")
        ]);
    }


    createEvent (event: Event): Box {
        return BoxFactory.verticalLayout(event, "Event-overall", "", [
            BoxFactory.horizontalLayout(
                event,
                "Event-hlist-line-0",
                "",
                [
                    BoxUtil.labelBox(event, "Event2:", "top-1-line-0-item-1"),
                    BoxUtil.textBox(event, "name")],
               { selectable: false }
            ),
            BoxFactory.horizontalLayout(
                event,
                "Event-hlist-line-2",
                "",
                [
                    BoxUtil.labelBox(event, "Description:", "top-1-line-2-item-0"),
                    BoxUtil.getBoxOrAction(event, "description", "Description", this.handler)
                ],
                { selectable: false }
            ),
            BoxUtil.labelBox(event, "Schedule:", "top-1-line-4-item-0"),
            BoxUtil.indentBox(
                event,
                4,
                "5",
                BoxUtil.getBoxOrAction(event, "schedule", "EventSchedule", this.handler)
            ),
            BoxFactory.horizontalLayout(
                event,
                "Event-hlist-line-9",
                "",
                [
                    BoxUtil.labelBox(event, "Checklist:", "top-1-line-9-item-0"),
                    BoxUtil.booleanBox(event, "showSequenced", { yes: "YES", no: "NO" }),
                    BoxUtil.labelBox(event, "Allow Sequencing", "top-1-line-9-item-2")
                ],
                { selectable: false }
            ),
            BoxUtil.indentBox(
                event,
                4,
                "10",
                BoxUtil.getBoxOrAction(event, "checkList", "CheckList", this.handler)
            ),
            BoxUtil.emptyLineBox(event, "Event-empty-line-11")
        ]);
    }
 }
