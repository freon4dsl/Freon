import {
    FreEditExternalProjection,
    FreEditParsedNewline,
    FreEditParsedProjectionIndent,
    FreEditProjectionText, FreEditPropertyProjection,
    FreEditSuperProjection
} from "./internal.js";

/**
 * Super type of all elements that may be part of a projection definition.
 * We use this format instead of inheritance, because the 'parsed' info should not be present
 * after in the parsing/checking phase.
 */
export type FreEditProjectionItem =
    FreEditParsedProjectionIndent    // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditParsedNewline           // removed after parsing, by FreEditParseUtil.normalize()
    | FreEditProjectionText
    | FreEditExternalProjection
    | FreEditPropertyProjection
    | FreEditSuperProjection ;