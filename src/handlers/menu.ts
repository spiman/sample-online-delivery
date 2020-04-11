import { Router } from 'express';
import { getMenu, MenuItemDocument } from "../datasource/menu";
import { MenuResponse, MenuItemResponse } from "../domain/menu";
import { Currency } from "../domain/currency";
import { getExchangeRate } from "../datasource/rate";
import { ValidationError } from "../domain/error";

const router = Router();
router.get('/', async (req, res, next) => {
  const currency = req.query.currency as Currency || Currency.EUR;
  if (!Object.values(Currency).includes(currency)) {
      return next(new ValidationError(`Unknown currency ${currency}`));
  }

  const [menu, exchangeRate] = await Promise.all([getMenu(), getExchangeRate(currency)]);
  const response = menu.reduce((acc: MenuResponse, el: MenuItemDocument) => {
    acc[el.category].push(new MenuItemResponse(el, exchangeRate))
    return acc;
  }, MenuResponse());
  res.status(200).json(response);
});

export default router;
