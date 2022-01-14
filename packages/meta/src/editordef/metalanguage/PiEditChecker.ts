import {
    PiBinaryExpressionConcept,
    PiClassifier, PiConcept, PiInstance, PiInterface,
    PiLangExpressionChecker,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty,
    PiPrimitiveType, PiProperty
} from "../../languagedef/metalanguage";
import { Checker, LangUtil, Names } from "../../utils";
import {
    ListInfo,
    PiEditClassifierProjection,
    PiEditProjection,
    PiEditProjectionGroup,
    PiEditPropertyProjection,
    PiEditSuperProjection,
    PiEditTableProjection,
    PiEditUnit,
    PiOptionalPropertyProjection,
    ExtraClassifierInfo,
    PiEditProjectionLine,
    ListJoinType,
    PiEditProjectionDirection
} from "./PiEditDefLang";
import { MetaLogger } from "../../utils";
import { PiElementReference } from "../../languagedef/metalanguage";
import { EditorDefaultsGenerator } from "./EditorDefaultsGenerator";

const LOGGER = new MetaLogger("PiEditChecker"); //.mute();

export class PiEditChecker extends Checker<PiEditUnit> {
    myExpressionChecker: PiLangExpressionChecker;
    private propsWithTableProjection: PiEditPropertyProjection[] = [];

    constructor(language: PiLanguage) {
        super(language);
        this.myExpressionChecker = new PiLangExpressionChecker(this.language);
    }

    /**
     * Checks the editor definition, resolving references, and adds the defaults.
     *
     * @param editUnit
     */
    public check(editUnit: PiEditUnit): void {
        // LOGGER.log("checking editUnit");
        if (this.language === null || this.language === undefined) {
            throw new Error(`Editor definition checker does not known the language.`);
        }
        editUnit.language = this.language;

        this.propsWithTableProjection = [];
        this.resolveReferences(editUnit);

        for (const group of editUnit.projectiongroups) {
            this.checkProjectionGroup(group);
        }
        this.checkPropsWithTableProjection(editUnit);
        this.simpleWarning(!!editUnit.getDefaultProjectiongroup(),
            `No editor with name 'default' found, a default editor will be generated.`);

        // add default values for everything that is not present in the editor definition
        EditorDefaultsGenerator.addDefaults(editUnit);
        this.errors = this.errors.concat(this.myExpressionChecker.errors);
        // this.checkProjectionGroup(editUnit.getDefaultProjectiongroup());
        // extras checks, should not be needed when defaults are correctly created
        // const defaultGroup = editUnit.getDefaultProjectiongroup();
        // this.language.classifiersWithProjection().forEach(concept => {
        //     this.simpleCheck(!!defaultGroup.findExtrasForType(concept), `No extras defined for ${concept.name} ${this.location(defaultGroup)}.`);
        //     this.simpleCheck(!!defaultGroup.findProjectionForType(concept), `No projection defined for ${concept.name} ${this.location(defaultGroup)}.`);
        // });
        // this.language.concepts.filter(c => c instanceof PiBinaryExpressionConcept).forEach(bin => {
        //     this.simpleCheck(!!defaultGroup.findExtrasForType(bin), `No extras defined for ${bin.name} ${this.location(defaultGroup)}.`);
        // })
        //
    }

