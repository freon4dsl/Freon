import { LanguageWorker, PiElement } from "@projectit/core";
import { DSprivate, DSpublic, DSref, DSunit, PiElementReference } from "../language/gen/index";

export class RefCreatorWorker implements LanguageWorker {

    units: DSunit[];

    constructor(units: DSunit[]) {
        this.units = units;
    }

    execAfter(modelelement: PiElement): boolean {
        switch( modelelement.piLanguageConcept()) {
            case "DSpublic": {
                const elem: DSpublic = modelelement as DSpublic;
                this.units.forEach(unit => {
                    const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                    unit.dsRefs.push(ref);
                    unit.dsPrivates.forEach(part => {
                        const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                    unit.dsPublics.forEach(part => {
                        const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                });
                break;
            }
            case "DSprivate": {
                const elem: DSprivate = modelelement as DSprivate;
                const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                this.units.forEach(unit => {
                    const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                    unit.dsRefs.push(ref);
                    unit.dsPrivates.forEach(part => {
                        const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                    unit.dsPublics.forEach(part => {
                        const ref: PiElementReference<DSref> = PiElementReference.create<DSref>(elem.name, "DSref");
                        part.conceptRefs.push(ref);
                    });
                });
                break;
            }
        }
        return false;
    }

    execBefore(modelelement: PiElement): boolean {
        return false;
    }

}
