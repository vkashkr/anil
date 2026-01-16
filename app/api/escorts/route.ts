export const dynamic = "force-static";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

export async function GET() {
  try {
    const command = new ScanCommand({ TableName: "gif-gif" });
    const { Items } = await client.send(command);
    return NextResponse.json(Items);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