    private checkProjectionGroup(projectionGroup: PiEditProjectionGroup) {
        // LOGGER.log("checking projectionGroup " + projectionGroup?.name);
        this.simpleCheck(!!projectionGroup.name, `Editor should have a name, it is empty ${this.location(projectionGroup)}.`);
        for (const projection of projectionGroup.projections) {
            this.checkProjection(projection);
            projection.name = projectionGroup.name;
        }
        if (!!projectionGroup.extras) {
            let allTriggers: string[] = [];
            let allSymbols: string[] = [];
            for (const other of projectionGroup.extras) {
                this.checkExtras(other);
                this.nestedCheck({
                    check: !other.trigger || !allTriggers.includes(other.trigger),
                    error: `Trigger ${other.trigger} is not unique ${this.location(other)}.`,
                    whenOk: () => {
                        allTriggers.push(other.trigger);
                    }
                });
                this.nestedCheck({
                    check: !other.symbol || !allSymbols.includes(other.symbol),
                    error: `Symbol ${other.symbol} is not unique ${this.location(other)}.`,
                    whenOk: () => {
                        allSymbols.push(other.symbol)
                    }
                });
            }
        }
        // only 'default' projectionGroup may define standardBooleanProjection, referenceSeparator, and extras
        if (projectionGroup.name !== Names.defaultProjectionName){
            this.simpleCheck(!projectionGroup.standardBooleanProjection,
                `Only the 'default' projectionGroup may define a standard Boolean projection ${this.location(projectionGroup)}.`);
            this.simpleCheck(!projectionGroup.standardReferenceSeparator,
                `Only the 'default' projectionGroup may define a standard reference separator ${this.location(projectionGroup)}.`);
            this.simpleCheck(!projectionGroup.extras,
                `Only the 'default' projectionGroup may define trigger, symbols, and reference shortcuts ${this.location(projectionGroup)}.`);
        }
    }

    private checkProjection(projection: PiEditClassifierProjection) {
        // LOGGER.log("checking projection for " + projection.classifier?.name);
        const myClassifier: PiClassifier = projection.classifier.referred;
        this.nestedCheck({
            check: !!myClassifier,
            error: `Classifier ${projection.classifier.name} is unknown ${this.location(projection)}`,
            whenOk: () => {
                if (myClassifier instanceof PiLimitedConcept) {
                    this.simpleCheck(false,
                        `A limited concept cannot have a projection, it can only be used as reference ${this.location(projection)}.`);
                } else {
                    if (projection instanceof PiEditProjection) {
                        this.checkNormalProjection(projection, myClassifier);
                    } else if (projection instanceof PiEditTableProjection) {
                        this.checkTableProjection(projection, myClassifier);
                    }
                }
            }
        });
    }

    private checkNormalProjection(projection: PiEditProjection, cls: PiClassifier) {
        // LOGGER.log("checking normal projection ");
        if (!!projection) {
            if (projection.lines.length > 1) {
                // multi-line projection, the first and last line should be empty, and
                // both will be ignored
                this.nestedCheck({
                    check: projection.lines[0].isEmpty(),
                    error: `In a multi-line projection the first line should be empty (white space only) to enable indenting ${this.location(projection)}.`,
                    whenOk: () => {
                        projection.lines.splice(0, 1);
                    }
                });
                this.nestedCheck({
                    check: projection.lines[projection.lines.length -1].isEmpty(),
                    error: `In a multi-line projection the last line should be empty (white space only) to enable indenting ${this.location(projection.lines[projection.lines.length -1])}.`,
                    whenOk: () => {
                        projection.lines.splice(projection.lines.length -1, 1);
                    }
                });
            }
            projection.lines.forEach(line => {
                this.checkLine(line, cls);
            });
        }
    }

    private checkLine(line: PiEditProjectionLine, cls: PiClassifier) {
        // LOGGER.log("checking line ");
        line.items.forEach(item => {
            if (item instanceof PiEditPropertyProjection) {
                this.checkPropProjection(item, cls);
            } else if (item instanceof PiEditSuperProjection) {
                this.checkSuperProjection(item, cls);
            }
        });
    }

    private checkTableProjection(projection: PiEditTableProjection, cls: PiClassifier) {
        // LOGGER.log("checking table projection for " + cls?.name);
        if (!!projection) {
            this.nestedCheck({
                check: projection.cells.length > 0,
                error: `Table projection '${projection.name}' should contain one or more properties as cells ${this.location(projection)}`,
                whenOk: () => {
                    this.simpleCheck(projection.headers.length > 0 ? projection.cells.length === projection.headers.length : true,
                        `The number of headers should match the number of cells in table projection '${projection.name}' ${this.location(projection)}`
                    );
                    for (const prop of projection.cells) {
                        this.checkPropProjection(prop, cls);
                    }
                }
            });
        }
    }

