import { Document, Error, Model, model, Schema, Types } from "mongoose";
import { NotFoundError, ValidationError } from "../domain/error";
import { CartItemRequest, CartItemResponse } from "../domain/cart";
import { getMenuItem, MongoMenuItem } from "./menu";

const cartItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId , ref: 'MenuItem' },
    quantity: { type: Number, min: 1 },
    comment: String
});

export type CartItemDocument = Document & {
    itemId: string,
    quantity: number,
    comment?: string
};

const MongoCartItem: Model<CartItemDocument, {}> = model<CartItemDocument>('CartItem', cartItemSchema);

const cartSchema = new Schema({
    items: [cartItemSchema]
});

export type CartDocument = Document & {
    items: Array<CartItemDocument>
};

export const MongoCart: Model<CartDocument, {}> = model<CartDocument>('Cart', cartSchema);

export async function createCart(): Promise<CartDocument> {
    return new MongoCart().save()
}

export async function getCart(id: string): Promise<CartDocument> {
    if (Types.ObjectId.isValid(id)) {
        return MongoCart.findById(id).orFail(new NotFoundError("cart does not exist"));
    }
    throw new NotFoundError("invalid id supplied");
}

export async function addItemToCart(cartId: string, item: CartItemRequest): Promise<CartDocument> {
    const [cart, _] = await Promise.all([getCart(cartId), getMenuItem(item.itemId)]);
    cart.items.push(new MongoCartItem(item));
    return cart.save();
}

export async function removeItemFromCart(cartId: string, itemId: string) {
    const cart = await getCart(cartId);
    const item = await cart.items.find(el => el._id == itemId)
    if (!item) {
        throw new NotFoundError("cart item does not exist");
    }
    item.remove();
    return cart.save();
}