"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const typescript_1 = __importStar(require("typescript"));
const byots_1 = __importDefault(require("byots"));
const ts_node_1 = require("ts-node");
const visit_1 = __importDefault(require("./visit"));
const message_bag_1 = require("./message-bag");
const consts_1 = require("./consts");
ts_node_1.register({
    compilerOptions: {
        target: "ESNext",
    },
});
class Adapter {
    constructor({ logger, getSourceFile }) {
        this.logger = logger;
        this.getSourceFile = getSourceFile;
        this.messageBag = new message_bag_1.MessageBag();
    }
    getSemanticDiagnostics(delegate, fileName) {
        const original = delegate(fileName);
        try {
            this.messageBag.clear();
            const sourceFile = this.getSourceFile(fileName);
            if (!sourceFile)
                return original;
            visit_1.default(sourceFile, this.messageBag);
            const diagnostics = original.length
                ? []
                : this.transformErrorsToDiagnostics(sourceFile);
            return [...original, ...diagnostics];
        }
        catch (error) {
            this.logger(error.message ? error.message : "unknown error");
            return original;
        }
    }
    getCompletionsAtPosition(delegate, fileName, position, options) {
        var _a, _b;
        let original = delegate(fileName, position, options);
        const source = this.getSourceFile(fileName);
        const token = byots_1.default.getTokenAtPosition(source, position);
        if (byots_1.default.isJSDocTag(token) && original) {
            original.entries = [
                ...original.entries,
                {
                    kind: typescript_1.ScriptElementKind.keyword,
                    kindModifiers: "",
                    name: "expect",
                    sortText: "0",
                },
            ];
        }
        if (byots_1.default.isInComment(source, position) && byots_1.default.isJSDoc(token)) {
            if (!original) {
                original = {
                    entries: [],
                    isGlobalCompletion: false,
                    isMemberCompletion: false,
                    isNewIdentifierLocation: false,
                };
            }
            const tag = (_a = token.tags) === null || _a === void 0 ? void 0 : _a.find((item) => {
                var _a;
                return item.end + ((_a = item.comment) === null || _a === void 0 ? void 0 : _a.length) + 1 >= position &&
                    item.pos <= position;
            });
            const isExpectTag = tag && tag.comment && tag.tagName.escapedText === "expect";
            if (isExpectTag) {
                const hasNotKeyword = (_b = tag.comment) === null || _b === void 0 ? void 0 : _b.includes("not");
                const fnKeyword = consts_1.EXPECT_KEYWORDS.find((keyword) => { var _a; return (_a = tag.comment) === null || _a === void 0 ? void 0 : _a.includes(keyword); }) ||
                    "";
                const keywordPosition = tag.end + tag.comment.indexOf(fnKeyword) + fnKeyword.length;
                original.entries = [
                    ...original.entries,
                    ...[
                        ...(hasNotKeyword || fnKeyword ? [] : ["not"]),
                        ...(fnKeyword && keywordPosition !== position
                            ? []
                            : consts_1.EXPECT_KEYWORDS),
                    ].map((name) => ({
                        kind: typescript_1.ScriptElementKind.functionElement,
                        name,
                        kindModifiers: "",
                        sortText: "0",
                    })),
                ];
            }
        }
        return original;
    }
    getQuickInfoAtPosition(delegate, fileName, position) {
        var _a;
        const original = delegate(fileName, position);
        // Remove expect tags when user hover function name
        if (original) {
            original.tags = (_a = original.tags) === null || _a === void 0 ? void 0 : _a.filter((item) => item.name !== "expect");
        }
        return original;
    }
    getCompletionEntryDetails(delegate, fileName, position, entryName, formatOptions, source, preferences) {
        var _a;
        const original = delegate(fileName, position, entryName, formatOptions, source, preferences);
        // Remove expect tags for autocomplete popup
        if (original) {
            original.tags = (_a = original.tags) === null || _a === void 0 ? void 0 : _a.filter((item) => item.name !== "expect");
        }
        return original;
    }
    getSignatureHelpItems(delegate, fileName, position, options) {
        const original = delegate(fileName, position, options);
        // Remove expect tags for autocomplete popup
        if (original) {
            original.items = original.items.map((item) => {
                var _a;
                return (Object.assign(Object.assign({}, item), { 
                    // Remove expect tags from signature tooltip
                    tags: (_a = item.tags) === null || _a === void 0 ? void 0 : _a.filter((item) => item.name !== "expect") }));
            });
        }
        return original;
    }
    transformErrorsToDiagnostics(sourceFile) {
        return this.messageBag.messages.map((item) => ({
            category: typescript_1.default.DiagnosticCategory.Error,
            file: sourceFile,
            messageText: item.content,
            start: item.pos,
            length: item.end - item.pos - 1,
            code: consts_1.TS_LANGSERVICE_EXPECT_DIAGNOSTIC_ERROR_CODE,
        }));
    }
}
exports.Adapter = Adapter;
