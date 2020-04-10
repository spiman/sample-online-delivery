/*
 NOTE : in a real world scenario the categories would be a separate configurable
 entity in the database - omitting now for brevity
*/

import { MenuItemDocument } from "../datasource/menu";

export interface MenuPayload {
    appetizers: Array<MenuItemPayload>;
    salads: Array<MenuItemPayload>;
    mains: Array<MenuItemPayload>;
    drinks: Array<MenuItemPayload>;
}

export const MenuPayload: () => MenuPayload = () => ({
    appetizers: [],
    salads: [],
    mains: [],
    drinks: []
} as MenuPayload)

export class MenuItemPayload {
    id: string;
    name: string;
    description: string;
    price: number;

    constructor(doc: MenuItemDocument, exchangeRate: number = 1) {
        this.id = doc._id;
        this.name = doc.name;
        this.description = doc.description;
        this.price = doc.price_eur_cents * exchangeRate;
    }
}

export enum MenuItemCategory {
    Appetizer = "appetizers",
    Salad = "salads",
    Main = "mains",
    Drink = "drinks"
}
