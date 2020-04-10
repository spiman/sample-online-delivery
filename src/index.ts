import * as express from 'express';
import * as mongoose from "mongoose";
import * as config from 'nconf';
import menuRouter from './handlers/menu';
import cartRouter from './handlers/cart';

config.env().file('./src/config.json');

const app = express();

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(config.get('mongo:uri'), { useNewUrlParser: true }).then(() => {
  app.use('/menu', menuRouter)
  app.use('/carts', cartRouter)
  app.listen(3000, () => {
    console.log('started')
  });
})

export default app;
