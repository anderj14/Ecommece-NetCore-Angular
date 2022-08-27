import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  Basket,
  IBasket,
  IBasketItem,
  IBasketTotals,
} from '../shared/models/basket';
import { IDeliveryMethod } from '../shared/models/deliveryMethod';
import { IProduct } from '../shared/models/product';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSource = new BehaviorSubject<IBasket>(null);
  basket$ = this.basketSource.asObservable();
  private basketTotalSource = new BehaviorSubject<IBasketTotals>(null);
  basketTotal$ = this.basketTotalSource.asObservable();
  shipping = 0;

  constructor(private http: HttpClient) {}

  setShippingPrice(deliveryMethod: IDeliveryMethod){
    this.shipping = deliveryMethod.price;
    this.calculateTotals();
  }

  //get the basket
  getBasket(id: string) {
    return this.http.get(this.baseUrl + 'shoppingcart?id=' + id).pipe(
      map((basket: IBasket) => {
        this.basketSource.next(basket);
        this.calculateTotals();
      })
    );
  }

  //change the basket
  setBasket(basket: IBasket) {
    return this.http.post(this.baseUrl + 'shoppingcart', basket).subscribe(
      (response: IBasket) => {
        this.basketSource.next(response);
        this.calculateTotals();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  //get the basket value
  getCurrentBasketValue() {
    return this.basketSource.value;
  }

  //add basket
  addItemToShoppingCart(item: IProduct, amount = 1) {
    const itemToAdd: IBasketItem = this.mapProductItemToBasketItem(
      item,
      amount
    );
    const basket = this.getCurrentBasketValue() ?? this.crateBasket();
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, amount);
    this.setBasket(basket);
  }

  //increment the items
  incrementItemQuantity(item: IBasketItem){
    const basket = this.getCurrentBasketValue();
    const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
    basket.items[foundItemIndex].amount++;
    this.setBasket(basket);
  }

  //Decrement the item from the basket
  decrementItemQuantity(item: IBasketItem){
    const basket = this.getCurrentBasketValue();
    const foundItemIndex = basket.items.findIndex(x => x.id === item.id);
    if(basket.items[foundItemIndex].amount > 1){
      basket.items[foundItemIndex].amount--;
      this.setBasket(basket);
    }else{
      this.removeItemFromBasket(item);
    }
  }

  //remove the item from the basket
  removeItemFromBasket(item: IBasketItem) {
    const basket = this.getCurrentBasketValue();
    if(basket.items.some(x => x.id === item.id)){
      basket.items = basket.items.filter(i => i.id !== item.id);
      if(basket.items.length > 0){
        this.setBasket(basket);
      }else{
        this.deleteBasket(basket);
      }
    }
  }

  deleteLocalBasket(id: string){
    this.basketSource.next(null);
    this.basketTotalSource.next(null);
    localStorage.removeItem('basket_id');
  }

  //Delete basket
  deleteBasket(basket: IBasket) {
    return this.http.delete(this.baseUrl + 'shoppingcart?id=' + basket.id).subscribe(() => {
      this.basketSource.next(null);
      this.basketTotalSource.next(null);
      localStorage.removeItem('basket_id');
    }, error => {
      console.log(error);
    })
  }


  //calculate the total
  private calculateTotals() {
    const basket = this.getCurrentBasketValue();
    const shipping = this.shipping;
    const subtotal = basket.items.reduce((a, b) => b.price * b.amount + a, 0);
    const total = subtotal + shipping;
    this.basketTotalSource.next({ shipping, total, subtotal });
  }

  //add and update the item in basket
  private addOrUpdateItem(
    items: IBasketItem[],
    itemToAdd: IBasketItem,
    amount: number
  ): IBasketItem[] {
    console.log(items);

    const index = items.findIndex((i) => i.id === itemToAdd.id);
    if (index === -1) {
      itemToAdd.amount = amount;
      items.push(itemToAdd);
    } else {
      items[index].amount += amount;
    }
    return items;
  }

  //create new basket and save in the localStorage
  private crateBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }

  //mapping the item in the basket
  private mapProductItemToBasketItem(
    item: IProduct,
    amount: number
  ): IBasketItem {
    return {
      id: item.id,
      product: item.name,
      price: item.price,
      image: item.image,
      amount,
      brand: item.brand,
      category: item.category,
    };
  }
}
