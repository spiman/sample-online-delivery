import { Router } from 'express';
import { addItemToCart, getCart, removeItemFromCart } from "../datasource/cart";
import { check, validationResult } from "express-validator";
import { ValidationError } from "../domain/error";
import { CartItemResponse, CartPayload } from "../domain/cart";

const router = Router({ mergeParams: true });

router.use(async (req, res, next) => {
   try {
      const { _id: cartId } = await getCart(req.params.cartId);
      res.locals.cartId = cartId;
      next();
   } catch (e) {
      next(e);
   }
});

router.post(
    '/',
    [
       check('quantity').isInt({ gt: 0 }),
       check('itemId').isMongoId()
    ],
    async (req, res, next) => {
       try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
             return next(new ValidationError('invalid request body', errors.array()));
          }

          const cartItem = req.body as CartItemResponse;

          const cart = await addItemToCart(res.locals.cartId, cartItem);
          res.status(200).send(new CartPayload(cart));
       } catch (e) {
          return next(e);
       }
    }
);

router.delete('/:itemId', async (req, res, next) => {
    try {
        const cart = await removeItemFromCart(res.locals.cartId, req.params.itemId);
        res.status(204).send();
    } catch (e) {
        return next(e);
    }
});

export default router;
