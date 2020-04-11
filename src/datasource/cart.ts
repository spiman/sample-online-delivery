import { Document, Model, model, Schema, Types } from "mongoose";
import { NotFoundError, ValidationError } from "../domain/error";
import { CartItemRequest } from "../domain/cart";
import { getMenuItem } from "./menu";

const cartItemSchema = new Schema({
    itemId: { type: Schema.Types.ObjectId , ref: 'MenuItem', required: true },
    quantity: { type: Number, min: 1, required: true },
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

export async function updateItemInCart(cartId: string, cartItemId: string, request: CartItemRequest): Promise<CartDocument> {
    //ensure requested menu item exists -- could make sense to add a layer for referential integrity on top of mongoose
    if (!!request.itemId) {
        await getMenuItem(request.itemId).catch(e =>  { throw new ValidationError("menu item does not exist") });
    }

    const patch = Object.keys(request).reduce((acc, el) => {
        acc['items.$.' + el] = request[el];
        return acc;
    }, {});

    return MongoCart.findOneAndUpdate(
        { _id: cartId, 'items._id': cartItemId },
        { $set: patch },
        { new: true }
    ).orFail(new NotFoundError("item does not exist"));
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