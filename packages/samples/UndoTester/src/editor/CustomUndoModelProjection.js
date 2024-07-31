"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomUndoModelProjection = void 0;
/**
 * Class CustomUndoModelProjection provides an entry point for the language engineer to
 * define custom build additions to the editor.
 * These are merged with the custom build additions and other definition-based editor parts
 * in a three-way manner. For each modelelement,
 * (1) if a custom build creator/behavior is present, this is used,
 * (2) if a creator/behavior based on one of the editor definition is present, this is used,
 * (3) if neither (1) nor (2) yields a result, the default is used.
 */
var CustomUndoModelProjection = /** @class */ (function () {
    function CustomUndoModelProjection() {
        this.name = "Manual";
        this.nodeTypeToBoxMethod = new Map([
        // register your custom box methods here
        // ['NAME_OF_CONCEPT', this.BOX_FOR_CONCEPT],
        ]);
        this.nodeTypeToTableDefinition = new Map([
        // register your custom table definition methods here
        // ['NAME_OF_CONCEPT', this.TABLE_DEFINITION_FOR_CONCEPT],
        ]);
        // add your custom methods here
        // BOX_FOR_CONCEPT(node: NAME_OF_CONCEPT) : Box { ... }
        // TABLE_DEFINITION_FOR_CONCEPT() : FreTableDefinition { ... }
    }
    return CustomUndoModelProjection;
}());
exports.CustomUndoModelProjection = CustomUndoModelProjection;