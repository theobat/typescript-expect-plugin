"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginModuleFactory = void 0;
const language_service_proxy_builder_1 = require("./language-service-proxy-builder");
const adapter_1 = require("./adapter");
// TODO: Use provided typescript
const create = (ts) => (info) => {
    const { languageService, project } = info;
    const logger = (msg) => project.projectService.logger.info(`[typescript-jest-service] ${msg}`);
    const getProgram = () => {
        const program = languageService.getProgram();
        if (!program)
            throw new Error();
        return program;
    };
    const adapter = new adapter_1.Adapter({
        logger,
        getSourceFile(fileName) {
            return getProgram().getSourceFile(fileName);
        },
    });
    const proxy = new language_service_proxy_builder_1.LanguageServiceProxyBuilder(info)
        .wrap("getSemanticDiagnostics", (delegate) => adapter.getSemanticDiagnostics.bind(adapter, delegate))
        .wrap("getQuickInfoAtPosition", (delegate) => adapter.getQuickInfoAtPosition.bind(adapter, delegate))
        .wrap("getCompletionEntryDetails", (delegate) => adapter.getCompletionEntryDetails.bind(adapter, delegate))
        .wrap("getSignatureHelpItems", (delegate) => adapter.getSignatureHelpItems.bind(adapter, delegate))
        .wrap("getCompletionsAtPosition", (delegate) => adapter.getCompletionsAtPosition.bind(adapter, delegate))
        .build();
    return proxy;
};
const pluginModuleFactory = ({ typescript, }) => ({
    create: create(typescript),
});
exports.pluginModuleFactory = pluginModuleFactory;
