import { Router } from 'express';
import { createCart, getCart } from "../datasource/cart";
import { CartResponse } from "../domain/cart";

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
      const response = new CartResponse(cart);
      res.status(200).json(response);
   } catch (e) {
       return next(e);
   }
});

export default router;