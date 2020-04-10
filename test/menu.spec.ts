import * as request from 'supertest';
import app from "../src";
import { MenuPayload, MenuItemCategory } from "../src/domain/menu";
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import { MongoCurrencyRate } from '../src/datasource/rate';
import moment = require("moment");
import { Currency } from "../src/domain/currency";
import { MongoMenuItem } from "../src/datasource/menu";

const ObjectId = mongoose.Types.ObjectId

describe("GET /menu", () => {

    before(async () => {
        await mongoose.connect('mongodb://localhost:27017/desquared', { useNewUrlParser: true });
    })

    beforeEach(async () => {
        await Promise.all([
            MongoMenuItem.deleteMany({}),
            MongoCurrencyRate.deleteMany({})
        ]);
    })

    after(async () => {
        await mongoose.connection.close();
    })

    it("should return an empty menu if nothing present", async () => {
        const { body } = await request(app).get('/menu').send()

        const expected: MenuPayload = {
            appetizers: [],
            salads: [],
            mains: [],
            drinks: []
        };

        expect(body).to.eql(expected);
    });

    it('should return the menu partitioned by category', async () => {
        await MongoMenuItem.insertMany([
            new MongoMenuItem({ _id: ObjectId('1'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', price_eur_cents: 400, category: MenuItemCategory.Appetizer }),
            new MongoMenuItem({ _id: ObjectId('2'.padStart(24, '1')), name: 'Caesar\'s salad', description: null, price_eur_cents: 500, category: MenuItemCategory.Salad }),
            new MongoMenuItem({ _id: ObjectId('3'.padStart(24, '1')), name: 'Cheesesteak', description: 'Kobe beef', price_eur_cents: 1300, category: MenuItemCategory.Main }),
            new MongoMenuItem({ _id: ObjectId('4'.padStart(24, '1')), name: 'Chicken Parmesan', description: null, price_eur_cents: 800, category: MenuItemCategory.Main }),
        ])

        const expected: MenuPayload = {
            appetizers: [{ id: '1'.padStart(24, '1'), name: 'Puffy Cheeseballs', description: 'Extra puffy', price: 400 }],
            salads: [{ id: '2'.padStart(24, '1'), name: 'Caesar\'s salad', description: null, price: 500 }],
            mains: [
                { id: '3'.padStart(24, '1'), name: 'Cheesesteak', description: 'Kobe beef', price: 1300 },
                { id: '4'.padStart(24, '1'), name: 'Chicken Parmesan', description: null, price: 800 }
            ],
            drinks: []
        }

        const { body } = await request(app).get('/menu').send()
        expect(body).to.eql(expected);
    })

    it('should exchange the prices to another currency if requested', async () => {
        await MongoMenuItem.insertMany([
            { _id: ObjectId('1'.padStart(24, '1')), name: 'Cheesesteak', description: 'Kobe beef', price_eur_cents: 1000, category: MenuItemCategory.Main },
            { _id: ObjectId('2'.padStart(24, '1')), name: 'Chicken', description: null, price_eur_cents: 500, category: MenuItemCategory.Main }
        ]);

        await new MongoCurrencyRate({
            date: moment().toDate(), from: Currency.EUR, to: Currency.USD, rate: 1.2
        }).save();

        const expected: MenuPayload = {
            appetizers: [], salads: [], drinks: [], mains: [
                { id: '1'.padStart(24, '1'), name: 'Cheesesteak', description: 'Kobe beef', price: 1200 },
                { id: '2'.padStart(24, '1'), name: 'Chicken', description: null, price: 600 }
            ]
        }

        const { body } = await request(app).get('/menu?currency=USD').send()
        expect(body).to.eql(expected);
    })
});