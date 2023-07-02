import { buildResponce } from "../utils";

export const handler = async (event: any) => {
  console.log(event);

  if (!event.headers || !event.headers.authorization) {
    return generatePolicy('Deny', event.methodArn);
  }

  const authorizationToken = event.headers.authorization;
  const encodedCredentials = authorizationToken.split(' ')[1];
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [username, password] = decodedCredentials.split(':');

  const expectedPassword = process.env[username];

  if (password === expectedPassword && typeof password !== 'undefined' && typeof expectedPassword !== 'undefined') {
    return generatePolicy('Allow', event.methodArn);
  } else {
    return generatePolicy('Deny', event.methodArn);
  }
};

const generatePolicy = (effect: 'Allow' | 'Deny', resource: string) => {
  const policy = {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
  return policy;
};
