import * as request from 'supertest';
import * as mongoose from 'mongoose';
import { expect } from 'chai';
import app from '../src';
import config from '../src/config';
import { MongoMenuItem } from "../src/datasource/menu";


describe('orders', () => {

    before(async () => {
        await mongoose.connect(config.get('mongo:uri'), config.get('mongo:options'));
    });

    beforeEach(async () => {
        await Promise.all([
            MongoMenuItem.deleteMany({}),
        ])
    });

    after(async () => {
        await mongoose.connection.close();
    });

    describe ('POST /orders', () => {
        it('should respond with bad request if payload is invalid', async () => {
            const { status } = await request(app).post('/orders').send({});
            expect(status).to.equal(400);
        });
    });
});