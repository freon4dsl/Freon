import { PiLangConcept, PiLangEnumeration, PiLanguage, PiLangType } from "../metalanguage/PiLanguage";

/**
 * Defines all names that are used in the generation, to ensure they are identical
 * at each usage.
 */
export class Names {
    public static context(language: PiLanguage){
        return language.name + "Context";
    }

    public static actions(language: PiLanguage){
        return language.name + "Actions";
    }

    public static defaultActions(language: PiLanguage){
        return language.name + "DefaultActions";
    }

    public static manualActions(language: PiLanguage){
        return language.name + "ManualActions";
    }

    public static projectionDefault(language: PiLanguage){
        return language.name + "ProjectionDefault";
    }

    public static projection(language: PiLanguage){
        return language.name + "Projection";
    }

    public static editor(language: PiLanguage){
        return language.name + "Editor";
    }

    public static mainProjectionalEditor(language: PiLanguage){
        return "MainProjectionalEditor";
    }

    public static concept(concept: PiLangConcept){
        return concept.name;
    }

    public static enumeration(enumeration: PiLangEnumeration){
        return enumeration.name;
    }

    public static type(type: PiLangType){
        return type.name;
    }

    public static languageConceptType(language: PiLanguage){
        return language.name + "ConceptType";
    }

    public static allConcepts(language: PiLanguage){
        return "All" + language.name + "Concepts";
    }

    public static withTypeInterface(language: PiLanguage){
        return "WithType";
    }

    public static scoperInterface(language: PiLanguage){
        return "I" + language.name + "Scoper";
    }

    public static typerInterface(language: PiLanguage){
        return "I" + language.name + "Typer";
    }

}
