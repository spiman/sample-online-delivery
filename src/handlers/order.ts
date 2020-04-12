import { Router } from 'express';
import { check, validationResult } from "express-validator";
import { ValidationError } from "../domain/error";
import { Currency } from "../domain/currency";
import { OrderRequest, OrderResponse } from "../domain/order";
import { listOrders, submitOrder } from "../datasource/order";
import { getExchangeRate } from "../datasource/rate";

const router = Router();

router.post(
    '/',
    [
        check('cartId').isMongoId(),
        check('address').isString().isLength({ min: 8 }),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new ValidationError('invalid request body', errors.array()));
            }

            const currency = Currency.parse(req.body.currency?.toString() || 'EUR');
            const rate = await getExchangeRate(currency)

            const order = await submitOrder(req.body as OrderRequest);
            res.status(200).json(new OrderResponse(order, rate))
        } catch (e) {
            return next(e);
        }
    }
);

router.get('/', async (req, res, next) => {
    try {
        const orders = await listOrders();

        const currency = Currency.parse(req.query.currency?.toString() || 'EUR');
        const rate = await getExchangeRate(currency)

        res.status(200).json(orders.map(el => new OrderResponse(el, rate)));
    } catch (e) {
        next(e);
    }
});

export default router;