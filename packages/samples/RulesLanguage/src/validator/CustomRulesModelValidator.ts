// Generated by the Freon Language Generator.
import { FreError, FreErrorSeverity } from "@freon4dsl/core";
import { RulesModelDefaultWorker } from "../utils/gen/RulesModelDefaultWorker";
import { RulesModelCheckerInterface } from "./gen/RulesModelValidator";

export class CustomRulesModelValidator extends RulesModelDefaultWorker implements RulesModelCheckerInterface {
    errorList: FreError[] = [];
}
