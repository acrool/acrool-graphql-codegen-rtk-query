import {
    ClientSideBasePluginConfig,
    RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';

export interface RTKConfig {
  /**
   * @name importBaseApiFrom
   * @description Define where to import the base api to inject endpoints into
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importBaseApiFrom: string;

  /**
   * @name importBaseApiAlternateName
   * @description Change the import name of the baseApi from default 'api'
   * @default 'api'
   *

   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          importBaseApiAlternateName: 'alternateApiName'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importBaseApiAlternateName?: string;

  /**
   * @name exportHooks
   * @description Whether to export React Hooks from the generated api. Enable only when using the `"@reduxjs/toolkit/query/react"` import of `createApi`
   * @default false
   *

   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          exportHooks: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  exportHooks?: boolean;
  exportApi?: boolean;

  /**
   * @name overrideExisting
   * @description Sets the `overrideExisting` option, for example to allow for hot module reloading when running graphql-codegen in watch mode.
   * Will directly be injected as code.
   * @default undefined
   *

   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          overrideExisting: 'module.hot?.status() === "apply"'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  overrideExisting?: string;

  /**
   * @name addTransformResponse
   * @description Sets the `addTransformResponse` option, which will automatically add a types transformResponse for query
   * @default false
   *

   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          addTransformResponse: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addTransformResponse?: boolean;

  /**
   * @name apiName
   * @description 產生的 api export 名稱，預設為 'api'，可用於根據 output 檔名自訂。
   * @default 'api'
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  const config = {
   *    generates: {
   *      'src/apis/userApi.ts': {
   *        plugins: ['typescript-rtk-query'],
   *        config: {
   *          exportApiName: 'userApi',
   *        },
   *      },
   *    },
   *  };
   * ```
   */
  exportApiName?: string;
  exportDefaultApi?: boolean;

  /**
   * @name noExportDocument
   * @description 產生的 Document 變數不要加 export，預設為 false。
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  const config = {
   *    generates: {
   *      'src/apis/userApi.ts': {
   *        plugins: ['typescript-rtk-query'],
   *        config: {
   *          exportDocument: true,
   *        },
   *      },
   *    },
   *  };
   * ```
   */
  exportDocument?: boolean;
}

export interface RTKQueryRawPluginConfig extends RawClientSideBasePluginConfig, RTKConfig {}
export interface RTKQueryPluginConfig extends ClientSideBasePluginConfig, RTKConfig {}
