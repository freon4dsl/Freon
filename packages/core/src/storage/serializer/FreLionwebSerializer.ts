// import { astToString } from "../../ast-utils/index.js";
import {
    LionWebJsonChunk,
    LionWebJsonContainment,
    LionWebJsonMetaPointer,
    LionWebJsonNode,
    LionWebJsonReference,
} from "@lionweb/validation";
import { runInAction } from "mobx";
import { FreNamedNode, FreNode, FreNodeReference } from "../../ast/index.js";
import { FreLanguage, FreLanguageProperty } from "../../language/index.js";
import { FreLogger } from "../../logging/index.js";
import { FreUtils, isNullOrUndefined } from "../../util/index.js";
import { FreSerializer } from "./FreSerializer.js";
import { createLionWebJsonNode, isLionWebJsonChunk } from "./NewLionwebM3.js";

const LOGGER = new FreLogger("FreLionwebSerializer");
/**
 * Helper types for nodes parsed from a Lionweb JSON.
 */
type ParsedChild = {
    featureName: string;
    isList: boolean;
    typeName?: string;
    referredId: string;
};
type ParsedReference = {
    featureName: string;
    isList: boolean;
    typeName?: string;
    referredId: string;
    resolveInfo: string;
};
type ParsedNode = {
    freNode: FreNode;
    children: ParsedChild[];
    references: ParsedReference[];
};

export class FreLionwebSerializer implements FreSerializer {
    private language: FreLanguage;
    private nodesfromJson: Map<string, ParsedNode> = new Map<string, ParsedNode>();

    constructor() {
        this.language = FreLanguage.getInstance();
    }

    /**
     * Convert a JSON object formerly JSON-ified by this very class and turn it into
     * a TypeScript object (being an instance of TypeScript class).
     * Works recursively.
     * THis methos assumes that the _jsonObject_ is a LionWeb chunk, representing one model unit.
     *
     * @param jsonObject JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    toTypeScriptInstance(jsonObject: Object): FreNode {
        LOGGER.log("toTypeScriptInstance");
        this.nodesfromJson.clear();
        FreLanguage.getInstance().stdLib.elements.forEach((elem) =>
            this.nodesfromJson.set(elem.freId(), { freNode: elem, children: [], references: [] }),
        );
        LOGGER.log("Starting ...");
        // TODO Does not work, as there never is an instance of class LwChuld being constructed.
        if (!isLionWebJsonChunk(jsonObject)) {
            LOGGER.error(`Cannot read json: jsonObject is not a LionWeb chunk:`);
        }
        // LOGGER.log(`jsonObject ${JSON.stringify(jsonObject)}`);
        const chunk = jsonObject as LionWebJsonChunk;
        const serVersion = chunk.serializationFormatVersion;
        LOGGER.log("SerializationFormatVersion: " + serVersion);
        // First read all nodes without children, and store them in a map.
        const nodes: LionWebJsonNode[] = chunk.nodes;
        // Not using AST.change(...) here, because we don't need an undo for this code
        runInAction( () => {
            for (const object of nodes) {
                // LOGGER.log("node: " + object.concept.key + "     with id " + object.id)
                const parsedNode = this.toTypeScriptInstanceInternal(object);
                if (parsedNode !== null) {
                    this.nodesfromJson.set(parsedNode.freNode.freId(), parsedNode);
                }
            }
            LOGGER.info("resolving children")
            this.resolveChildrenAndReferences();
            LOGGER.info("resolved children")
        })
        LOGGER.log("toTypeScriptInstance done with root")
        LOGGER.log("toTypeScriptInstance " + this.findRoot())
        return this.findRoot();
    }

    /**
     * We assume that there is exactly one unit node.
     * @private
     */
    private findRoot(): FreNode {
        // TODO Check next line
        const mapEntries: IterableIterator<ParsedNode> = this.nodesfromJson.values();
        for (const parsedNode of mapEntries) {
            if (parsedNode.freNode.freIsUnit()) {
                return parsedNode.freNode;
            }
        }
        return null;
    }

