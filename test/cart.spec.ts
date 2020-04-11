import * as request from 'supertest';
import * as mongoose from "mongoose";
import { MongoCart } from "../src/datasource/cart";
import app from "../src";
import { expect } from 'chai';
import { MongoMenuItem } from '../src/datasource/menu';
import { MenuItemCategory } from "../src/domain/menu";
import moment = require("moment");

const ObjectId = mongoose.Types.ObjectId;


describe('carts', () => {

    before(async () => {
        await mongoose.connect('mongodb://localhost:27017/desquared', { useNewUrlParser: true });
    })

    beforeEach(async () => {
        await Promise.all([
            MongoCart.deleteMany({}),
            MongoMenuItem.deleteMany({}),
        ]);
    })

    after(async () => {
        await mongoose.connection.close();
    })

    describe('POST /carts', () => {
        it("should create an empty cart and redirect to its location", async () => {
            const { headers, status } = await request(app).post('/carts').send()

            expect(status).to.equal(201)
            expect(headers.location).to.match(/\/carts\/[0-9a-f]{24}/)
        });
    })

    describe('GET /carts', () => {
        it('should respond with not found if id is malformed', async () => {
            const { status } = await request(app).get('/carts/something').send();
            expect(status).to.equal(404);
        });

        it('should respond with not found if cart does not exist', async () => {
            const { status } = await request(app).get(`/carts/${ObjectId.createFromTime(moment().unix())}`).send();
            expect(status).to.equal(404);
        })

        it('should respond with the cart contents if found', async () => {
            const menuItem = await new MongoMenuItem({
                _id: ObjectId('1'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', price_eur_cents: 400, category: MenuItemCategory.Appetizer
            }).save()
            const cart = await new MongoCart({
                _id: ObjectId('2'.padStart(24, '1')),
                items: [{ itemId: menuItem._id, quantity: 1 }]
            }).save();

            const expected = {
                id: '2'.padStart(24, '1'),
                items: [
                    { itemId: '1'.padStart(24, '1'), quantity: 1 }
                ]
            }

            const { body, status } = await request(app).get(`/carts/${cart._id}`).send();

            expect(status).to.equal(200);
            expect(body).to.eql(expected);
        });
    });

    describe('POST /carts/:id/items', () => {
        it('should respond with 404 if the cart does not exist', async () => {
           const { status } = await request(app).post('/carts/something/items').send();
           expect(status).to.equal(404);
        });

        it('should respond with 400 if the request body is invalid', async () => {
            const cart = await new MongoCart({
                _id: ObjectId('1'.padStart(24, '1')),
            }).save();
            const item = await new MongoMenuItem({
                _id: ObjectId('1'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', price_eur_cents: 400, category: MenuItemCategory.Appetizer
            }).save()

            const fixtures = [
                {},
                { invalidKey: 42 },
                { quantity: 1 },
                { itemId: item._id, quantity: 0 },
                { itemId: 'whatever', quantity: 1 }
            ];

            const responses = await Promise.all(fixtures.map(el => {
                return request(app).post(`/carts/${cart._id}/items`).send(el)
            }))
            responses.forEach((r) => expect(r.status).to.equal(400));
        });

        it('should add the item to cart if valid', async () => {
            const cart = await new MongoCart({
                _id: ObjectId('1'.padStart(24, '1')),
            }).save();
            const item = await new MongoMenuItem({
                _id: ObjectId('2'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', price_eur_cents: 400, category: MenuItemCategory.Appetizer
            }).save()

            const { body, status } = await request(app).post(`/carts/${cart._id}/items`)
                .send({ itemId: item._id, quantity: 1, comment: 'Extra spicy too'});

            const expected = {
                id: '1'.padStart(24, '1'),
                items: [
                    { itemId: '2'.padStart(24, '1'), quantity: 1, comment: 'Extra spicy too' }
                ]
            };

            expect(status).to.equal(200);
            expect(body).to.eql(expected);
        });
    });
});
