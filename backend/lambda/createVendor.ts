import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: any) => {
  try {
    const body = JSON.parse(event.body);

    const item = {
      vendorId: randomUUID(), // Generates a collision-safe unique ID
      name: body.name,
      category: body.category,
      contactEmail: body.contactEmail,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME!,
        Item: item,
      })
    );

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
      },
      body: JSON.stringify({ message: "Vendor created", vendorId: item.vendorId }),
    };
  } catch (error) {
    console.error("Error creating vendor:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to create vendor" }),
    };
  }
};