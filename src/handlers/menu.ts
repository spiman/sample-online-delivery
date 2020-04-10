import { Router } from 'express';
import { getMenu, MenuItemDocument } from "../datasource/menu";
import { MenuPayload, MenuItemPayload } from "../domain/menu";
import { Currency } from "../domain/currency";
import { getExchangeRate } from "../datasource/rate";

const router = Router();
router.get('/', async (req, res) => {
  let currency: Currency;
  try {
    currency = req.query.currency as Currency || Currency.EUR;
  } catch (e) {
    res.status(400).json({ message: `Unknown currency ${req.params.currency}`});
    return;
  }

  const [menu, exchangeRate] = await Promise.all([getMenu(), getExchangeRate(currency)]);
  const response = menu.reduce((acc: MenuPayload, el: MenuItemDocument) => {
    acc[el.category].push(new MenuItemPayload(el, exchangeRate))
    return acc;
  }, MenuPayload());
  res.status(200).json(response);
});

export default router;