    private resolveChildrenAndReferences() {
        // TODO Check next line
        const mapEntries: IterableIterator<ParsedNode> = this.nodesfromJson.values();
        for (const parsedNode of mapEntries) {
            LOGGER.log(`resolveChildrenAndReferences or node ${parsedNode.freNode.freId()}`)
            for (const child of parsedNode.children) {
                LOGGER.info(`resolving child ` + JSON.stringify(child))
                const resolvedChild: ParsedNode = this.nodesfromJson.get(child.referredId);
                LOGGER.info(`resolvedChild ${resolvedChild?.freNode?.freId()}`)
                if (isNullOrUndefined(resolvedChild)) {
                    LOGGER.error("Child cannot be resolved: " + child.referredId);
                    continue;
                }
                if (child.isList) {
                    LOGGER.info(`isList ${child.featureName} ${child.isList} '${child.typeName}' + '${typeof parsedNode.freNode[child.featureName]}'`)
                    LOGGER.info(`      '${Array.isArray(parsedNode.freNode[child.featureName])}' push '${resolvedChild.freNode.freId()}'`)
                    parsedNode.freNode[child.featureName].push(resolvedChild.freNode);
                    LOGGER.info("pushed")
                } else {
                    LOGGER.info("NOT isList")
                    parsedNode.freNode[child.featureName] = resolvedChild.freNode;
                }
                LOGGER.info(`resolved child `)
            }
            for (const reference of parsedNode.references) {
                LOGGER.info(`resolving reference ` + JSON.stringify(reference))
                // const resolvedReference: ParsedNode = this.nodesfromJson.get(reference.referredId);
                // if (isNullOrUndefined(resolvedReference)) {
                //     LOGGER.error("Reference cannot be resolved: " + reference.referredId);
                //     continue;
                // }
                // TOIDO Create with id or resolveInfo
                const freonRef: FreNodeReference<any> = FreNodeReference.create(
                    reference.resolveInfo,
                    reference.typeName,
                );
                // freonRef.referred = resolvedReference.freNode;
                if (reference.isList) {
                    parsedNode.freNode[reference.featureName].push(freonRef);
                } else {
                    parsedNode.freNode[reference.featureName] = freonRef;
                }

                LOGGER.log("resolved reference: " + freonRef.typeName)
            }
        }
    }

