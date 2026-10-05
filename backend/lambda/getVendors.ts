import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async () => {
  try {
    const response = await docClient.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME!,
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