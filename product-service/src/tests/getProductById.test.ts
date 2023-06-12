import { handler } from '../handlers/getProductById';
import { products } from '../mocks/data';

describe('Product Handler', () => {
  test('returns a product when a valid productId is provided', async () => {
    const productId = products[0].product_id;
    const event = { pathParameters: { productId } };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(JSON.stringify({ product: products[0] }));
  });

  test('returns a 404 error when an invalid productId is provided', async () => {
    const productId = 'invalid-id';
    const event = { pathParameters: { productId } };

    const response = await handler(event);

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual(JSON.stringify({ message: 'Product not found' }));
  });

  test('returns a 500 error when an exception occurs', async () => {
    const event = { pathParameters: null };
  
    const response = await handler(event);
  
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual(
      JSON.stringify({
        message: "Cannot destructure property 'productId' of 'event.pathParameters' as it is null.",
      })
    );
  });
});
