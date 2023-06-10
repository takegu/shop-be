import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import { ScanCommandOutput, AttributeValue } from '@aws-sdk/client-dynamodb';


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

export const removeAttributeValueFromItems = (result: ScanCommandOutput) => {
  return result.Items?.map((item) => {
    const transformedItem: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(item)) {
      transformedItem[key] = (value as AttributeValue).S || (value as AttributeValue).N || (value as AttributeValue).BOOL || (value as AttributeValue).NULL || (value as AttributeValue).SS || (value as AttributeValue).NS || (value as AttributeValue).L || (value as AttributeValue).M;
    }
    return transformedItem;
  })
}
