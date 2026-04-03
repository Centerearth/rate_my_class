const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

let userCollection;
let reviewCollection;

function connect(url) {
  const client = new MongoClient(url);
  userCollection = client.db('startup').collection('user');
  reviewCollection = client.db('startup').collection('reviews');
  return client;
}

function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)).toString('hex');
  return `${salt}:${hash}`;
}

async function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashToVerify = (await scrypt(password, salt, 64)).toString('hex');
  return hash === hashToVerify;
}

async function createUser(name, email, password) {
  console.log(`[DB] Creating user record for ${email}`);

  const user = {
    name: name,
    email: email,
    password: await hashPassword(password),
    token: crypto.randomUUID(),
  };
  await userCollection.insertOne(user);

  return user;
}

function addReview(review) {
  return reviewCollection.insertOne(review);
}

function getReview(classId) {
  const cursor = reviewCollection.find({ class: classId });
  return cursor.toArray();
}

function deleteUser(email) {
  return userCollection.deleteOne({ email: String(email) });
}

module.exports = {
  connect,
  getUser,
  getUserByToken,
  createUser,
  verifyPassword,
  addReview,
  getReview,
  deleteUser,
};