    /**
     * Do the real work of instantiating the TypeScript object.
     *
     * @param LionWebJsonNode JSON object as converted from TypeScript by `toSerializableJSON`.
     */
    private toTypeScriptInstanceInternal(node: LionWebJsonNode): ParsedNode {
        LOGGER.info("toTypeScriptInstanceInternal node " + node.id)
        if (node === null) {
            throw new Error("Cannot read json 1: jsonObject is null.");
        }
        const jsonMetaPointer = node.classifier;
        const id: string = node.id;
        if (isNullOrUndefined(jsonMetaPointer)) {
            throw new Error(
                `Cannot read json 2: not a Freon structure, classifier name missing: ${JSON.stringify(node)}.`,
            );
        }
        const conceptMetaPointer = this.convertMetaPointer(jsonMetaPointer, node);
        LOGGER.log(`Metapointer is ${JSON.stringify(conceptMetaPointer)}`);
        const classifier = this.language.classifierByKey(conceptMetaPointer.key);
        // @ts-expect-error TS2345
        if (isNullOrUndefined(classifier)) {
            LOGGER.error(`1 Cannot read json 3: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        const tsObject: FreNode = this.language.createConceptOrUnit(classifier.typeName, id);
        if (isNullOrUndefined(tsObject)) {
            LOGGER.error(`2 Cannot read json 4: ${conceptMetaPointer.key} unknown.`);
            return null;
        }
        // Store id, so it will not be used for new instances
        FreUtils.nodeIdProvider.usedId(tsObject.freId());
        this.convertPrimitiveProperties(tsObject, conceptMetaPointer.key, node);
        const parsedChildren = this.convertChildProperties(conceptMetaPointer.key, node);
        const parsedReferences = this.convertReferenceProperties(conceptMetaPointer.key, node);
        LOGGER.info(`toTypeScriptInstanceInternal result ${JSON.stringify({ freNode: tsObject, children: parsedChildren, references: parsedReferences })}`)
        return { freNode: tsObject, children: parsedChildren, references: parsedReferences };
    }

    private convertPrimitiveProperties(freNode: FreNode, concept: string, jsonObject: LionWebJsonNode): void {
        const jsonProperties = jsonObject.properties;
        FreUtils.CHECK(
            Array.isArray(jsonProperties),
            "Found properties value which is not a Array for node: " + jsonObject.id,
        );
        for (const jsonProperty of Object.values(jsonProperties)) {
            LOGGER.log(">> creating property "+ JSON.stringify(jsonProperty) + " with value " + jsonProperty.value);
            const jsonMetaPointer = jsonProperty.property;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (property === undefined || property === null) {
                LOGGER.error("NULL PROPERTY for key " + propertyMetaPointer.key);
            }
            if (isNullOrUndefined(property)) {
                // FIXME known prpblems
                if (propertyMetaPointer.key !== "qualifiedName")
                    LOGGER.log("Unknown property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(!property.isList, "Lionweb does not support list properties: " + property.name);
            FreUtils.CHECK(
                property.propertyKind === "primitive",
                "Primitive value found for non primitive property: " + property.name,
            );
            const value = jsonProperty.value;
            if (isNullOrUndefined(value)) {
                throw new Error(`Cannot read json 5: ${JSON.stringify(property, null, 2)} value unset.`);
            }
            if (property.type === "string" || property.type === "identifier") {
                // this.checkValueToType(value, "string", property);
                freNode[property.name] = value;
            } else if (property.type === "number") {
                // this.checkValueToType(value, "number", property);
                freNode[property.name] = Number.parseInt(value as string);
            } else if (property.type === "boolean") {
                // this.checkValueToType(value, "boolean", property);
                freNode[property.name] = value === "true";
            }
        }
    }

    private convertMetaPointer(jsonObject: LionWebJsonMetaPointer, parent: Object): LionWebJsonMetaPointer {
        if (isNullOrUndefined(jsonObject)) {
            throw new Error(`Cannot read json 6: not a MetaPointer: ${JSON.stringify(parent)}.`);
        }

        const language = jsonObject.language;
        if (isNullOrUndefined(language)) {
            throw new Error(`MetaPointer misses metamodel: ${JSON.stringify(jsonObject)}`);
        }
        const version = jsonObject.version;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses version: ${JSON.stringify(jsonObject)}`);
        }
        const key = jsonObject.key;
        if (isNullOrUndefined(version)) {
            throw new Error(`MetaPointer misses key: ${JSON.stringify(jsonObject)}`);
        }
        return {
            language: language,
            version: version,
            key: key,
        };
    }

