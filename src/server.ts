import * as express from 'express';
import errorHandler from './handlers/error';
import menuRouter from './handlers/menu';
import cartRouter from './handlers/cart';
import cartItemRouter from './handlers/cart_item';
import orderRouter from './handlers/order';

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/menu', menuRouter);
app.use('/carts', cartRouter);
app.use('/carts/:cartId/items', cartItemRouter);
app.use('/orders', orderRouter);
app.use(errorHandler);

export default app;
