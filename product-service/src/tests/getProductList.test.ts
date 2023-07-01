import { handler } from '../handlers/getProductList';
import { buildResponce } from '../utils';
import { getProductsList } from '../db/db.services';

// Mock the buildResponce and getProductsList functions
jest.mock('../utils', () => ({
  buildResponce: jest.fn(),
}));

jest.mock('../db/db.services', () => ({
  getProductsList: jest.fn(),
}));

describe('handler', () => {
  afterEach(() => {
    // Clear the mocks after each test
    (buildResponce as jest.Mock).mockClear();
    (getProductsList as jest.Mock).mockClear();
  });

  it('should return a 200 response with the products data', async () => {
    const mockEvent = {};
    const mockProducts = [
      { id: 1, name: 'Product 1', count: 2 },
      { id: 2, name: 'Product 2', count: 3 },
    ];

    (getProductsList as jest.Mock).mockResolvedValue(mockProducts);

    await handler(mockEvent);

    expect(getProductsList).toHaveBeenCalled();
    expect(buildResponce).toHaveBeenCalledWith(200, mockProducts);
  });

  it('should return a 500 response when an error occurs', async () => {
    const mockEvent = {};

    const errorMessage = 'An error occurred';
    (getProductsList as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await handler(mockEvent);

    expect(getProductsList).toHaveBeenCalled();
    expect(buildResponce).toHaveBeenCalledWith(500, {
      message: errorMessage,
    });
  });
});