import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);

export interface DBUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  token: string;
}

export interface DBReview {
  name: string;
  grade: string;
  date: string;
  class: string;
  review: string;
}

let userCollection: import('mongodb').Collection<DBUser>;
let reviewCollection: import('mongodb').Collection<DBReview>;

export function connect(url: string): MongoClient {
  const client = new MongoClient(url);
  userCollection = client.db('startup').collection<DBUser>('user');
  reviewCollection = client.db('startup').collection<DBReview>('reviews');
  return client;
}

export function getUser(email: string): Promise<DBUser | null> {
  return userCollection.findOne({ email });
}

export function getUserByToken(token: string): Promise<DBUser | null> {
  return userCollection.findOne({ token });
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = ((await scrypt(password, salt, 64)) as Buffer).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  const hashToVerify = ((await scrypt(password, salt, 64)) as Buffer).toString('hex');
  return hash === hashToVerify;
}

export async function createUser(name: string, email: string, password: string): Promise<DBUser> {
  // console.log(`[DB] Creating user record for ${email}`);
  const user: DBUser = {
    name,
    email,
    password: await hashPassword(password),
    token: crypto.randomUUID(),
  };
  await userCollection.insertOne(user);
  return user;
}

export function addReview(review: DBReview): Promise<import('mongodb').InsertOneResult> {
  return reviewCollection.insertOne(review);
}

export function getReview(classId: string): Promise<DBReview[]> {
  return reviewCollection.find({ class: classId }).toArray();
}

export function deleteUser(email: string): Promise<import('mongodb').DeleteResult> {
  return userCollection.deleteOne({ email: String(email) });
}
