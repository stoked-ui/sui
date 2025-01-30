import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SES } from "aws-sdk";
import { Resource } from "sst";
import { v4 as uuidv4 } from "uuid";
import { domains } from "./lib/domains";
import dbClient from "./lib/mongodb";

const ses = new SES({ region: "us-east-1" });

function subscribeResult(result: APIGatewayProxyResult): APIGatewayProxyResult {
  console.info('result', result);
  return result;
}

export async function subscribe(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

  if (!domains.includes(event.headers.origin.replace('https://', ''))) {
    console.info('event.headers.origin', event, domains, event.headers.origin.replace('https://',''));
    return subscribeResult({
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden" }),
    });
  }

  if (event.requestContext.http.method !== "POST") {
    return subscribeResult({
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    });
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return subscribeResult({
      statusCode: 400,
      body: JSON.stringify({ message: "Email is required" }),
    });
  }

  try {
    const db = (await dbClient).db();
    const collection = db.collection("subscribers");
    const existing = await collection.findOne({ email });


    const verificationBaseUrl = `https://${event.headers.host}/verify`; 
    const verificationToken = uuidv4();
    const verificationLink = `${verificationBaseUrl}?token=${verificationToken}`;

    
    if (existing) {
      if (!existing.verified) {
        collection.updateOne({ email }, { $set: { verificationToken } });
        // If user exists, resend verification email
        await sendVerificationEmail(email, verificationLink);
        return subscribeResult({
          statusCode: 201,
          body: JSON.stringify({ message: "Email already subscribed but not verified. New verification email sent." }),
        });
      }
      return subscribeResult({
        statusCode: 200,
        body: JSON.stringify({ message: "Email already subscribed and verified" }),
      });
    }

    await collection.insertOne({ email, subscribedAt: new Date(), verificationToken });
    await sendVerificationEmail(email, verificationLink);
    return subscribeResult({
      statusCode: 201,
      body: JSON.stringify({ message: "Subscription successful. Verification email sent." }),
    });
  } catch (error) {
    console.error(error);
    return subscribeResult({
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    });
  }
}


async function sendVerificationEmail(email: string, verificationLink: string) {
  await ses
    .sendEmail({
      Source: "no-reply@stoked-ui.com", // Change this to your verified domain
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Verify Your Email" },
        Body: {
          Text: { Data: `Click the link to verify your email: ${verificationLink}` },
          Html: { Data: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>` },
        },
      },
    })
    .promise();
}


export async function verify(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userPoolId = Resource.Auth.id;
  const { token, email } = event.queryStringParameters || {};

  if (!token || !email) {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid token or email" }) };
  }

  try {
    // Check if the user exists
      
    const db = (await dbClient).db();
    const collection = db.collection("subscribers");
    const existing = await collection.findOne({ email });


    if (!existing) {
      return { statusCode: 400, body: JSON.stringify({ message: "Email not subscribed." }) };
    }

    if (existing && existing.verified) {
      return { statusCode: 200, body: JSON.stringify({ message: "User already verified." }) };
    }

    if (existing.verificationToken !== token) {
      const verificationBaseUrl = `https://${event.headers.host}/verify`; 
      const verificationToken = uuidv4();
      const verificationLink = `${verificationBaseUrl}?token=${verificationToken}`;
      await sendVerificationEmail(email, verificationLink);

      return { statusCode: 400, body: JSON.stringify({ message: "Invalid token. New verification email sent." }) };
    }

    collection.updateOne({ email }, { $set: { verified: true } });

    return { statusCode: 200, body: JSON.stringify({ message: "Email verified successfully" }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
}
