import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);
    const { vendorId } = body;

    if (!vendorId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "vendorId is required" }),
      };
    }

    const ownerId = event.requestContext.authorizer.claims.sub;

    try {
      await docClient.send(
        new DeleteCommand({
          TableName: process.env.TABLE_NAME!,
          Key: { vendorId },
          // Only delete if the vendor belongs to the caller
          ConditionExpression: "ownerId = :ownerId",
          ExpressionAttributeValues: { ":ownerId": ownerId },
        })
      );
    } catch (error: any) {
      if (error.name === "ConditionalCheckFailedException") {
        return {
          statusCode: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "Vendor not found" }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
      },
      body: JSON.stringify({ message: "Vendor deleted" }),
    };
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to delete vendor" }),
    };
  }
};