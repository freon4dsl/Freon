import { observableprim, PiElementBaseImpl, PiNamedElement, PiUtils } from "@projectit/core";

export class SimpleElement extends PiElementBaseImpl implements PiNamedElement {

    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<SimpleElement>): SimpleElement {
        const result = new SimpleElement();
        if (!!data.name) {
            result.name = data.name;
        }
        if (!!data.parse_location) {
            result.parse_location = data.parse_location;
        }
        return result;
    }

    readonly $typename: string = "SimpleElement"; // holds the metatype in the form of a string
    $id: string; // a unique identifier
    // parse_location: PiParseLocation; // if relevant, the location of this element within the source from which it is parsed
    name: string; // implementation of name

    constructor(id?: string) {
        super();
        if (!!id) {
            this.$id = id;
        } else {
            this.$id = PiUtils.ID(); // uuid.v4();
        }
        // Both 'observableprim' and 'observableprimlist' change the get and set of the attribute
        // such that the part is observable. In lists no 'null' or 'undefined' values are allowed.
        observableprim(this, "name");
        this.name = "";
    }

    /**
     * Returns the metatype of this instance in the form of a string.
     */
    piLanguageConcept(): string {
        return this.$typename;
    }

    /**
     * Returns the unique identifier of this instance.
     */
    piId(): string {
        return this.$id;
    }

    /**
     * Returns true if this instance is a model concept.
     */
    piIsModel(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a model unit.
     */
    piIsUnit(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is an expression concept.
     */
    piIsExpression(): boolean {
        return false;
    }

    /**
     * Returns true if this instance is a binary expression concept.
     */
    piIsBinaryExpression(): boolean {
        return false;
    }
    /**
     * A convenience method that copies this instance into a new object.
     */
    copy(): SimpleElement {
        const result = new SimpleElement();
        if (!!this.name) {
            result.name = this.name;
        }
        return result;
    }
    /**
     * Matches a partial instance of this class to this object
     * based on the properties defined in the partial.
     * @param toBeMatched
     */
    public match(toBeMatched: Partial<SimpleElement>): boolean {
        let result: boolean = true;
        if (result && toBeMatched.name !== null && toBeMatched.name !== undefined && toBeMatched.name.length > 0) {
            result = result && this.name === toBeMatched.name;
        }
        return result;
    }
}