import { Document, Error, Model, model, Schema, Types } from "mongoose";
import { NotFoundError, ValidationError } from "../domain/error";
import { CartItemPayload } from "../domain/cart";
import { getMenuItem, MongoMenuItem } from "./menu";

const cartItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId , ref: 'MenuItem' },
    quantity: { type: Number, min: 1 },
    comment: String
});

export type CartItemDocument = {
    itemId: string,
    quantity: number,
    comment?: string
};

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

export async function addItemToCart(cartId: string, item: CartItemPayload): Promise<CartDocument> {
    const [cart, _] = await Promise.all([getCart(cartId), getMenuItem(item.itemId)]);
    cart.items.push(item);
    return cart.save();
}
