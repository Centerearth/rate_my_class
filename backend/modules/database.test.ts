import { MongoMemoryServer } from 'mongodb-memory-server';
import * as DB from './database';
import { ObjectId } from 'mongodb';

let mongod: MongoMemoryServer;
let client: import('mongodb').MongoClient;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  client = DB.connect(mongod.getUri());
  await client.connect();
});

afterAll(async () => {
  await client.close();
  await mongod.stop();
});

afterEach(async () => {
  const db = client.db('startup');
  await db.collection('user').deleteMany({});
  await db.collection('reviews').deleteMany({});
});

// --- User tests ---

describe('createUser', () => {
  test('inserts a user and returns it with a token', async () => {
    const user = await DB.createUser('Alice', 'alice@example.com', 'secret');
    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
    expect(user.token).toBeTruthy();
    expect(user.password).not.toBe('secret');
  });

  test('hashes the password (salt:hash format)', async () => {
    const user = await DB.createUser('Bob', 'bob@example.com', 'mypassword');
    const parts = user.password.split(':');
    expect(parts).toHaveLength(2);
    expect(parts[0]).toHaveLength(32); // 16 bytes hex salt
    expect(parts[1]).toHaveLength(128); // 64 bytes hex hash
  });
});

describe('getUser', () => {
  test('returns user by email', async () => {
    await DB.createUser('Alice', 'alice@example.com', 'secret');
    const found = await DB.getUser('alice@example.com');
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Alice');
  });

  test('returns null for unknown email', async () => {
    const found = await DB.getUser('nobody@example.com');
    expect(found).toBeNull();
  });
});

describe('getUserByToken', () => {
  test('returns user by token', async () => {
    const user = await DB.createUser('Alice', 'alice@example.com', 'secret');
    const found = await DB.getUserByToken(user.token);
    expect(found).not.toBeNull();
    expect(found!.email).toBe('alice@example.com');
  });

  test('returns null for unknown token', async () => {
    const found = await DB.getUserByToken('no-such-token');
    expect(found).toBeNull();
  });
});

describe('deleteUser', () => {
  test('deletes an existing user', async () => {
    await DB.createUser('Alice', 'alice@example.com', 'secret');
    const result = await DB.deleteUser('alice@example.com');
    expect(result.deletedCount).toBe(1);
    expect(await DB.getUser('alice@example.com')).toBeNull();
  });

  test('returns deletedCount 0 for unknown email', async () => {
    const result = await DB.deleteUser('ghost@example.com');
    expect(result.deletedCount).toBe(0);
  });
});

// --- Password tests ---

describe('verifyPassword', () => {
  test('returns true for correct password', async () => {
    const user = await DB.createUser('Alice', 'alice@example.com', 'correct');
    expect(await DB.verifyPassword('correct', user.password)).toBe(true);
  });

  test('returns false for wrong password', async () => {
    const user = await DB.createUser('Alice', 'alice@example.com', 'correct');
    expect(await DB.verifyPassword('wrong', user.password)).toBe(false);
  });
});

// --- Review tests ---

describe('addReview / getReviews / getReviewByID / getReviewsByEmail', () => {
  test('stores and retrieves reviews by classId', async () => {
    await DB.addReview({ class: 'CS101', name: 'Alice', grade: 'A', date: '1/1/2024', review: 'Great!', email: 'a@b.com' });
    await DB.addReview({ class: 'CS101', name: 'Bob', grade: 'B', date: '1/2/2024', review: 'Okay.', email: 'b@b.com' });
    await DB.addReview({ class: 'MATH200', name: 'Carol', grade: 'A-', date: '1/3/2024', review: 'Good.', email: 'c@b.com' });

    const cs101Reviews = await DB.getReviews('CS101');
    expect(cs101Reviews).toHaveLength(2);
    expect(cs101Reviews.every((r) => r.class === 'CS101')).toBe(true);
  });

  test('returns empty array when no reviews for class', async () => {
    const reviews = await DB.getReviews('NONEXISTENT');
    expect(reviews).toHaveLength(0);
  });

  test('getReviewByID returns the correct review', async () => {
    const result = await DB.addReview({ class: 'CS101', name: 'Alice', grade: 'A', date: '1/1/2024', review: 'Great!', email: 'a@b.com' });
    const reviewId = result.insertedId.toString();

    const review = await DB.getReviewByID(reviewId);
    expect(review).not.toBeNull();
    //expect(review!._id.toString()).toBe(reviewId);
    expect(review!.name).toBe('Alice');
  });

  test('getReviewByID returns null for unknown ID', async () => {
    const review = await DB.getReviewByID(new ObjectId().toString());
    expect(review).toBeNull();
  });

  test('stores and retrieves reviews by email', async () => {
    await DB.addReview({ class: 'CS101', name: 'Alice', grade: 'A', date: '1/1/2024', review: 'Great!', email: 'a@b.com' });
    await DB.addReview({ class: 'CS101', name: 'Bob', grade: 'B', date: '1/2/2024', review: 'Okay.', email: 'b@b.com' });
    await DB.addReview({ class: 'MATH200', name: 'Alice', grade: 'A-', date: '1/3/2024', review: 'Good.', email: 'a@b.com' });

    const aliceReviews = await DB.getReviewsByEmail('a@b.com');
    expect(aliceReviews).toHaveLength(2);
    expect(aliceReviews.every((r) => r.email === 'a@b.com')).toBe(true);
  });

  test('returns empty array when no reviews from a certain email', async () => {
    const reviews = await DB.getReviewsByEmail('NONEXISTENT');
    expect(reviews).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe('deleteReview', () => {
  it('removes a single review by ID', async () => {

    await DB.addReview({ class: 'CS101', name: 'Alice', grade: 'A', date: '1/1/2024', review: 'Great!', email: 'a@b.com' });
    expect(await DB.getReviews('CS101')).toHaveLength(1);
    await DB.deleteReview('69a20f986c3637ee0c6282c2'); //has to be a valid ObjectId format
    console.log(await DB.getReviewByID('69a20f986c3637ee0c6282c2'));
    expect(await DB.getReviewByID('69a20f986c3637ee0c6282c2')).toBeNull();
  });
});
//need to update reviews to store user email and id? 
