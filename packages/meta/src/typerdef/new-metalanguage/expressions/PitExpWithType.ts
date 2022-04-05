// Generated by the ProjectIt Language Generator.

import { PitExp } from "./PitExp";
import { PiClassifier, PiElementReference } from "../../../languagedef/metalanguage";

/**
 * Class PitExpWithType is the implementation of the concept with the same name in the language definition file.
 * It uses mobx decorators to enable parts of the language environment, e.g. the editor, to react
 * to changes in the state of its properties.
 */
export class PitExpWithType extends PitExp  {
    /**
     * A convenience method that creates an instance of this class
     * based on the properties defined in 'data'.
     * @param data
     */
    static create(data: Partial<PitExpWithType>): PitExpWithType {
        const result = new PitExpWithType();
        if (!!data.inner) {
            result.inner = data.inner;
        }
        if (!!data.__expectedType) {
            result.__expectedType = data.__expectedType;
        }
        if (data.agl_location) {
            result.agl_location = data.agl_location;
        }
        return result;
    }

    inner: PitExp; // implementation of part 'inner'
    __expectedType: PiElementReference<PiClassifier>; // implementation of reference 'expectedType'

    /**
     * Convenience method for reference 'expectedType'.
     * Instead of returning a 'PiElementReference<PiClassifier>' object,
     * it returns the referred 'PiClassifier' object, if it can be found.
     */
    get expectedType(): PiClassifier {
        if (!!this.__expectedType) {
            return this.__expectedType.referred;
        }
        return null;
    }
    toPiString(): string {
        return `(${this.inner.toPiString()} as ${this.__expectedType.name})`;
    }
}
