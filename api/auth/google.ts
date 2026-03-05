import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { OAuth2Client } from 'google-auth-library';
import { loginWithGooglePayload } from '../lib/auth';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (event.requestContext.http.method !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    };
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const { token } = body;

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Token is required' }),
    };
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Google login is not configured' }),
    };
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: token, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Google token missing email' }),
      };
    }

    const name = payload.name || payload.email.split('@')[0];
    const result = await loginWithGooglePayload(payload.email, name, payload.picture);
    
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Google auth error:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid Google token' }),
    };
  }
};
