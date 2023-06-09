import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';

export const buildResponce = (statusCode: any, body: any) => ({
  statusCode: statusCode,
  headers: {
    'Access-Controt-ALLow-Credentiats': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  },
  body: JSON.stringify(body),
});

export const checkBodyParameters = (requiredParameters: any[], data: any) => {
  return requiredParameters.every((parameter: any) => {
    const parameterValue = get(data, parameter);

    if (isUndefined(parameterValue)) {
      return false;
    }

    return true;
  });
};
