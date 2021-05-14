"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSDocExpectTags = exports.isJSDocExpectTag = void 0;
const typescript_1 = __importDefault(require("typescript"));
function isJSDocExpectTag(tag) {
    return tag.tagName.escapedText === "expect";
}
exports.isJSDocExpectTag = isJSDocExpectTag;
function getJSDocExpectTags(node) {
    return typescript_1.default.getAllJSDocTags(node, isJSDocExpectTag);
}
exports.getJSDocExpectTags = getJSDocExpectTags;
