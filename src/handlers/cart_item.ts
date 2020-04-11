import { Router } from 'express';
import { addItemToCart, getCart, removeItemFromCart, updateItemInCart } from "../datasource/cart";
import { check, validationResult } from "express-validator";
import { ValidationError } from "../domain/error";
import { CartItemRequest, CartResponse } from "../domain/cart";

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

          const cartItem = req.body as CartItemRequest;

          const cart = await addItemToCart(res.locals.cartId, cartItem);
          res.status(200).send(new CartResponse(cart));
       } catch (e) {
          return next(e);
       }
    }
);

router.patch(
    '/:cartItemId',
    [
        check('cartItemId').isMongoId(),
        check('itemId').optional().isMongoId(),
        check('quantity').optional().isInt({ gt: 0 }),
    ],
    async (req, res, next) => {
   try {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
           return next(new ValidationError('invalid request body', errors.array()));
       }

       const cartItem = req.body as CartItemRequest;
       const cart = await updateItemInCart(res.locals.cartId, req.params.cartItemId, cartItem);
       res.status(200).send(new CartResponse(cart));
   } catch (e) {
       return next(e);
   }
});

router.delete('/:itemId', async (req, res, next) => {
    try {
        await removeItemFromCart(res.locals.cartId, req.params.itemId);
        res.status(204).send();
    } catch (e) {
        return next(e);
    }
});

export default router;
