"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServiceProxyBuilder = void 0;
class LanguageServiceProxyBuilder {
    constructor(info) {
        this.wrappers = [];
        this.info = info;
    }
    wrap(name, wrapper) {
        this.wrappers.push({ name, wrapper });
        return this;
    }
    build() {
        const ret = this.info.languageService;
        this.wrappers.forEach(({ name, wrapper }) => {
            ret[name] = wrapper(this.info.languageService[name], this.info);
        });
        return ret;
    }
}
exports.LanguageServiceProxyBuilder = LanguageServiceProxyBuilder;
