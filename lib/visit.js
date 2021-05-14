"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const expect_1 = __importDefault(require("expect"));
const parse_comment_1 = __importDefault(require("./parse-comment"));
const get_temporary_file_1 = __importDefault(require("./get-temporary-file"));
const get_expect_tag_1 = require("./get-expect-tag");
exports.default = (node, messageBag) => {
    let defaultExport;
    let namedExports = [];
    try {
        // Get default export
        node.forEachChild((node) => {
            if (typescript_1.default.isExportAssignment(node) && typescript_1.default.isIdentifier(node.expression)) {
                defaultExport = node.expression;
            }
        });
        // Get named exports
        node.forEachChild((node) => {
            if (typescript_1.default.isExportDeclaration(node)) {
                node.exportClause.forEachChild((item) => {
                    if (typescript_1.default.isExportSpecifier(item)) {
                        namedExports = [...namedExports, item.name];
                    }
                });
            }
        });
        node.forEachChild((node) => {
            const isTopLevel = typescript_1.default.isSourceFile(node.parent);
            if (typescript_1.default.isFunctionDeclaration(node) && isTopLevel) {
                if (hasExportModifier(node) || hasNamedExport(namedExports, node)) {
                    executeTest(node, messageBag);
                }
                if (isDefaultExport(defaultExport, node)) {
                    executeTest(node, messageBag, {
                        defaultExport: true,
                    });
                }
            }
        });
    }
    catch (err) { }
};
function hasNamedExport(namedExports, node) {
    return namedExports.find((item) => item.escapedText === node.name.escapedText);
}
function isDefaultExport(defaultExport, node) {
    return defaultExport && node.name.escapedText === defaultExport.escapedText;
}
function hasExportModifier(node) {
    var _a;
    return (_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some((item) => item.kind === typescript_1.default.SyntaxKind.ExportKeyword);
}
function executeTest(node, messageBag, options = {}) {
    const expectTags = get_expect_tag_1.getJSDocExpectTags(node);
    try {
        var fileModule = get_temporary_file_1.default(node);
    }
    catch (err) {
        if (err.diagnosticText) {
            const [, pos, end] = err.diagnosticText.match(/\((\d+),(\d+)\)/);
            messageBag.add({
                pos,
                end,
                content: err.diagnosticText,
            });
        }
    }
    if (!fileModule) {
        return;
    }
    for (const tag of expectTags) {
        try {
            const comment = parse_comment_1.default(tag.comment);
            if (!comment)
                continue;
            const { matcher, params, result } = comment;
            const functionName = options.defaultExport ? "default" : node.name.text;
            const call = matcher
                .split(".")
                .reduce((prev, current) => prev[current], expect_1.default(fileModule[functionName](...params)));
            if (typeof call === "function") {
                call(...result);
            }
        }
        catch (err) {
            messageBag.add({
                pos: tag.pos,
                end: tag.end,
                content: err.message.replace(/\n\s*\n/g, "\n"),
            });
        }
    }
}