    private checkBooleanPropertyProjection(item: PiEditPropertyProjection, myProp: PiProperty) {
        // LOGGER.log("checking boolean property projection: " + myProp?.name);
        this.simpleCheck(myProp instanceof PiPrimitiveProperty && myProp.type.referred === PiPrimitiveType.boolean,
            `Property '${myProp.name}' may not have a keyword projection, because it is not of boolean type ${this.location(item)}.`);
        this.simpleCheck(!PiEditChecker.includesWhitespace(item.boolInfo.trueKeyword), `The text for a keyword projection should not include any whitespace ${this.location(item)}.`);
    }

    private checkListProperty(item: PiEditPropertyProjection, myProp: PiProperty) {
        // LOGGER.log("checking list property projection: " + myProp?.name);
        if (!!item.listInfo) {
            if (item.listInfo.isTable) {
                // remember this property - there should be a table projection for it - to be checked later
                this.propsWithTableProjection.push(item);
            } else if (item.listInfo.joinType !== ListJoinType.NONE) { // the user has entered something
                let joinTypeName: string = '';
                switch (item.listInfo.joinType) {
                    case ListJoinType.Separator: joinTypeName = `Separator`; break;
                    case ListJoinType.Terminator: joinTypeName = `Terminator`; break;
                    case ListJoinType.Initiator: joinTypeName = `Initiator`; break;
                }
                this.simpleCheck(!!item.listInfo.joinText, `${joinTypeName} should be followed by a string between '[' and ']' (no whitespace allowed) ${this.location(item)}.`);
            } else { // the user has only entered 'vertical' or 'horizontal'
                // create default join type
                item.listInfo.joinType = ListJoinType.Separator;
            }
        } else {
            //create default
            item.listInfo = new ListInfo();
            item.listInfo.isTable = false;
            item.listInfo.direction = PiEditProjectionDirection.Vertical;
            item.listInfo.joinType = ListJoinType.Separator;
            item.listInfo.joinText = ", ";
        }
    }

