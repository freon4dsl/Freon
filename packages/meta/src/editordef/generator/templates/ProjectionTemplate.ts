import {
    PiBinaryExpressionConcept,
    PiClassifier,
    PiConceptProperty,
    PiExpressionConcept,
    PiLanguage,
    PiLimitedConcept,
    PiPrimitiveProperty, PiPrimitiveType,
    PiProperty
} from "../../../languagedef/metalanguage";
import {
    ENVIRONMENT_GEN_FOLDER,
    LANGUAGE_GEN_FOLDER,
    Names,
    PROJECTITCORE,
    Roles,
    sortConceptsWithBase
} from "../../../utils";
import {
    ListInfo, ListInfoType,
    PiEditConcept,
    PiEditInstanceProjection,
    PiEditParsedProjectionIndent,
    PiEditProjection,
    PiEditProjectionDirection,
    PiEditProjectionText,
    PiEditPropertyProjection,
    PiEditSubProjection,
    PiEditUnit
} from "../../metalanguage";
import { PiEditTableProjection } from "../../metalanguage/PiEditDefLang";
import { ParserGenUtil } from "../../../parsergen/parserTemplates/ParserGenUtil";

export class ProjectionTemplate {
    private tableProjections: PiEditConcept[] = []; // holds all concepts that have a table projection during the generation

