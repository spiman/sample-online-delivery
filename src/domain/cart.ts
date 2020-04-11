import { CartDocument, CartItemDocument } from "../datasource/cart";

export class CartPayload {
    id: string;
    items: Array<CartItemResponse>;

    constructor(doc: CartDocument) {
        this.id = doc._id
        this.items = doc.items.map(el => new CartItemResponse(el))
    }
}

export class CartItemRequest {
    itemId: string;
    quantity: number;
    comment: string;

    constructor(doc: CartItemDocument) {
        this.itemId = doc.itemId
        this.quantity = doc.quantity;
        this.comment = doc.comment;
    }
}

export class CartItemResponse extends CartItemRequest {
    id: string;

    constructor(doc: CartItemDocument) {
        super(doc);
        this.id = doc._id;
    }
}