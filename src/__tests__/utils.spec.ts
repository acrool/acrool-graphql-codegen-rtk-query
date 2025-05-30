import {parse, buildSchema} from 'graphql';
import {plugin} from '../index';



const basicDoc = parse(/* GraphQL */ `
    query testQuery {
        feed {
            id
            commentCount
            repository {
                full_name
                html_url
                owner {
                    avatar_url
                }
            }
        }
    }
`);

describe('My Plugin', () => {


    const schema = buildSchema(/* GraphQL */ `
        type Query {
            workspacesWithPagination: String!
            workspaces: String!
            workspace: String!
        }
        type Mutation {
            workspaceCreate: WorkspaceCreateInput!
        }
        type PaginateInput {
            name: String
        }
        type WorkspaceCreateInput {
            ownerId: String
        }
    `);
    const document = [{document: basicDoc}];

    const usedBefore = process.memoryUsage().heapUsed;

    it('Should greet', async () => {
        const result = await plugin(schema, document, {
            importBaseApiFrom: '@/library/graphql/baseApi',
            importBaseApiAlternateName: 'baseApi',
            exportHooks: true,
            exportApi: true,
            exportDocument: true,
            exportApiName: 'api',
            exportDefaultApi: true,
        });

        const usedAfter = process.memoryUsage().heapUsed;
        console.log(`Memory used by the function: ${(usedAfter - usedBefore) / 1024 / 1024} MB`);

        expect(result).toMatchSnapshot();
    });
});