    generateProjectionDefault(language: PiLanguage, editorDef: PiEditUnit, relativePath: string): string {
        // reset the table projections, then remember all concepts that have a table projection
        this.tableProjections = [];
        this.tableProjections.push(...editorDef.conceptEditors.filter(conceptDef => conceptDef.tableProjections.length > 0));

        let binaryConceptsWithDefaultProjection = language.concepts.filter(c => (c instanceof PiBinaryExpressionConcept))
            .filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        // sort the concepts such that base concepts come last
        binaryConceptsWithDefaultProjection = sortConceptsWithBase(binaryConceptsWithDefaultProjection, language.findExpressionBase());

        const nonBinaryConceptsWithDefaultProjection = language.concepts.filter(c => !(c instanceof PiBinaryExpressionConcept) ).filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return editor === undefined || editor.projection === null;
        });
        if (nonBinaryConceptsWithDefaultProjection.length > 0) {
            // console.error("Projection generator: there are elements without projections "+ nonBinaryConceptsWithDefaultProjection.map(c => c.name));
        }

        const allClassifiers: PiClassifier[] = [];
        // allClassifiers.push(language.modelConcept);
        allClassifiers.push(...language.units);
        allClassifiers.push(...language.concepts);

        const nonBinaryClassifiers: PiClassifier[] = allClassifiers.filter(c => !(c instanceof PiBinaryExpressionConcept));
        const binaryClassifiers: PiClassifier[] = allClassifiers.filter(c => c instanceof PiBinaryExpressionConcept);
        const classifiersWithTableProjection: PiClassifier[] = this.tableProjections.map(t => t.concept.referred);

        const nonBinaryConceptsWithProjection = nonBinaryClassifiers.filter(c => {
            const editor = editorDef.findConceptEditor(c);
            return !!editor && !!editor.projection;
        });

        const modelImports: string[] = allClassifiers.map(u => `${Names.classifier(u)}`)
            .concat(language.interfaces.map(c => `${Names.interface(c)}`));

        // TODO sort out unused imports
        return `
            import { observable, makeObservable } from "mobx";

            import {
                BoxFactory,
                Box,
                PiTableDefinition,
                TableUtil,
                ${Names.PiElement},
                ${Names.PiProjection},
                createDefaultBinaryBox,
                createDefaultExpressionBox,
                isPiBinaryExpression,
                ${Names.PiBinaryExpression},
                BoxUtils
            } from "${PROJECTITCORE}";

            import { ${Names.PiElementReference}, ${Names.allConcepts(language)}, ${modelImports.map(c => `${c}`).join(", ") } } from "${relativePath}${LANGUAGE_GEN_FOLDER }";
            import { ${Names.environment(language)} } from "${relativePath}${ENVIRONMENT_GEN_FOLDER}/${Names.environment(language)}";

             /**
             * Class ${Names.projectionDefault(language)} implements the default projections for elements of
             * language ${language.name}.
             * These are merged with the custom build additions and definition-based editor parts
             * in a three-way manner. For each modelelement,
             * (1) if a custom build creator/behavior is present, this is used,
             * (2) if a creator/behavior based on the editor definition is present, this is used,
             * (3) if neither (1) nor (2) yields a result, the default is used.
             */
            export class ${Names.projectionDefault(language)} implements ${Names.PiProjection} {
                rootProjection: ${Names.PiProjection};
                showBrackets: boolean = false;
                name: string = "${editorDef.name}";

                constructor(name?: string) {
                    if (!!name) {
                        this.name = name;
                    }
                    makeObservable(this, {
                        showBrackets: observable,
                    });
                }

                getBox(element: ${Names.PiElement}): Box {
                    if (element === null ) {
                        return null;
                    }

                    switch( element.piLanguageConcept() ) {
                        ${nonBinaryClassifiers.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.projectionFunction(c)} (element as ${Names.classifier(c)});`
                        ).join("  ")}
                        ${binaryClassifiers.map(c =>
                        `case "${Names.classifier(c)}" : return this.${Names.binaryProjectionFunction()} (element as ${Names.classifier(c)});`
                        ).join("  ")}
                    }
                    // nothing fits
                    throw new Error("No box defined for this expression:" + element.piId());
                }
                
                getTableDefinition(conceptName: string): PiTableDefinition {
                    if (conceptName === null || conceptName.length === 0) {
                        return null;
                    }

                    switch( conceptName ) {
                        ${classifiersWithTableProjection.map(c => `
                        case "${Names.classifier(c)}" : return this.${Names.tableCellFunction(c)} ();`).join("  ")}
                    }
                    // nothing fits
                    return null;
                }
                
                private ${Names.binaryProjectionFunction()} (element: ${Names.allConcepts(language)}) {
                    ${binaryConceptsWithDefaultProjection.map(c => 
                     `if (element instanceof ${Names.classifier(c)}) {
                        return this.createBinaryBox(element, "${editorDef.findConceptEditor(c).symbol}");
                     }`).join(" else ")}
                     return null;
                }              

                ${nonBinaryConceptsWithProjection.map(c => this.generateUserProjection(language, c, editorDef.findConceptEditor(c))).join("\n")}

                ${classifiersWithTableProjection.map(c => this.generateTableCellFunction(language, c, editorDef.findConceptEditor(c))).join("\n")}

                /**
                 *  Create a standard binary box to ensure binary expressions can be edited easily
                 */
                private createBinaryBox(exp: PiBinaryExpression, symbol: string): Box {
                    const binBox = createDefaultBinaryBox(exp, symbol, ${Names.environment(language)}.getInstance().editor);
                    if (
                        this.showBrackets &&
                        !!exp.piContainer().container &&
                        isPiBinaryExpression(exp.piContainer().container)
                    ) {
                        return BoxFactory.horizontalList(exp, "brackets", [
                            BoxUtils.labelBox(exp, "(", "bracket-open", true),
                            binBox,
                            BoxUtils.labelBox(exp, ")", "bracket-close", true)
                        ]);
                    } else {
                        return binBox;
                    }
                }
            }`;
    }

    private generateUserProjection(language: PiLanguage, concept: PiClassifier, editor: PiEditConcept) {
        // TODO for now: do not do anything for a limited concept
        if (editor.concept instanceof PiLimitedConcept) {
            return ``;
        }

        let result: string = "";
        const elementVarName = Roles.elementVarName(concept);
        const projection: PiEditProjection = editor.projection;
        const multiLine = projection.lines.length > 1;
        if (multiLine) {
            result += `BoxFactory.verticalList(${elementVarName}, "${concept.name}-overall", [
            `;
        }

        projection.lines.forEach( (line, index) => {
            if (line.indent > 0) {
                result += `BoxUtils.indentBox(${elementVarName}, ${line.indent}, "${index}", `;
            }
            if (line.items.length > 1) {
                result += `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${index}", [ `;
            }
            // Now all projection items in the line
            line.items.forEach((item, itemIndex) => {
                result += this.itemProjection(item, elementVarName, index, itemIndex, concept, language);
                if (! (item instanceof PiEditParsedProjectionIndent) && itemIndex < line.items.length - 1) {
                    result += ",";
                }
            });
            if (line.items.length > 1) {
                // TODO Too many things are now selectable, but if false, you cannot select e.g. an attribute
                result += ` ], { selectable: true } ) `;
            }
            if (line.indent > 0) {
                // end of line, finish indent when applicable
                result += ` )`;
            }
            if (index !== projection.lines.length - 1) {
              result += ",";
            }
        });
        if (multiLine) {
            result += ` ])`;
        }
        if (result === "") { result = "null"; }
        if (concept instanceof PiExpressionConcept) {
            return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.concept(concept)}) : Box {
                    return createDefaultExpressionBox( ${elementVarName}, "default-expression-box", [
                            ${result}
                        ],
                        { selectable: false }
                    );
                }`;
        } else {
            if (result[0] === "\n") {
                // TODO find out where this newline is added and make sure this is not done
                // this error occurred in openhab project for concept ItemModel (!!only for this concept)
                // for now:
                // console.log("FOUND NEWLINE");
                result = result.substr(1);
            }
            return `public ${Names.projectionFunction(concept)} (${elementVarName}: ${Names.classifier(concept)}) : Box {
                    return ${result};
                }`;
        }
    }

    private itemProjection(item: PiEditParsedProjectionIndent
                                | PiEditProjectionText
                                | PiEditPropertyProjection
                                | PiEditSubProjection
                                | PiEditInstanceProjection,
                           elementVarName: string,
                           lineIndex: number,
                           itemIndex: number,
                           concept: PiClassifier,
                           language: PiLanguage) {
        // TODO add table projection for lists
        let result: string = "";
        if (item instanceof PiEditProjectionText) {
            result += ` BoxUtils.labelBox(${elementVarName}, "${ParserGenUtil.escapeRelevantChars(item.text.trim())}", "${lineIndex}-item-${itemIndex}") `;
        } else if (item instanceof PiEditPropertyProjection) {
            result += this.propertyProjection(item, elementVarName, concept, language);
        } else if (item instanceof PiEditSubProjection) {
            result += this.optionalProjection(item, elementVarName, lineIndex, itemIndex, concept, language);
        }
        return result;
    }

    private optionalProjection(item: PiEditSubProjection, elementVarName: string, lineIndex: number, itemIndex: number, concept: PiClassifier,
                               language: PiLanguage): string {
        let result = "";
        item.items.forEach((subitem, subitemIndex) => {
            result += this.itemProjection(subitem, elementVarName, lineIndex, subitemIndex, concept, language);
            // Add a comma if there was a projection and its in the middle of the list
            if (! (subitem instanceof PiEditParsedProjectionIndent) && subitemIndex < item.items.length - 1) {
                result += ", ";
            }
        });

        // If there are more items, surround with horizontal list
        if (item.items.length > 1) {
            result = `BoxFactory.horizontalList(${elementVarName}, "${concept.name}-hlist-line-${lineIndex}-${itemIndex}", [${result}])`;
        }

        const propertyProjection: PiEditPropertyProjection = item.optionalProperty();
        const optionalPropertyName = (propertyProjection === undefined ? "UNKNOWN" : propertyProjection.propertyName());
        return `BoxFactory.optional(${elementVarName}, "optional-${optionalPropertyName}", () => (!!${elementVarName}.${optionalPropertyName}),
            ${ result},
            false, "<+>"
        )`;
    }

    /**
     * Projection template for a property.
     *
     * @param item      The property projection
     * @param elementVarName
     * @param concept
     * @param language
     * @private
     */
    private propertyProjection(item: PiEditPropertyProjection, elementVarName: string, concept: PiClassifier, language: PiLanguage) {
        let result: string = "";
        const appliedFeature: PiProperty = item.expression.appliedfeature.referredElement.referred;
        if (appliedFeature instanceof PiPrimitiveProperty) {
            result += this.primitivePropertyProjection(appliedFeature, elementVarName);
        } else if (appliedFeature instanceof PiConceptProperty) {
            if (appliedFeature.isPart) {
                if (appliedFeature.isList) {
                    if (!!item.listInfo) { // if there is information on how to project the appliedFeature as a list, make it a list
                        result += this.conceptPartListProjection(item, concept, appliedFeature, elementVarName);
                    } else if (!!item.tableInfo) {  // if there is information on how to project the appliedFeature as a table, make it a table
                        result += this.conceptPartTableProjection(item.tableInfo.direction, appliedFeature, elementVarName, language);
                    }
                } else { // single element
                    result += `BoxUtils.getBoxOrAlias(${elementVarName}, "${appliedFeature.name}", "${appliedFeature.type.name}", this.rootProjection) `;
                }
            } else { // reference
                if (appliedFeature.isList) {
                    if (!!item.listInfo) {
                        result += this.conceptReferenceListProjection(language, item.listInfo, appliedFeature, elementVarName);
                    } else if (!!item.tableInfo) {
                        // TODO adjust for tables
                    }
                } else { // single element
                    result += this.conceptReferenceProjection(language, appliedFeature, elementVarName);
                }
            }
        } else {
            result += `/* ERROR unknown property box here for ${appliedFeature.name} */ `;
        }
        return result;
    }

    /**
     * Returns the text string that projects 'property' as a table.
     * @param orientation       Either row or column based
     * @param property          The property to be projected
     * @param elementVarName    The name of the variable that holds the property at runtime
     * @param language          The language for which this projection is made
     * @private
     */
    private conceptPartTableProjection(orientation: PiEditProjectionDirection, property: PiConceptProperty, elementVarName: string, language: PiLanguage): string {
        // find the projection to use for the type of the given property
        const featureType: PiClassifier = property.type.referred;
        const propTypeProjection: PiEditConcept = this.tableProjections.find(proj => proj.concept.referred === featureType);
        // TODO handle multiple tableProjections, now the first is chosen
        const myTableProjection: PiEditTableProjection = propTypeProjection?.tableProjections[0];
        if (!myTableProjection) {
            console.error(`Cannot find a table projection for property ${property.name}.`);
            return `BoxUtils.labelBox(${elementVarName}, "Cannot find a table projection for this property.")`;
        }
        // create the cell getters
        let cellGetters: string = '';
        myTableProjection.cells.forEach((cell, index) =>
            cellGetters += `(cell${index}: ${Names.classifier(featureType)}): Box => {
                return ${this.itemProjection(cell, `cell${index}`, index, index, property.type.referred, language)}
            },\n`
        );
        // return the projection based on the orientation of the table
        if (orientation === PiEditProjectionDirection.Vertical) {
            return `TableUtil.tableBoxColumnOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.referred.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.referred.name}").cells,
                ${Names.environment(language)}.getInstance().editor)`;
        } else {
            return `TableUtil.tableBoxRowOriented(
                ${elementVarName},
                "${property.name}",
                this.rootProjection.getTableDefinition("${property.type.referred.name}").headers,
                this.rootProjection.getTableDefinition("${property.type.referred.name}").cells,
                ${Names.environment(language)}.getInstance().editor)`;
        }
    }

    /**
     * generate the part list
     *
     * @param item
     * @param concept
     * @param propertyConcept   The property for which the projection is generated.
     * @param elementVarName    The name of the element parameter of the getBox projection method.
     */
    private conceptPartListProjection(item: PiEditPropertyProjection, concept: PiClassifier, propertyConcept: PiConceptProperty, elementVarName: string) {
        let joinEntry = this.getJoinEntry(item.listInfo);
        if (item.listInfo.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
        } // else
        return `BoxUtils.horizontalPartListBox(${elementVarName}, "${propertyConcept.name}", this.rootProjection${joinEntry})`;
    }

    private conceptReferenceProjection(language: PiLanguage, appliedFeature: PiConceptProperty, element: string) {
        const featureType = Names.classifier(appliedFeature.type.referred);
        return `BoxUtils.referenceBox(
                                ${element},
                                "${appliedFeature.name}",
                                (selected: string) => {
                                    ${element}.${appliedFeature.name} = PiElementReference.create<${featureType}>(
                                       ${Names.environment(language)}.getInstance().scoper.getFromVisibleElements(
                                            ${element},
                                            selected,
                                            "${featureType}"
                                       ) as ${featureType}, "${featureType}");
                                },
                                ${Names.environment(language)}.getInstance().scoper
               )`;
    }

    private conceptReferenceListProjection(language: PiLanguage, listJoin: ListInfo, reference: PiConceptProperty, element: string) {
        let joinEntry = this.getJoinEntry(listJoin);
        if (listJoin.direction === PiEditProjectionDirection.Vertical) {
            return `BoxUtils.verticalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper ${joinEntry})`;
        } // else
        return `BoxUtils.horizontalReferenceListBox(${element}, "${reference.name}", ${Names.environment(language)}.getInstance().scoper ${joinEntry})`;
    }

    private getJoinEntry(listJoin: ListInfo) {
        let joinEntry: string = `, { text:"${listJoin.joinText}", type:"${listJoin.joinType}" }`;
        if (listJoin.joinType === ListInfoType.NONE || !(listJoin.joinText?.length > 0)) {
            joinEntry = "";
        }
        return joinEntry;
    }

    private primitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        if (property.isList) {
            return this.listPrimitivePropertyProjection(property, element);
        } else {
            return this.singlePrimitivePropertyProjection(property, element);
        }
    }

    private singlePrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        const listAddition: string = `${property.isList ? `, index` : ``}`;
        switch (property.type.referred) {
            case PiPrimitiveType.string:
            case PiPrimitiveType.identifier:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.number:
                return `BoxUtils.numberBox(${element}, "${property.name}"${listAddition})`;
            case PiPrimitiveType.boolean:
                // TODO labels
                return `BoxUtils.booleanBox(${element}, "${property.name}", {yes:"true", no:"false"}${listAddition})`;
            default:
                return `BoxUtils.textBox(${element}, "${property.name}"${listAddition})`;
        }
    }

    private listPrimitivePropertyProjection(property: PiPrimitiveProperty, element: string): string {
        return `BoxFactory.horizontalList(${element}, "${Roles.property(property)}-hlist",
                            (${element}.${property.name}.map( (item, index)  =>
                                ${this.singlePrimitivePropertyProjection(property, element)}
                            ) as Box[]).concat( [
                                // TODO  Create Action for the role to actually add an element.
                                BoxFactory.alias(${element}, "new-${Roles.property(property)}-hlist", "<+ ${property.name}>")
                            ])
                        )`;
    }

    private generateTableCellFunction(language: PiLanguage, c: PiClassifier, piEditConcept: PiEditConcept): string {
        // find the projection to use for the type of the given property
        const myTableProjection: PiEditTableProjection = piEditConcept?.tableProjections[0];
        if (!!myTableProjection) {
            // create the cell getters
            let cellGetters: string = '';
            myTableProjection.cells.forEach((cell, index) =>
                cellGetters += `(cell${index}: ${Names.classifier(c)}): Box => {
                    return ${this.itemProjection(cell, `cell${index}`, index, index, c, language)}
                },\n`
            );

            return `${Names.tableCellFunction(c)}(): PiTableDefinition {
                const result: PiTableDefinition = {
                    headers: [ ${myTableProjection.headers.map(head => `"${head}"`).join(", ")} ],
                    cells: [${cellGetters}]
                };
                return result;
            }
        `;
        } else {
            console.log("INTERNAL PROJECTIYT ERROR in generaateTableCellFunction");
            return "";
        }
    }
}
