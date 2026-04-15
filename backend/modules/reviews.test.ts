import { get } from 'http';
import supertest from 'supertest';

jest.mock('./database', () => ({
    getReviews: jest.fn(),
    getReviewsByEmail: jest.fn(),
    getReviewByID: jest.fn(),
    deleteReview: jest.fn(),
    addReview: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const DB = require('./database');
const {publicRouter, secureRouter} = require('./reviews');

function buildPublicApp() {
    const app = express();
    app.use(express.json());
    app.use('/api', publicRouter);
    return app;
}

function buildSecureApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', secureRouter);
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

beforeEach(() => {
    jest.clearAllMocks();
});



// ---------------------------------------------------------------------------
// POST /api/review/:class
// ---------------------------------------------------------------------------

describe('POST /review/:class', () => {
  it('test returns 400 when review data is invalid', async () => {
    const res = await request(buildSecureApp())
      .post('/api/review/test-class')
      .send({ name: 'Test User', grade: 'A' });

    expect(res.status).toBe(400);
  });

  it('test creates a new review and returns 200', async () => {
    DB.addReview.mockResolvedValue({ acknowledged: true, insertedId: 'abc123' });

    const res = await request(buildSecureApp())
      .post('/api/review/test-class')
      .send({ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' });

    expect(res.status).toBe(200);
    expect(DB.addReview).toHaveBeenCalledWith({ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' });
  });
});


// ---------------------------------------------------------------------------
// GET /api/review/:class
// ---------------------------------------------------------------------------

describe('GET /review/:class', () => {
  it('test returns the reviews for the specified class', async () => {
    DB.getReviews.mockResolvedValue([{ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' }]);

    const res = await request(buildPublicApp())
      .get('/api/review/test-class');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' }]);
  });
});

// ---------------------------------------------------------------------------
// GET /api/review/email/:email
// ---------------------------------------------------------------------------

describe('GET /review/email/:email', () => {
  it('test returns the reviews for the specified email', async () => {
    DB.getReviewsByEmail.mockResolvedValue([{ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' }]);

    const res = await request(buildPublicApp())
      .get('/api/review/email/a@b.com');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' }]);
  });
});


// ---------------------------------------------------------------------------
// DELETE /api/review/:id
// ---------------------------------------------------------------------------

describe('DELETE /review/:id', () => {
  it('test deletes the specified review and returns 204', async () => {
    DB.getReviewByID.mockResolvedValue({ _id: 'abc123', name: 'Test User', grade: 'A', date: '2023-01-01', class: 'test-class', review: 'Great class!', email: 'a@b.com' });
    DB.deleteReview.mockResolvedValue({});

    const res = await request(buildSecureApp())
      .delete('/api/review/abc123');

    expect(res.status).toBe(204);
  });
});