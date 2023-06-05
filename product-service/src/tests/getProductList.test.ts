import { handler } from '../handlers/getProductList';
import { buildResponce } from '../utils';
import { products } from '../mocks/data';

// Mock the buildResponce function
jest.mock('../utils', () => ({
  buildResponce: jest.fn(),
}));

describe('handler', () => {
  afterEach(() => {
    // Clear the mock after each test
    (buildResponce as jest.Mock).mockClear();
  });

  it('should return a 200 response with the products data', async () => {
    const mockEvent = {};

    await handler(mockEvent);

    expect(buildResponce).toHaveBeenCalledWith(200, {
      products: products,
    });
  });

  it('should return a 500 response when an error occurs', async () => {
    const mockEvent = {};

    const errorMessage = 'An error occurred';
    (buildResponce as jest.Mock).mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });

    const response = await handler(mockEvent);

    expect(buildResponce).toHaveBeenCalledWith(500, {
      message: errorMessage,
    });
  });
});