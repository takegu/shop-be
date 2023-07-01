import { handler } from '../handlers/getProductById';
import { buildResponce } from '../utils';
import { getProductById } from '../db/db.services';

jest.mock('../utils', () => ({
  buildResponce: jest.fn(),
}));

jest.mock('../db/db.services', () => ({
  getProductById: jest.fn(),
}));

describe('Product Handler', () => {
  afterEach(() => {
    (buildResponce as jest.Mock).mockClear();
    (getProductById as jest.Mock).mockClear();
  });

  test('returns a product when a valid productId is provided', async () => {
    const productId = '1';
    const event = { pathParameters: { productId } };
    const mockProduct = { id: 1, name: 'Product 1', count: 2 };

    (getProductById as jest.Mock).mockResolvedValue(mockProduct);
    (buildResponce as jest.Mock).mockReturnValue({
      statusCode: 200,
      body: JSON.stringify(mockProduct),
    });

    await handler(event);

    expect(getProductById).toHaveBeenCalledWith(productId);
    expect(buildResponce).toHaveBeenCalledWith(200, mockProduct);
  });

  test('returns a 404 error when an invalid productId is provided', async () => {
    const productId = 'invalid-id';
    const event = { pathParameters: { productId } };

    (getProductById as jest.Mock).mockResolvedValue(null);
    (buildResponce as jest.Mock).mockReturnValue({
      statusCode: 404,
      body: JSON.stringify({ message: 'Product not found' }),
    });

    await handler(event);

    expect(getProductById).toHaveBeenCalledWith(productId);
    expect(buildResponce).toHaveBeenCalledWith(404, { message: 'Product not found' });
  });

  test('returns a 500 error when an exception occurs', async () => {
    const event = { pathParameters: null };

    const errorMessage = "Cannot destructure property 'productId' of 'event.pathParameters' as it is null.";
    (getProductById as jest.Mock).mockRejectedValue(new Error(errorMessage));
    (buildResponce as jest.Mock).mockReturnValue({
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    });

    await handler(event);

    expect(buildResponce).toHaveBeenCalledWith(500, { message: errorMessage });
  });
});