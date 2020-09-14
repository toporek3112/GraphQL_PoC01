const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt, GraphQLEnumType, GraphQLFloat } = require('graphql')

//Database connection to PostgreSQL
var knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
    }
});

const PersonType = new GraphQLObjectType({
    name: 'Person',
    description: 'A customer',
    fields: () => ({
        uuid: { type: GraphQLNonNull(GraphQLInt) },
        valid_from: { type: GraphQLNonNull(GraphQLString) },
        valid_to: { type: GraphQLNonNull(GraphQLString) },
        fullname: { type: GraphQLNonNull(GraphQLString) },
        firstname: { type: GraphQLNonNull(GraphQLString) },
        lastname: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        salutation: { type: GraphQLString },
        iscustomer: { type: GraphQLNonNull(GraphQLString) },
        gender: { type: GraphQLNonNull(new GraphQLEnumType({ name: 'Gender', values: { Male: { value: 'Male' }, Female: { value: 'Female' } } })) },
        placeofbirth: { type: GraphQLNonNull(GraphQLString) },
        countryofbirth: { type: GraphQLNonNull(GraphQLString) },
        nationality: { type: GraphQLNonNull(GraphQLString) },
        martialstatus: { type: GraphQLNonNull(GraphQLString) },
        birthdate: { type: GraphQLNonNull(GraphQLString) },
        formattedname: { type: GraphQLNonNull(GraphQLString) },
        location: { type: GraphQLNonNull(GraphQLFloat) },
        status: { type: GraphQLNonNull(GraphQLString) },
        club: { type: GraphQLNonNull(GraphQLString) },
        address: {
            type: AddressType,
            resolve: (person) => {
                return knex('address').where('uuid', person.uuid)
                .then((result) => (result[0]))
            }
        }
    })
})

const AddressType = new GraphQLObjectType({
    name: 'Address',
    description: 'A Address of a person',
    fields: () => ({
        uuid: { type: GraphQLNonNull(GraphQLInt) },
        streetname: { type: GraphQLNonNull(GraphQLString) },
        streetnumber: { type: GraphQLNonNull(GraphQLInt) },
        streetnumbersuffix: { type: GraphQLNonNull(GraphQLString) },
        postcode: { type: GraphQLNonNull(GraphQLInt) },
        city: { type: GraphQLNonNull(GraphQLString) },
        statorprovince: { type: GraphQLNonNull(GraphQLString) },
        country: { type: GraphQLNonNull(GraphQLString) },
        person: {
            type: PersonType,
            resolve: (address) => {
                return knex('person').where('uuid', address.uuid)
                .then((result) => (result[0]))
            }
        } 
    })
})

const rootQueryType = new GraphQLObjectType({
    name: 'GraphQL_PoC01',
    description: 'PoC01 for GraphQL',
    fields: () => ({
        person: {
            type: new GraphQLList(PersonType),
            description: 'List of All Persons',
            resolve: () => (knex.select('*').from('person'))
        },
        address: {
            type: new GraphQLList(AddressType),
            description: 'List of All Addresses',
            resolve: () => (knex.select('*').from('address'))
        }
    }),
})

const schema = new GraphQLSchema({
    query: rootQueryType
})

const app = express();

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
}));

let PORT = 5000;
app.listen(PORT, () => { console.log(`Server reachable on http://localhost:${PORT}/graphql`) })