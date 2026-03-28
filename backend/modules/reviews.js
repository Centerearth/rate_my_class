const express = require('express');
const DB = require('./database.js');

const publicRouter = express.Router();
const secureRouter = express.Router();

// GetReviews — public
publicRouter.get('/review/:class', async (req, res) => {
  const classUsed = req.params.class;
  const reviews = await DB.getReview(classUsed);
  res.send(reviews);
});

// SubmitReview — requires auth (mounted behind secureApiRouter)
secureRouter.post('/review/:class', async (req, res) => {
  await DB.addReview(req.body);
  const classUsed = req.params.class;
  const reviews = await DB.getReview(classUsed);
  res.send(reviews);
});

module.exports = { publicRouter, secureRouter };
