import { Router } from 'express';
import { getMenu, MenuItemDocument } from "../datasource/menu";
import { MenuItemResponse, MenuResponse } from "../domain/menu";
import { Currency } from "../domain/currency";
import { getExchangeRate } from "../datasource/rate";

const router = Router();
router.get('/', async (req, res, next) => {
  try {
    const currency = Currency.parse(req.query.currency?.toString() || 'EUR')
    const [menu, exchangeRate] = await Promise.all([getMenu(), getExchangeRate(currency)]);
    const response = menu.reduce((acc: MenuResponse, el: MenuItemDocument) => {
      acc[el.category].push(new MenuItemResponse(el, exchangeRate))
      return acc;
    }, MenuResponse());
    res.status(200).json(response);
  } catch (e) {
    next(e);
  }
});

export default router;
