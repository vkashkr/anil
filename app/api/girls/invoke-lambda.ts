import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: "us-east-1" });

async function invokeAliyaLambda() {
  const command = new InvokeCommand({
    FunctionName: "aliya-lambda",
    Payload: Buffer.from(JSON.stringify({})) // empty/default event
  });
  try {
    const response = await client.send(command);
    const payload = response.Payload ? Buffer.from(response.Payload).toString() : null;
    console.log("Lambda response:", payload);
    return payload;
  } catch (err) {
    console.error("Error invoking Lambda:", err);
    throw err;
  }
}
invokeAliyaLambda();
