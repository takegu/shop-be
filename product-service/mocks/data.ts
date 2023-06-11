export type Product = {
  description: string,
  product_id: string,
  price: number,
  title: string,
};

export type Stock = {
  product_id: string,
  count: number,
};

export const products: Product[] = [
  {
    product_id: "7589ec3b-a12d-45c6-8346-fd73c49b90bb",
    description: "Soft and comfortable t-shirt made from 100% organic cotton.",
    title: "Organic Cotton T-Shirt",
    price: 29.99,
  },
  {
    product_id: "8543ec7d-d15f-42c8-9254-fa63c44c70cc",
    description: "Durable and lightweight backpack with multiple compartments for easy organization.",
    title: "Versatile Backpack",
    price: 49.99,
  },
  {
    product_id: "9512ec8f-e16a-46c9-8163-fb72c45d60dd",
    description: "Stylish and elegant wristwatch with a stainless steel strap and water resistance.",
    title: "Classic Stainless Steel Watch",
    price: 89.99,
  },
  {
    product_id: "6524ec2a-b10f-48c7-9343-fc39c48a80ee",
    description: "Delicious and aromatic ground coffee with a rich flavor profile.",
    title: "Premium Ground Coffee",
    price: 12.99,
  },
  {
    product_id: "4567ec4b-b11d-48c5-9346-fc73c48a80ff",
    description: "Compact and portable Bluetooth speaker with high-quality sound output.",
    title: "Wireless Bluetooth Speaker",
    price: 39.99,
  }
];

export const stock: Stock[] = [
  {
    product_id: "7589ec3b-a12d-45c6-8346-fd73c49b90bb",
    count: 29.99,
  },
  {
    product_id: "8543ec7d-d15f-42c8-9254-fa63c44c70cc",
    count: 49.99,
  },
  {
    product_id: "9512ec8f-e16a-46c9-8163-fb72c45d60dd",
    count: 89.99,
  },
  {
    product_id: "6524ec2a-b10f-48c7-9343-fc39c48a80ee",
    count: 12.99,
  },
  {
    product_id: "4567ec4b-b11d-48c5-9346-fc73c48a80ff",
    count: 39.99,
  }
];
