import * as express from 'express';
import * as mongoose from "mongoose";
import config from './config';
import errorHandler from './handlers/error';
import menuRouter from './handlers/menu';
import cartRouter from './handlers/cart';
import cartItemRouter from './handlers/cart_item';
import orderRouter from './handlers/order';

//TODO remove cache from exchange-rate (overkill), use a simple map
//TODO unit test the rates helper
//TODO exchange-rate-worker
//TODO return embedded item in cart response

const app = express();

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(config.get('mongo:uri'), config.get('mongo:options')).then(() => {
  app.use('/menu', menuRouter);
  app.use('/carts', cartRouter);
  app.use('/carts/:cartId/items', cartItemRouter);
  app.use('/orders', orderRouter);
  app.use(errorHandler);
  app.listen(3000, () => {
    console.log('started')
  });
});

export default app;
