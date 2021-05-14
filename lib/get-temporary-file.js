"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const tmp_1 = __importDefault(require("tmp"));
tmp_1.default.setGracefulCleanup();
function getTemporaryFile(node) {
    const sourceFile = node.getSourceFile();
    const tempFile = tmp_1.default.fileSync({ postfix: ".ts" });
    const filepath = tempFile.name.split(".").slice(0, -1).join(".");
    fs_1.writeFileSync(tempFile.name, sourceFile.getFullText());
    const fileModule = require(filepath);
    return fileModule;
}
exports.default = getTemporaryFile;
