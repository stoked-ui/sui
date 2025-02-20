import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-1" }); // ✅ Change to your AWS region

export async function handler(event: any) {
  try {
    if (!process.env.ROOT_DOMAIN) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "ROOT_DOMAIN environment variable is not set and is required" }),
      };
    }

    if (!process.env.ROOT_DOMAIN?.includes(event.headers.origin.replace('https://', ''))) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Forbidden" }),
      };
    }

    // ✅ Parse request body
    const body = JSON.parse(event.body || "{}");
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing phoneNumber or message" }),
      };
    }

    // ✅ Ensure the phone number is formatted correctly (E.164 format: +15551234567)
    if (!phoneNumber.match(/^\+\d{11,15}$/)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid phone number format. Use E.164 format (e.g., +15551234567)" }),
      };
    }

    // ✅ Prepare SNS publish command
    const params = new PublishCommand({
      Message: message,
      PhoneNumber: phoneNumber, // Directly send SMS to this number
    });

    // ✅ Send SMS
    await snsClient.send(params);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "SMS sent successfully" }),
    };
  } catch (error: any) {
    console.error("Error sending SMS:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Failed to send SMS" }),
    };
  }
}