    // TODO Check Parameter FreNode removed
    private convertChildProperties(concept: string, jsonObject: LionWebJsonNode): ParsedChild[] {
        const jsonChildren = jsonObject.containments;
        FreUtils.CHECK(
            Array.isArray(jsonChildren),
            "Found children value which is not a Array for node: " + jsonObject.id,
        );
        const parsedChildren: ParsedChild[] = [];
        for (const jsonChild of Object.values(jsonChildren)) {
            LOGGER.info(`convertChildProperties ${JSON.stringify(jsonChild.containment)}`)
            const jsonMetaPointer = jsonChild.containment;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (isNullOrUndefined(property)) {
                LOGGER.log("Unknown child property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(
                property.propertyKind === "part",
                "Part value found for non part property: " + property.name,
            );
            const jsonValue = jsonChild.children;
            FreUtils.CHECK(
                Array.isArray(jsonValue),
                "Found child value which is not a Array for property: " + property.name,
            );
            for (const item of jsonValue as []) {
                if (!isNullOrUndefined(item)) {
                    parsedChildren.push({ featureName: property.name, isList: property.isList, referredId: item });
                }
            }
        }
        LOGGER.info("convertChildProperties resuilt is " + JSON.stringify(parsedChildren))
        return parsedChildren;
    }

    // TODO Check Parameter FreNode removed
    private convertReferenceProperties(concept: string, jsonObject: LionWebJsonNode): ParsedReference[] {
        const jsonReferences = jsonObject.references;
        FreUtils.CHECK(
            Array.isArray(jsonReferences),
            "Found references value which is not a Array for node: " + jsonObject.id,
        );
        const parsedReferences: ParsedReference[] = [];
        for (const jsonReference of Object.values(jsonReferences)) {
            LOGGER.info(`convertReferenceProperties ${JSON.stringify(jsonReference.reference)}`)
            const jsonMetaPointer = jsonReference.reference;
            const propertyMetaPointer = this.convertMetaPointer(jsonMetaPointer, jsonObject);
            const property: FreLanguageProperty = this.language.classifierPropertyByKey(
                concept,
                propertyMetaPointer.key,
            );
            if (isNullOrUndefined(property)) {
                LOGGER.error("Unknown reference property: " + propertyMetaPointer.key + " for concept " + concept);
                continue;
            }
            FreUtils.CHECK(
                property.propertyKind === "reference",
                "Reference value found for non reference property: " + property.name,
            );
            const jsonValue = jsonReference.targets;
            FreUtils.CHECK(
                Array.isArray(jsonValue),
                "Found targets value which is not a Array for property: " + property.name,
            );
            for (const item of jsonValue) {
                if (!isNullOrUndefined(item)) {
                    if (typeof item === "object") {
                        // New reference format with resolveInfo
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item.reference,
                            resolveInfo: item.resolveInfo,
                        });
                    } else if (typeof item === "string") {
                        // OLD reference format, just an id
                        parsedReferences.push({
                            featureName: property.name,
                            isList: property.isList,
                            typeName: property.type,
                            referredId: item,
                            resolveInfo: "",
                        });
                    } else {
                        LOGGER.log("Incorrect reference format: " + JSON.stringify(item));
                    }
                }
            }
        }
        return parsedReferences;
    }

    // private checkValueToType(value: any, shouldBeType: string, property: FreLanguageProperty) {
    //     if (typeof value !== shouldBeType) {
    //         throw new Error(`Value of property '${property.name}' is not of type '${shouldBeType}'.`);
    //     }
    // }

    /**
     * Create JSON Object, storing references as names.
     */
    public convertToJSON(freNode: FreNode, publicOnly?: boolean): LionWebJsonNode[] {
        const typename = freNode.freLanguageConcept();
        LOGGER.log("start converting concept name " + typename + ", publicOnly: " + publicOnly);

        const idMap = new Map<string, LionWebJsonNode>();
        // @ts-expect-error error TS6133: 'root' is declared but its value is never read.
        // TODO untangle function convertToJSONinternal
        let root: LionWebJsonNode;
        if (publicOnly !== undefined && publicOnly) {
            console.error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
            throw new Error("Use of publicOnly in FreLionWebSerializer.ts, should never happen!")
        } else {
            root = this.convertToJSONinternal(freNode, idMap);
        }
        LOGGER.log("end converting concept name " + JSON.stringify(Object.values(idMap)));
        return Object.values(idMap);
    }

    private convertToJSONinternal(
        freNode: FreNode,
        idToLionWebJsonNodeMap: Map<string, LionWebJsonNode>,
    ): LionWebJsonNode {
        let result = idToLionWebJsonNodeMap.get(freNode.freId());
        if (result !== undefined) {
            LOGGER.error("already found: " + freNode.freId());
            return result;
        }
        const typename = freNode.freLanguageConcept();
        result = createLionWebJsonNode();
        idToLionWebJsonNodeMap[freNode.freId()] = result;
        result.id = freNode.freId();
        result.parent = freNode?.freOwner()?.freId();
        if (result.parent === undefined || freNode.freIsUnit()) {
            result.parent = null;
        }

        let lionWebConceptKey: string;
        let lionWebLanguage: string;
        const concept = this.language.concept(typename);
        if (concept !== undefined) {
            lionWebConceptKey = concept.key;
            lionWebLanguage = concept.language;
        } else {
            // Should be a ModelUnit
            const unit = this.language.unit(typename);
            lionWebConceptKey = unit?.key;
            lionWebLanguage = unit?.language;
        }
        if (lionWebConceptKey === undefined) {
            LOGGER.error(`Unknown concept key: ${typename}`);
            return undefined;
        }
        result.classifier = this.createMetaPointer(lionWebConceptKey, lionWebLanguage);
        // LOGGER.log("typename: " + typename);
        for (const p of this.language.allConceptProperties(typename)) {
            // LOGGER.log(">>>> start converting property " + p.name + " of type " + p.propertyKind);
            this.convertPropertyToJSON(p, freNode, result, idToLionWebJsonNodeMap);
            // LOGGER.log("<<<< end converting property  " + p.name);
        }
        return result;
    }

    private createMetaPointer(key: string, language: string): LionWebJsonMetaPointer {
        // const result = {};
        return {
            language: language,
            // TODO hardcoded version, need to include language version in Freon proprely
            version: "2023.1",
            key: key,
        };
    }

    private convertPropertyToJSON(
        p: FreLanguageProperty,
        parentNode: FreNode,
        result: LionWebJsonNode,
        idMap: Map<string, LionWebJsonNode>,
    ) {
        // const typename = parentNode.freLanguageConcept();
        if (p.id === undefined) {
            LOGGER.log(`no id defined for property ${p.name}`);
            return;
        }
        switch (p.propertyKind) {
            case "part":
                const value = parentNode[p.name];
                if (value === null || value === undefined) {
                    LOGGER.log("PART is null: " + parentNode["name"] + "." + p.name);
                    break;
                }
                const child: LionWebJsonContainment = {
                    containment: this.createMetaPointer(p.key, p.language),
                    children: [],
                };
                if (p.isList) {
                    const parts: FreNode[] = parentNode[p.name];
                    for (const part of parts) {
                        child.children.push(this.convertToJSONinternal(part, idMap).id);
                    }
                } else {
                    // single value
                    child.children.push(
                        (!!value ? this.convertToJSONinternal(value as FreNode, idMap) : null).id,
                    );
                }
                result.containments.push(child);
                break;
            case "reference":
                const lwReference: LionWebJsonReference = {
                    reference: this.createMetaPointer(p.key, p.language),
                    targets: [],
                };
                if (p.isList) {
                    const references: FreNodeReference<FreNamedNode>[] = parentNode[p.name];
                    LOGGER.log("References for " + p.name + ": " + references);
                    for (const ref of references) {
                        if (ref === null || ref === undefined) {
                            LOGGER.log("REF NULL for " + p.name);
                            break;
                        }
                        const referredId = ref?.referred?.freId();
                        if (!!ref.name || !!referredId) {
                            lwReference.targets.push({
                                resolveInfo: ref.name,
                                reference: referredId ?? null,
                            });
                        }
                    }
                } else {
                    // single reference
                    const ref: FreNodeReference<FreNamedNode> = parentNode[p.name];
                    if (ref === null || ref === undefined) {
                        LOGGER.log("REF NULL for " + p.name + " parant " + parentNode["name"]);
                        break;
                    }
                    const referredId = ref?.referred?.freId();
                    if (!!ref.name || !!referredId) {
                        const referenceProp = ref?.referred?.freId();
                        lwReference.targets.push({
                            resolveInfo: !!ref ? ref["name"] : null,
                            reference: referenceProp ?? null,
                        });
                    }
                }
                result.references.push(lwReference);
                break;
            case "primitive":
                const value2 = parentNode[p.name];
                result.properties.push({
                    property: this.createMetaPointer(p.key, p.language),
                    value: propertyValueToString(value2),
                });
                break;
            default:
                break;
        }
    }
}

function propertyValueToString(value: any): string {
    switch (typeof value) {
        case "string":
            return value;
        case "boolean":
            return value === true ? "true" : "false";
        case "number":
            return "" + value;
        default:
            return value;
    }
}

// TODO clean up this unused code
// function printModel(element: FreNode): string {
//     return JSON.stringify(element, skipReferences, "  " );
// }

// const ownerprops = ["$$owner", "$$propertyName", "$$propertyIndex"]; // "$id"];

// function skipReferences(key: string, value: Object) {
//     if (ownerprops.includes(key)) {
//         return undefined;
//     } else if ( value instanceof FreNodeReference) {
//         return "REF --|" ;
//     } else {
//         return value;
//     }
// }
