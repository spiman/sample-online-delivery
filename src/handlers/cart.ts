import { Router } from 'express';
import { addItemToCart, createCart, getCart } from "../datasource/cart";
import { CartItemPayload, CartPayload } from "../domain/cart";
import { check, validationResult } from "express-validator";
import { ValidationError, ValidationViolation } from "../domain/error";
import { getMenuItem, MongoMenuItem } from "../datasource/menu";

const router = Router();

router.post('/', async (req, res) => {
   const cart = await createCart();
   res.status(201)
       .header('Location', `${req.originalUrl}/${cart._id}`)
       .send();
});

router.get('/:id', async (req, res, next) => {
   try {
      const cart = await getCart(req.params.id);
      const response = new CartPayload(cart);
      res.status(200).json(response);
   } catch (e) {
       return next(e);
   }
});

router.post(
    '/:id/items',
    [
        check('quantity').isInt({ gt: 0 }),
        check('itemId').isMongoId()
    ],
    async (req, res, next) => {
        try {
            const { _id: cartId } = await getCart(req.params.id); //handle 404 first

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(new ValidationError('invalid request body', errors.array()));
            }

            const cartItem = req.body as CartItemPayload;

            const cart = await addItemToCart(cartId, cartItem);
            res.status(200).send(new CartPayload(cart));
        } catch (e) {
            return next(e);
        }
    }
);

export default router;