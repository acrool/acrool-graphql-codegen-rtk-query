import autoBind from 'auto-bind';
import {pascalCase, camelCase} from 'change-case-all';
import {GraphQLSchema, OperationDefinitionNode, print} from 'graphql';
import {Types} from '@graphql-codegen/plugin-helpers';
import {
    ClientSideBaseVisitor,
    DocumentMode,
    getConfigValue,
    LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import {RTKQueryPluginConfig, RTKQueryRawPluginConfig} from './config.js';

export class RTKQueryVisitor extends ClientSideBaseVisitor<
  RTKQueryRawPluginConfig,
  RTKQueryPluginConfig
> {
    private _externalImportPrefix: string;
    private _endpoints: string[] = [];
    private _hooks: string[] = [];
    private _subscription: string[] = [];

    constructor(
        schema: GraphQLSchema,
        fragments: LoadedFragment[],
    protected rawConfig: RTKQueryRawPluginConfig,
    documents: Types.DocumentFile[],
    outputFile?: string,
    ) {
        super(schema, fragments, rawConfig, {
            documentMode: DocumentMode.string,
            importBaseApiFrom: getConfigValue(rawConfig.importBaseApiFrom, ''),
            importBaseApiAlternateName: getConfigValue(rawConfig.importBaseApiAlternateName, 'api'),
            addTransformResponse: getConfigValue(rawConfig.addTransformResponse, false),
            exportHooks: getConfigValue(rawConfig.exportHooks, false),
            exportApi: getConfigValue(rawConfig.exportApi, false),
            exportDocument: getConfigValue(rawConfig.exportDocument, false),
            overrideExisting: getConfigValue(rawConfig.overrideExisting, ''),
            exportApiName: getConfigValue(rawConfig.exportApiName, undefined),
            exportDefaultApi: getConfigValue(rawConfig.exportDefaultApi, true),
        });
        this._externalImportPrefix = this.config.importOperationTypesFrom
            ? `${this.config.importOperationTypesFrom}.`
            : '';
        this._documents = documents;

        // 自動推斷 apiName
        if (!this.config.exportApiName && outputFile) {
            // 例如 auth.query.generated.ts -> authApi
            const match = outputFile.match(/([^\/]+)\.(?:[a-zA-Z0-9]+)?\.generated\.ts$/) || outputFile.match(/([^\/]+)\.generated\.ts$/) || outputFile.match(/([^\/]+)\.ts$/);
            if (match && match[1]) {
                this.config.exportApiName = camelCase(match[1]) + 'Api';
            } else {
                this.config.exportApiName = 'api';
            }
        }

        autoBind(this);
    }

    public get imports(): Set<string> {
        return this._imports;
    }

    public get hasOperations() {
        return this._collectedOperations.length > 0;
    }

    public getImports(): string[] {
        const baseImports = super.getImports();

        if (!this.hasOperations) {
            return baseImports;
        }

        return [
            ...baseImports,
            `import {${this.config.importBaseApiAlternateName}} from '${this.config.importBaseApiFrom}';`,
            'import {gql, useSubscription, SubscriptionHookOptions} from \'@apollo/client\';',
        ];
    }

    public getInjectCall() {
        if (!this.hasOperations) {
            return '';
        }

        return (
            `
const injectedRtkApi = ${this.config.importBaseApiAlternateName}.injectEndpoints({
  ${
            !this.config.overrideExisting
                ? ''
                : `overrideExisting: ${this.config.overrideExisting},
  `
            }endpoints: (build) => ({${this._endpoints.join('')}
  }),
});

${this.config.exportDefaultApi ?
                'export default injectedRtkApi;' :
                this.config.exportApi ? 
                    `export { injectedRtkApi as ${this.config.exportApiName || 'api'} };` :
                    ''}
` +
      (this.config.exportHooks
          ? `export const { ${this._hooks.join(', ')} } = injectedRtkApi;`
          : '') +
      '\n\n' +
      (this.config.exportHooks
          ? `${this._subscription.join('\n')}`
          : '') +
      '\n\n'
        );
    }

    private injectTransformResponse(Generics: string): string {
        if (this.config.addTransformResponse) {
            const responseType = Generics.split(',')[0];
            return `transformResponse: (response: ${responseType}) => response`;
        }
        return '';
    }

    /**
     * Generate subscription Hook
     * @param node
     * @param documentVariableName
     * @param operationName
     * @param operationResultType
     * @param operationVariablesTypes
     * @param hasRequiredVariables
     */
    generateSubscriptionHook(
        node: OperationDefinitionNode,
        documentVariableName: string,
        operationName: string,
        operationResultType: string,
        operationVariablesTypes: string,
        hasRequiredVariables: boolean,
    ): string {
        const variables = `args${hasRequiredVariables ? '' : '?'}: SubscriptionHookOptions<TData, ${operationVariablesTypes}>`;

        const typedFetcher = `useSubscription<TData, ${operationVariablesTypes}>`;
        const impl = `${typedFetcher}(gql(${documentVariableName}), args);`;

        return `export const use${operationName} = <
      TData = ${operationResultType},
      TError = unknown
    >(
      ${variables},
    ) =>
      ${impl}
    `;
    }

    protected buildOperation(
        node: OperationDefinitionNode,
        documentVariableName: string,
        operationType: 'Query' | 'Mutation' | 'Subscription',
        operationResultType: string,
        operationVariablesTypes: string,
        hasRequiredVariables: boolean,
    ): string {
        operationResultType = this._externalImportPrefix + operationResultType;
        operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;
        const operationName = node.name?.value;
        if (!operationName) return '';

        // if (operationType === 'Subscription') {
        //     // eslint-disable-next-line no-console
        //     console.warn(
        //         `Plugin "typescript-rtk-query" does not support GraphQL Subscriptions at the moment! Skipping "${node.name?.value}"...`,
        //     );
        //     return '';
        // }
        if (operationType === 'Subscription') {
            this._subscription.push(this.generateSubscriptionHook(
                node,
                documentVariableName,
                operationName,
                operationResultType,
                operationVariablesTypes,
                hasRequiredVariables,
            ));
            return '';
        }

        const Generics = `${operationResultType}, IUseFetcherArgs<${operationVariablesTypes}>${
            hasRequiredVariables ? '' : ' | void'
        }`;

        const operationTypeString = operationType.toLowerCase();

        const functionsString =
      `query: (args) => ({ document: ${documentVariableName}, args })
      ${this.injectTransformResponse(Generics)}`.trim();

        const endpointString = `
    ${operationName}: build.${operationTypeString}<${Generics}>({
      ${functionsString}
    }),`;

        this._endpoints.push(endpointString);

        if (this.config.exportHooks) {
            if (operationType === 'Query') {
                this._hooks.push(`use${pascalCase(operationName)}Query`);
                this._hooks.push(`useLazy${pascalCase(operationName)}Query`);
            }
            if (operationType === 'Mutation') {
                this._hooks.push(`use${pascalCase(operationName)}Mutation`);
            }
        }

        return '';
    }

    public OperationDefinition(node: OperationDefinitionNode) {
        // 保留父類別副作用（如 endpoints/hook 組裝）
        super.OperationDefinition(node);
        const operationName = node.name?.value;
        if (!operationName) return null;

        const documentVar = `${pascalCase(operationName)}Document`;
        const queryString = `
${print(node)}`;

        // 取得 operation 依賴的 fragment 名稱
        const fragmentSpreads = [];
        const visitSelectionSet = (selectionSet) => {
            if (!selectionSet || !selectionSet.selections) return;
            for (const selection of selectionSet.selections) {
                if (selection.kind === 'FragmentSpread') {
                    fragmentSpreads.push(selection.name.value);
                } else if (selection.selectionSet) {
                    visitSelectionSet(selection.selectionSet);
                }
            }
        };
        visitSelectionSet(node.selectionSet);
        // 組合 fragment 變數
        let fragmentVars = '';
        if (fragmentSpreads.length > 0) {
            fragmentVars = '\n' + fragmentSpreads.map(name => `\${${pascalCase(name)}}`).join('');
        }

        return `${this.config.exportDocument ? 'export ' : ' '}const ${documentVar} = \`${queryString}${fragmentVars}\`;`;
    }

    // 移除 fragments getter，覆寫為空
    // public get fragments(): string {
    //     return '';
    // }
}
