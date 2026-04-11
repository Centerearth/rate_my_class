import supertest from 'supertest';

jest.mock('./database', () => ({
    getUser: jest.fn(),
    getUserByToken: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const DB = require('./database');
const {router, secureApiRouter} = require('./auth');

function buildPublicApp() {
    const app = express();
    app.use(express.json());
    app.use('/api', router);
    return app;
}

function buildSecureApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', secureApiRouter);
    return app;
}

const TEST_TOKEN = 'valid-token';
const TEST_USER = {
    _id: 'abc123',
    email: 'test@example.com',
    name: 'Test User',
    token: TEST_TOKEN,
};

function authed(req: supertest.Test) {
    return req.set('Cookie', `token=${TEST_TOKEN}`);
}

beforeEach(() => {
    jest.clearAllMocks();
    DB.getUserByToken.mockResolvedValue(TEST_USER); //every call to this function will return TEST_USER
});



// ---------------------------------------------------------------------------
// POST /api/auth/create
// ---------------------------------------------------------------------------

describe('POST /auth/create', () => {
  it('test returns 409 when the user already exists', async () => {
    DB.getUser.mockResolvedValue(TEST_USER);
    const res = await request(buildPublicApp())
      .post('/api/auth/create')
      .send({ email: 'test@example.com', name: 'Test User', password: 'pw' });

    console.log(res.body);
    expect(res.status).toBe(409);
    expect(res.body.msg).toBeDefined();
    expect(DB.createUser).not.toHaveBeenCalled();
  });

  it('test creates a new user and returns email + name', async () => {
    DB.getUser.mockResolvedValue(null);
    DB.createUser.mockResolvedValue(TEST_USER);

    const res = await request(buildPublicApp())
      .post('/api/auth/create')
      .send({ email: 'test@example.com', name: 'Test User', password: 'pw' });

    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: TEST_USER._id });
    expect(DB.createUser).toHaveBeenCalledWith('Test User', 'test@example.com', 'pw');
  });
});


