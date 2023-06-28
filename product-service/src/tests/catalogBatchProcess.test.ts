import { handler } from '../handlers/catalogBatchProcess';
import { handler as createProduct } from '../handlers/createProduct';
import { buildResponce } from '../utils';
import { SNSClient } from '@aws-sdk/client-sns';

jest.mock('../handlers/createProduct');
jest.mock('../utils');
jest.mock('@aws-sdk/client-sns');

const sns = new SNSClient({});
const sendSpy = jest.spyOn(sns, 'send');

describe('handler', () => {
  afterEach(() => {
    jest.resetAllMocks();
    sendSpy.mockReset();
  });

  it('should process records and send SNS event for successful products', async () => {
    const event = {
      Records: [
        { id: 1, name: 'Product 1', description: "ad", price: 2, count: 2 },
        { id: 2, name: 'Product 2', description: "ad", price: 2,count: 3 },
      ],
    };

    (createProduct as jest.Mock).mockResolvedValue({
      statusCode: 200,
      body: JSON.stringify({ message: { id: 1, name: 'Product 1', description: "ad", price: 2, count: 2 } }),
    });

    (buildResponce as jest.Mock).mockReturnValue({
      statusCode: 200,
      body: JSON.stringify(event.Records),
    });

    sendSpy.mockResolvedValue({} as never);

    const response = await handler(event);

    expect(createProduct).toHaveBeenCalledTimes(2);
    expect(sendSpy).toHaveBeenCalledTimes(2);
    expect(response).toEqual(buildResponce(200, event.Records));
  });

  it('should handle error and return 500 status code', async () => {
    const event = {
      Records: [{ id: 1, name: 'Product 1', description: "ad", price: 2, count: 2 }],
    };

    (createProduct as jest.Mock).mockRejectedValue(new Error('Error creating product'));

    (buildResponce as jest.Mock).mockReturnValue({
      statusCode: 500,
      body: JSON.stringify(`Error creating product: Error creating product`),
    });

    const response = await handler(event);

    expect(createProduct).toHaveBeenCalledTimes(1);
    expect(response).toEqual(buildResponce(500, 'Error creating product: Error creating product'));
  });
});
