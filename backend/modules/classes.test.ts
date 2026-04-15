jest.mock('./database', () => ({
    getClassByID: jest.fn(),
    getClasses: jest.fn(),
    addClass: jest.fn(),
}));

const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const DB = require('./database');
const {publicRouter, secureRouter} = require('./classes');

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
// POST /api/class
// ---------------------------------------------------------------------------

describe('POST /class', () => {
  it('test returns 400 when class data is invalid', async () => {
    const res = await request(buildSecureApp())
      .post('/api/class')
      .send({ classId: 'fake class', credits: '5' });

    expect(res.status).toBe(400);
  });

  it('test creates a new class and returns 201', async () => {
    DB.addClass.mockResolvedValue({ acknowledged: true, insertedId: 'cs101' });

    const res = await request(buildSecureApp())
      .post('/api/class')
      .send({ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 });

    expect(res.status).toBe(201);
    expect(DB.addClass).toHaveBeenCalledWith({ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 });
  });
});


// ---------------------------------------------------------------------------
// GET /api/class/:class
// ---------------------------------------------------------------------------

describe('GET /class/:class', () => {
  it('test returns the class given the classId', async () => {
    DB.getClassByID.mockResolvedValue({ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 });

    const res = await request(buildPublicApp())
      .get('/api/class/CS101');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 });
  });
});

// ---------------------------------------------------------------------------
// GET /api/classes
// ---------------------------------------------------------------------------

describe('GET /api/classes', () => {
  it('test returns all classes', async () => {
    DB.getClasses.mockResolvedValue([{ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 }]);

    const res = await request(buildPublicApp())
      .get('/api/classes');

    expect(res.status).toBe(200);
    expect(DB.getClasses).toHaveBeenCalled();
    expect(res.body).toHaveLength(1);
    expect(res.body).toEqual([{ classId: 'CS101', className: 'Intro to Computer Science', classDescription: 'Learn the basics of computer science.', credits: 4 }]);
  });
});

