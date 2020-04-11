import { CartItemResponse } from "./cart";

export class OrderResponse {
    id: string;
    cart: CartItemResponse
}
