import {v4 as uuidv4} from 'uuid';

export interface IBasket {
  id: string;
  items: IBasketItem[];
  clientSecret?: string;
  PaymentIntentId?: string;
  deliveryMethodId?: number;
  shippingPrice?: number;
}

export interface IBasketItem {
  id: number;
  product: string;
  price: number;
  amount: number;
  image: string;
  brand: string;
  category: string;
}

export class Basket implements IBasket{
  id = uuidv4();
  items: IBasketItem[] = [];

}

export interface IBasketTotals{
  shipping: number;
  subtotal: number;
  total: number;
}
