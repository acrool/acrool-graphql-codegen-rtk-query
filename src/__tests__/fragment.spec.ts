import {parse, buildSchema} from 'graphql';
import {plugin} from '../index';

const fragmentDoc = parse(/* GraphQL */ `
    fragment ResultIconSvg on IconSvg {
        id
        code
        viewBox
        content
        defs
    }
    query getIcon {
        iconSvg {
            ...ResultIconSvg
        }
    }
`);

describe('Fragment Plugin', () => {
    const schema = buildSchema(/* GraphQL */ `
        type Query {
            iconSvg: IconSvg!
        }
        type IconSvg {
            id: ID!
            code: String!
            viewBox: String
            content: String
            defs: String
        }
    `);
    const document = [{document: fragmentDoc}];

    it('should generate fragment and query correctly', async () => {
        const result = await plugin(schema, document, {
            importBaseApiFrom: '@/library/graphql/baseApi',
            importBaseApiAlternateName: 'baseApi',
            exportHooks: true,
            exportApi: true,
            exportDocument: true,
            exportApiName: 'api',
            exportDefaultApi: true,
        });
        expect(result).toMatchSnapshot();
    });
}); 