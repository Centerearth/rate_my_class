import supertest from 'supertest';

jest.mock('./database', () => ({
    getUser: jest.fn(),
    getUserByToken: jest.fn(),
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    verifyPassword: jest.fn(),
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
    password: 'hashed-pw',
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

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: TEST_USER._id });
    expect(DB.createUser).toHaveBeenCalledWith('Test User', 'test@example.com', 'pw');
  });
});


// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  it('test returns 401 when user does not exist', async () => {
    DB.getUser.mockResolvedValue(null);
    const res = await request(buildPublicApp())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pw' });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBeDefined();
    expect(DB.verifyPassword).not.toHaveBeenCalled();
  });
  it('test returns 401 when password is incorrect', async () => {
    DB.getUser.mockResolvedValue(TEST_USER);
    
    const res = await request(buildPublicApp())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.msg).toBeDefined();
    expect(DB.verifyPassword).toHaveBeenCalledWith('wrong', TEST_USER.password);

  });
  it('test returns 200 and sets cookie when credentials are correct', async () => {
    DB.getUser.mockResolvedValue(TEST_USER);
    DB.verifyPassword.mockResolvedValue(true);

    const res = await request(buildPublicApp())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'pw' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: TEST_USER._id });
    expect(DB.verifyPassword).toHaveBeenCalledWith('pw', TEST_USER.password);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/auth/logout
// ---------------------------------------------------------------------------

describe('DELETE /auth/logout', () => {
  it('test clears the auth cookie', async () => {
    const res = await request(buildPublicApp())
        .delete('/api/auth/logout');

    expect(res.status).toBe(204);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});



// ---------------------------------------------------------------------------
// Secure router middleware
// ---------------------------------------------------------------------------

describe('secureApiRouter auth middleware', () => {
  it('test returns 401 when no token cookie is provided', async () => {
    DB.getUserByToken.mockResolvedValue(null);

    const res = await request(buildSecureApp())
      .get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe('GET /auth/me', () => {
  it('test returns the current user email and name', async () => {
    const res = await authed(request(buildSecureApp()).get('/api/auth/me'));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ email: 'test@example.com', name: 'Test User' });
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/auth/account
// ---------------------------------------------------------------------------

describe('DELETE /auth/account', () => {
  it('test deletes the account and returns 204', async () => {
    DB.deleteUser.mockResolvedValue();

    const res = await authed(request(buildSecureApp()).delete('/api/auth/account'));

    expect(res.status).toBe(204);
    expect(DB.deleteUser).toHaveBeenCalledWith('test@example.com');
  });
});