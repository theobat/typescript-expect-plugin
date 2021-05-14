"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exp = /^(\[.+\])\s{1}((not\.?)?(?:\w+))[\s{1}]?(.+)?/;
function parseComment(comment) {
    if (!comment)
        return;
    const match = comment.match(exp);
    if (!match)
        return;
    const [, params, method, , result] = match;
    const matcher = method;
    const isUndefined = result === undefined || result === "undefined";
    return {
        params: JSON.parse(params),
        matcher,
        result: isUndefined ? [undefined] : JSON.parse(`[${result}]`),
    };
}
exports.default = parseComment;
