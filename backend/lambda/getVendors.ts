import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  try {
    // Cognito user ID, set by the API Gateway authorizer after validating the token
    const ownerId = event.requestContext.authorizer.claims.sub;

    const response = await docClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME!,
        IndexName: "ownerId-index",
        KeyConditionExpression: "ownerId = :ownerId",
        ExpressionAttributeValues: { ":ownerId": ownerId },
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.Items ?? []),
    };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to fetch vendors" }),
    };
  }
};
