# Acrool Graphql Codegen Plugins - rtk-query

<p align="center">
    This is a graphql code generator plugins use react hooks
</p>

<div align="center">

[![NPM](https://img.shields.io/npm/v/@acrool/graphql-codegen-rtk-query.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/graphql-codegen-rtk-query)
[![npm](https://img.shields.io/bundlejs/size/@acrool/graphql-codegen-rtk-query?style=for-the-badge)](https://github.com/acrool/@acrool/graphql-codegen-rtk-query/blob/main/LICENSE)
[![npm](https://img.shields.io/npm/l/@acrool/graphql-codegen-rtk-query?style=for-the-badge)](https://github.com/acrool/react-picker/blob/main/LICENSE)

[![npm downloads](https://img.shields.io/npm/dm/@acrool/graphql-codegen-rtk-query.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/graphql-codegen-rtk-query)
[![npm](https://img.shields.io/npm/dt/@acrool/graphql-codegen-rtk-query.svg?style=for-the-badge)](https://www.npmjs.com/package/@acrool/graphql-codegen-rtk-query)

</div>


## Features

- Graphql code generator plugins
- Quickly output grpahql .graphql to rtk-query hooks
- Directly customize using `rtk-query` methods, such as: `useQuery`, `useMutation`, `useInfiniteQuery`


## Install

```bash
yarn add -D @acrool/graphql-codegen-rtk-query
```

## Usage


add package.json script

```json
{
  "scripts":{
    "generate": "graphql-codegen --config ./codegen.ts"
  }
}
```


./codegen.ts

```ts
import {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: [
        './schema.graphql',
        'scalar Upload',
    ],
    documents: [
        './src/store/__generated__/**/*.graphql',
    ],
    config: {
        maybeValue: 'T | undefined',
        inputMaybeValue: 'T | null',
    },
    generates: {
        './src/store/__generated__/types.ts': {
            plugins: [
                'typescript',
                'typescript-resolvers',
                {
                    add: {
                        content: `
import {EDataLevel} from '@acrool/react-gantt';
import {ReadStream} from 'fs-capacitor';
import {IUseFetcherArgs} from '@/library/graphql/fetcher';

interface GraphQLFileUpload {
  filename: string
  mimetype: string
  encoding: string
  createReadStream(options?:{encoding?: string, highWaterMark?: number}): ReadStream
}`
                    }
                },
            ],
            config: {
                typesPrefix: 'I',
                enumPrefix: false,
                declarationKind: 'interface',
                strictScalars: false,
                skipTypename: true,
                inputValue: true,
                dedupeFragments: true,
                scalars: {
                    Upload: 'Promise<GraphQLFileUpload>',
                    ID: 'string',
                    IP: 'string',
                    UUID: 'string',
                    Role: 'Role',
                    Time: 'string',
                    FileData: 'string',
                    PeriodUnit: 'string',
                    Duration: 'number',
                    Locale: 'string',
                    TransactionID: 'string',
                    OrderBy: 'string',
                    Timestamp: 'string',
                    DataLevelProject: 'EDataLevel.Project',
                    DataLevelTeam: 'EDataLevel.Team',
                    DataLevelTask: 'EDataLevel.Task',
                },
            }
        },
        './src/store/__generated__/': {
            preset: 'near-operation-file',
            presetConfig: {
                extension: '.generated.ts',
                baseTypesPath: './types.ts'
            },
            plugins: [
                {
                    add: {
                        content: 'import {IUseFetcherArgs} from \'@/library/graphql/fetcher\';'
                    }
                },
                'typescript-operations',
                {
                    '@acrool/graphql-codegen-rtk-query': {
                        importBaseApiFrom: '@/library/redux/baseApi',
                        importBaseApiAlternateName: 'baseApi',
                        exportHooks: true,
                        exportApi: true,
                        exportDocument: false,
                        exportApiName: 'api',
                        exportDefaultApiName: true,
                    },
                },
            ],
            config: {
                typesPrefix: 'I',
                enumPrefix: false,
                declarationKind: 'interface',
                withMutationFn: true,
                strictScalars: false,
                skipTypename: true,
                inputValue: true,
                omitOperationSuffix: true,
            }
        },
    },
};

export default config;
```

copy ./src/example in your project lib path

add your gql file

run script

```bash
yarn generate
```





## Release

```bash
yarn build:rtk-query && npm publish ./src/rtk-query --access=public
yarn build:qtk-query && npm publish ./src/rtk-query --access=public
```

- [@acrool/graphql-codegen-rtk-query](https://github.com/acrool/acrool-graphql-codegen/tree/main/src/rtk-query)
- [Example](./src/example)


## License

MIT © [acrool](https://github.com/acrool)
