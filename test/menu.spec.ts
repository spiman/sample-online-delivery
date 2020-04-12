import * as request from 'supertest';
import app from '../src/server';
import { expect } from 'chai';
import * as mongoose from 'mongoose';
import * as moment from 'moment';
import config from '../src/config';
import { MenuResponse, MenuItemCategory } from "../src/domain/menu";
import { MongoCurrencyRate } from '../src/datasource/rate';
import { Currency } from "../src/domain/currency";
import { MongoMenuItem } from "../src/datasource/menu";

const ObjectId = mongoose.Types.ObjectId

describe("GET /menu", () => {

    before(async () => {
        await mongoose.connect(config.get('mongo:uri'), config.get('mongo:options'));
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

        const expected: MenuResponse = {
            appetizers: [],
            salads: [],
            mains: [],
            drinks: []
        };

        expect(body).to.eql(expected);
    });

    it('should return the menu partitioned by category', async () => {
        await MongoMenuItem.insertMany([
            new MongoMenuItem({ _id: ObjectId('1'.padStart(24, '1')), name: 'Puffy Cheeseballs', description: 'Extra puffy', priceEurCents: 400, category: MenuItemCategory.Appetizer }),
            new MongoMenuItem({ _id: ObjectId('2'.padStart(24, '1')), name: 'Caesar\'s salad', description: null, priceEurCents: 500, category: MenuItemCategory.Salad }),
            new MongoMenuItem({ _id: ObjectId('3'.padStart(24, '1')), name: 'Cheesesteak', description: 'Kobe beef', priceEurCents: 1300, category: MenuItemCategory.Main }),
            new MongoMenuItem({ _id: ObjectId('4'.padStart(24, '1')), name: 'Chicken Parmesan', description: null, priceEurCents: 800, category: MenuItemCategory.Main }),
        ])

        const expected: MenuResponse = {
            appetizers: [{ id: '1'.padStart(24, '1'), name: 'Puffy Cheeseballs', description: 'Extra puffy', price: 4.00 }],
            salads: [{ id: '2'.padStart(24, '1'), name: 'Caesar\'s salad', description: null, price: 5.00 }],
            mains: [
                { id: '3'.padStart(24, '1'), name: 'Cheesesteak', description: 'Kobe beef', price: 13.00 },
                { id: '4'.padStart(24, '1'), name: 'Chicken Parmesan', description: null, price: 8.00 }
            ],
            drinks: []
        }

        const { body } = await request(app).get('/menu').send()
        expect(body).to.eql(expected);
    })

    it('should respond with 400 if an unknown currency is requested', async () => {
        const { status } = await request(app).get('/menu?currency=GRD').send()
        expect(status).to.equal(400)
    });

    it('should exchange the prices to another currency if requested', async () => {
        await MongoMenuItem.insertMany([
            { _id: ObjectId('1'.padStart(24, '1')), name: 'Cheesesteak', description: 'Kobe beef', priceEurCents: 1000, category: MenuItemCategory.Main },
            { _id: ObjectId('2'.padStart(24, '1')), name: 'Chicken', description: null, priceEurCents: 500, category: MenuItemCategory.Main }
        ]);

        await new MongoCurrencyRate({
            date: moment().toDate(), from: Currency.EUR, to: Currency.USD, rate: 1.2
        }).save();

        const expected: MenuResponse = {
            appetizers: [], salads: [], drinks: [], mains: [
                { id: '1'.padStart(24, '1'), name: 'Cheesesteak', description: 'Kobe beef', price: 12 },
                { id: '2'.padStart(24, '1'), name: 'Chicken', description: null, price: 6 }
            ]
        }

        const { body } = await request(app).get('/menu?currency=USD').send()
        expect(body).to.eql(expected);
    })
});