import { Document, model, Model, Schema, Types } from "mongoose";
import { MenuItemCategory } from "../domain/menu";
import { NotFoundError } from "../domain/error";

const menuItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price_eur_cents: { type: Number, min: 1, required: true },
    category: { type: String, enum: Object.values(MenuItemCategory), required: true }
})

export type MenuItemDocument = Document & {
    name: string;
    description?: string;
    price_eur_cents: number;
    category: MenuItemCategory;
}

export const MongoMenuItem: Model<MenuItemDocument, {}> = model<MenuItemDocument>('MenuItem', menuItemSchema)

export async function getMenu(): Promise<Array<MenuItemDocument>> {
    return MongoMenuItem.find().lean();
}

export async function getMenuItem(id: string): Promise<MenuItemDocument> {
    return MongoMenuItem.findById(id).orFail(new NotFoundError("could not find item"));
}
