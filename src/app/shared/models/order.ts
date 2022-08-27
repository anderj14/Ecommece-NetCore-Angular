import { IAddress } from "./address";

export interface IOrderToCreate {
  shoppingCartId: string;
  shippingType: number;
  shippingAddress: IAddress;
}

export interface IOrder {
  id: number;
  buyerEmail: string;
  purchaseOrder: string;
  shippingAddress: IAddress;
  shippingType: string;
  shippingTypePrice: number;
  orderItems: IOrderItem[];
  subtotal: number;
  total: number;
  status: string;
}

export interface IOrderItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  amount: number;
}
