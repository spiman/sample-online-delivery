import { CartDocument, CartItemDocument } from "../datasource/cart";

export class CartPayload {
    id: string;
    items: Array<CartItemPayload>;

    constructor(doc: CartDocument) {
        this.id = doc._id
        this.items = doc.items.map(el => new CartItemPayload(el))
    }
}

export class CartItemPayload {
    itemId: string;
    quantity: number;
    comment: string;

    constructor(doc: CartItemDocument) {
        this.itemId = doc.itemId
        this.quantity = doc.quantity;
        this.comment = doc.comment;
    }
}