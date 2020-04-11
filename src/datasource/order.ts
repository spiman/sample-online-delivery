import { Document, model, Model, Schema } from "mongoose";
import { CartItemDocument, cartItemSchema, getCart } from "./cart";
import { OrderRequest } from "../domain/order";
import { ValidationError } from "../domain/error";
import { MongoMenuItem } from "./menu";

export const orderSchema = new Schema({
    cartId: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    address: { type: String, required: true },
    totalPriceEurCents: { type: Number, required: true, min: 0 },
    comment: String,
    items: [cartItemSchema]
}, { timestamps: true });

export type OrderDocument = Document & {
    cartId: string;
    address: string;
    comment: string;
    totalPriceEurCents: number;
    items: Array<CartItemDocument>
    createdAt: string;
    updatedAt: string;
}

export const MongoOrder: Model<OrderDocument, {}> = model<OrderDocument>('Order', orderSchema);

export async function listOrders(): Promise<Array<OrderDocument>> {
    return MongoOrder.find();
}

export async function submitOrder(req: OrderRequest): Promise<OrderDocument> {
   const cart = await getCart(req.cartId);
   if (cart.submitted) {
       throw new ValidationError("Cart already submitted");
   }

   const menuItems = await MongoMenuItem.find({
       _id: cart.items.map(item => item.itemId)
   });

   const order = await new MongoOrder({
       ...req,
       items: cart.items,
       totalPriceEurCents: menuItems.reduce((acc, el) => acc + el.priceEurCents, 0)
   }).save();

   cart.submitted = true;
   await cart.save();

   return order;
}