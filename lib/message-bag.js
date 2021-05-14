"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBag = void 0;
class MessageBag {
    constructor() {
        this.messages = [];
    }
    clear() {
        this.messages = [];
    }
    add(message) {
        this.messages = [...this.messages, message];
    }
}
exports.MessageBag = MessageBag;
