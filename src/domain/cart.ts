import { CartDocument, CartItemDocument } from "../datasource/cart";

export class CartResponse {
    id: string;
    items: Array<CartItemResponse>;

    constructor(doc: CartDocument) {
        this.id = doc._id
        this.items = doc.items.map(el => new CartItemResponse(el))
    }
}

export class CartItemRequest {
    itemId?: string;
    quantity?: number;
    comment?: string;

    constructor({ itemId, quantity, comment }) {
        this.itemId = itemId;
        this.quantity = quantity;
        this.comment = comment;
    }
}

export class CartItemResponse extends CartItemRequest {
    id: string;

    constructor(doc: CartItemDocument) {
        super(doc as any);
        this.id = doc._id;
    }
}