    private checkSuperProjection(item: PiEditSuperProjection, cls: PiClassifier) {
        // LOGGER.log("checking super projection: " + cls?.name);
        const myParent = item.superRef.referred;
        this.nestedCheck({
            check: !!myParent,
            error: `Cannot find "${item.superRef.name}" ${this.location(item)}`,
            whenOk: () => {
                // see if myParent is indeed one of the implemented interfaces or a super concept
                if (myParent instanceof PiConcept) {
                    const mySupers = LangUtil.superConcepts(cls);
                    this.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Concept ${myParent.name} is not a base concept of ${cls.name} ${this.location(item.superRef)}.`);
                } else if (myParent instanceof PiInterface) {
                    const mySupers = LangUtil.superInterfaces(cls);
                    this.simpleCheck(!!mySupers.find(superCl => superCl === myParent),
                        `Interface ${myParent.name} is not implemented by ${cls.name} ${this.location(item.superRef)}.`);
                }
            }
        });
    }

    private checkOptionalProjection(item: PiOptionalPropertyProjection, cls: PiClassifier) {
        // LOGGER.log("checking optional projection for " + cls?.name);
        const propProjections: PiEditPropertyProjection[] = [];
        item.lines.forEach(line => {
            this.checkLine(line, cls);
            propProjections.push(...line.items.filter(item => item instanceof PiEditPropertyProjection) as PiEditPropertyProjection[]);
        });
        this.nestedCheck({check: propProjections.length === 1,
            error: `There should be only one property within an optional projection, found ${propProjections.length} ${this.location(item)}`,
            whenOk: () => {
                // find the optional property and set item.property
                const myprop = propProjections[0].property.referred;
                this.simpleWarning(myprop.isOptional,
                    `Property '${myprop.name}' is not optional, therefore it should not be within an optional projection ${this.location(propProjections[0])}`)
                item.property = this.copyReference(propProjections[0].property);
            }
        });
    }

    private checkExtras(other: ExtraClassifierInfo) {
        // LOGGER.log("checking extra info on classifier " + other.classifier?.name);
        // check the reference shortcut and change the expression into a reference to a property
        if (!!other.referenceShortcutExp) {
            this.myExpressionChecker.checkLangExp(other.referenceShortcutExp, other.classifier.referred);
            const xx: PiProperty = other.referenceShortcutExp.findRefOfLastAppliedFeature();
            // checking is done by 'myExpressionChecker', still, to be sure, we surround this with an if-stat
            if (!!xx) {
                other.referenceShortCut = PiElementReference.create<PiProperty>(xx as PiProperty, "PiProperty");
                other.referenceShortCut.owner = this.language;
            }
        }
        if (!!other.trigger) {
            if (other.trigger === "ERROR") {
                this.simpleCheck(false,
                    `A trigger may not be an empty string ${this.location(other)}`);
                other.trigger = null;
            }
        }
        if (!!other.symbol) {
            if (other.symbol === "ERROR") {
                this.simpleCheck(false,
                    `A symbol may not be an empty string ${this.location(other)}`);
                other.symbol = null;
            }
        }
    }

    private resolveReferences(editorDef: PiEditUnit) {
        // LOGGER.log("resolving references ");
        for (const group of editorDef.projectiongroups) {
            for (const proj of group.projections) {
                proj.classifier.owner = this.language;
            }
            if (!!group.extras) {
                for (const proj of group.extras) {
                    proj.classifier.owner = this.language;
                }
            }
        }
    }

    private checkPropsWithTableProjection(editor: PiEditUnit) {
        // LOGGER.log("checking properties that have a TableProjection");
        for (const projection of this.propsWithTableProjection) {
            const myprop = projection.property.referred;
            const propEditor = editor.findTableProjectionForType(myprop.type.referred);
            if (propEditor === null || propEditor === undefined) {
                // create default listInfo if not present
                if (!(!!projection.listInfo)) {
                    projection.listInfo = new ListInfo();
                }
                this.simpleWarning(false,
                    `No table projection defined for '${myprop.name}', it will be shown as a vertical list ${this.location(projection)}.`);
            }
        }
    }

    private checkPropProjection(item: PiEditPropertyProjection, cls: PiClassifier) {
        // LOGGER.log("checking property projection for " + cls?.name);
        if (item instanceof PiOptionalPropertyProjection) {
            this.checkOptionalProjection(item, cls);
        } else {
            if (!!item.expression) {
                const myProp = cls.allProperties().find(prop => prop.name === item.expression.appliedfeature?.sourceName);
                this.nestedCheck({
                    check: !!myProp,
                    error: `Cannot find property "${item.expression.toPiString()}" ${this.location(item)}`,
                    whenOk: () => {
                        // set the 'property' attribute of the projection
                        item.property = PiElementReference.create<PiProperty>(myProp, "PiProperty");
                        item.property.owner = this.language;
                        item.expression = null;
                        // check the rest
                        if (!!item.boolInfo) {
                            // check whether the boolInfo is appropriate
                            this.checkBooleanPropertyProjection(item, myProp);
                        } else if (!!item.listInfo) {
                            this.nestedCheck({check: myProp.isList,
                                error: `Only properties that are lists can be displayed as list or table ${this.location(item)}.`,
                                whenOk: () => {
                                    // either create a default list projection or check the user defined one
                                    this.checkListProperty(item, myProp);
                                }
                            });
                        } else {
                            if (myProp.isList) {
                                this.checkListProperty(item, myProp);
                            }
                        }
                    }
                });
            }
        }
    }

    private static includesWhitespace(keyword: string) {
        return keyword.includes(" ") || keyword.includes("\n") || keyword.includes("\r") || keyword.includes("\t");
    }

    private copyReference(reference: PiElementReference<PiProperty>): PiElementReference<PiProperty> {
        const result: PiElementReference<PiProperty> = PiElementReference.create<PiProperty>(reference.referred, "PiProperty");
        result.owner = this.language;
        return result;
    }
}
