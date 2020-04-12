import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { expect } from 'chai';
import app from '../src/server';
import config from '../src/config';
import { MongoMenuItem } from "../src/datasource/menu";
import { MenuItemCategory } from "../src/domain/menu";
import { MongoCart } from "../src/datasource/cart";
import { MongoOrder } from "../src/datasource/order";
import { MongoCurrencyRate } from "../src/datasource/rate";
import * as moment from "moment";
import { Currency } from "../src/domain/currency";

const ObjectId = mongoose.Types.ObjectId;

describe('orders', () => {

    before(async () => {
        await mongoose.connect(config.get('mongo:uri'), config.get('mongo:options'));
    });

    beforeEach(async () => {
        await Promise.all([
            MongoMenuItem.deleteMany({}),
            MongoCurrencyRate.deleteMany({}),
            MongoCart.deleteMany({}),
            MongoOrder.deleteMany({})
        ])
    });

    after(async () => {
        await mongoose.connection.close();
    });

    describe ('POST /orders', () => {

        const invalidPayloads = [
            {},
            { cartId: 'whatever' },
            { cartId: '1'.padStart(24, '1') },
            { cartId: '1'.padStart(24, '1'), address: 'short' },
            { address: 'this is a long address string' }
        ]
        invalidPayloads.forEach(variant => {
            it(`should respond with bad request if payload is invalid (${JSON.stringify(variant)})`, async () => {
                const { status } = await request(app).post('/orders').send(variant);
                expect(status).to.equal(400);
            });
        });

        it('should not submit non-existent carts', async () => {
            const { status } = await request(app).post('/orders')
                .send({ cartId: '1'.padStart(24, '1'), address: 'Downing Street no. 10' });

            expect(status).to.equal(404);
        });

        it('should not submit already submitted carts', async () => {
            const menuItem = await new MongoMenuItem({
                _id: ObjectId('2'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', priceEurCents: 400, category: MenuItemCategory.Appetizer
            }).save()
            const cart = await new MongoCart({
                _id: ObjectId('1'.padStart(24, '1')),
                submitted: true,
                items: [{ _id: ObjectId('3'.padStart(24, '1')), itemId: menuItem._id, quantity: 1 }]
            }).save();

            const { status } = await request(app).post('/orders')
                .send({ cartId: cart._id, address: 'Baker Street 221B' });

            expect(status).to.equal(400);
        });

        it('should submit a well-formed order', async () => {
            await new MongoCurrencyRate({
                date: moment().toDate(), from: Currency.EUR, to: Currency.USD, rate: 1.2
            }).save();
            const menuItem = await new MongoMenuItem({
                _id: ObjectId('2'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', priceEurCents: 400, category: MenuItemCategory.Appetizer
            }).save()
            const cart = await new MongoCart({
                _id: ObjectId('1'.padStart(24, '1')),
                items: [{ _id: ObjectId('3'.padStart(24, '1')), itemId: menuItem._id, quantity: 1 }]
            }).save();

            const { body, status } = await request(app).post('/orders')
                .send({ cartId: cart._id, address: 'Baker Street 221B', currency: 'USD' })

            const expected = {
                address: 'Baker Street 221B',
                totalPrice: 480,
                items: [{ id: '3'.padStart(24, '1'), itemId: '2'.padStart(24, '1'), quantity: 1 }]
            }

            expect(status).to.equal(200);
            expect(body.address).to.equal(expected.address);
            expect(body.totalPrice).to.equal(expected.totalPrice);
            expect(body.items).to.eql(expected.items);
        });
    });

    describe('GET /orders', () => {
        it('should return an empty array if no carts are present', async () => {
            const { status, body } = await request(app).get('/orders').send();
            expect(status).to.equal(200);
            expect(body).to.eql([]);
        });

        it('should return a list of orders', async () => {
            const menuItem = await new MongoMenuItem({
                _id: ObjectId('2'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', priceEurCents: 400, category: MenuItemCategory.Appetizer
            }).save()
            const order = await new MongoOrder({
                _id: ObjectId('1'.padStart(24, '1')),
                cartId: ObjectId('4'.padStart(24, '1')),
                address: '221B Baker Street',
                totalPriceEurCents: 800,
                items: [{ _id: ObjectId('3'.padStart(24, '1')), itemId: menuItem._id, quantity: 2 }]
            }).save();

            const { status, body } = await request(app).get('/orders').send();

            const expected = [{
                id: '1'.padStart(24, '1'),
                address: '221B Baker Street',
                totalPrice: 800,
                items: [
                    { id: '3'.padStart(24, '1'), itemId: '2'.padStart(24, '1'), quantity: 2 }
                ]
            }]

            expect(status).to.equal(200);
            expect(body).to.eql(expected);
        });
    });
});