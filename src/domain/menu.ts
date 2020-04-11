/*
 NOTE : in a real world scenario the categories would be a separate configurable
 entity in the database - omitting now for brevity
*/

import { MenuItemDocument } from "../datasource/menu";

export interface MenuResponse {
    appetizers: Array<MenuItemResponse>;
    salads: Array<MenuItemResponse>;
    mains: Array<MenuItemResponse>;
    drinks: Array<MenuItemResponse>;
}

export const MenuResponse: () => MenuResponse = () => ({
    appetizers: [],
    salads: [],
    mains: [],
    drinks: []
} as MenuResponse)

export class MenuItemResponse {
    id: string;
    name: string;
    description: string;
    price: number;

    constructor(doc: MenuItemDocument, exchangeRate: number = 1) {
        this.id = doc._id;
        this.name = doc.name;
        this.description = doc.description;
        this.price = doc.priceEurCents * exchangeRate;
    }
}

export enum MenuItemCategory {
    Appetizer = "appetizers",
    Salad = "salads",
    Main = "mains",
    Drink = "drinks"
}
