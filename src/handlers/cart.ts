import { Router } from 'express';
import { createCart, getCart } from "../datasource/cart";
import { CartPayload } from "../domain/cart";

const router = Router();

router.post('/', async (req, res) => {
   const cart = await createCart();
   res.status(201)
       .header('Location', `${req.originalUrl}/${cart._id}`)
       .send();
});

router.get('/:id', async (req, res) => {
   try {
      const cart = await getCart(req.params.id);
      const response = new CartPayload(cart);
      res.status(200).json(response);
   } catch (e) {
      res.status(404).send()
   }
});

export default router;