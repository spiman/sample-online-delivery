import { CartItemResponse } from "./cart";
import { Currency } from "./currency";
import { OrderDocument } from "../datasource/order";

export class OrderRequest {
    cartId: string;
    address: string;
    currency: Currency;
    comment: string;
}

export class OrderResponse {
    id: string;
    address: string;
    comment: string;
    totalPrice: number;
    items: Array<CartItemResponse>;

    constructor(doc: OrderDocument, exchangeRate: number = 1) {
        this.id = doc._id;
        this.address = doc.address;
        this.comment = doc.comment;
        this.items = doc.items.map(el => new CartItemResponse(el));
        this.totalPrice = Number((doc.totalPriceEurCents * (exchangeRate * 100) / 10000).toFixed(2));
    }
}
