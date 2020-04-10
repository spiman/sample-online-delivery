import { Document, Error, Model, model, Schema, Types } from "mongoose";

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
        return MongoCart.findById(id);
    }
    throw new Error("invalid id supplied"); //should specialize
}

