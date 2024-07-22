const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
require('dotenv').config()

const client = new DynamoDBClient({
    region: process.env.REGION,
    endpoint: process.env.DB_ENDPOINT
});

const docClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
    unmarshallOptions: { removeUndefinedValues: true }
});

module.exports = { docClient, client };