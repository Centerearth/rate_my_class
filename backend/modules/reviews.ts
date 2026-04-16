import express from 'express';
import * as DB from './database';

const publicRouter = express.Router();
const secureRouter = express.Router();

// GetReviews — public
publicRouter.get('/review/:class', async (req, res) => {
  const classUsed = String(req.params['class']);
  const reviews = await DB.getReviews(classUsed);
  res.send(reviews);
});

// GetReviewsByEmail — public
publicRouter.get('/review/email/:email', async (req, res) => {
  const email = String(req.params['email']);
  const reviews = await DB.getReviewsByEmail(email);
  res.send(reviews);
});


const VALID_GRADES = new Set(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']);

// SubmitReview — requires auth (mounted behind secureApiRouter)
secureRouter.post('/review/:class', async (req, res) => {
  const { name, grade, date, review, email, rating } = req.body;
  const classUsed = String(req.params['class']);

  if (!name || !grade || !date || !review || !email || rating === undefined) {
    res.status(400).json({ msg: 'Missing required fields: name, grade, date, review, email, rating' });
    return;
  }

  if (!VALID_GRADES.has(grade)) {
    res.status(400).json({ msg: 'Invalid grade. Must be a letter grade (e.g. A, B+, C-)' });
    return;
  }

  if (typeof review !== 'string' || review.trim().length === 0) {
    res.status(400).json({ msg: 'Review text cannot be empty' });
    return;
  }

  if (typeof rating !== 'number' || rating < 0 || rating > 5 || (rating * 2) % 1 !== 0) {
    res.status(400).json({ msg: 'Rating must be a number from 0 to 5 in 0.5 increments' });
    return;
  }

  await DB.addReview({ name, grade, date, class: classUsed, review, email, rating });
  res.status(201).end();
});

secureRouter.delete('/review/:id', async (req, res) => {
  const id = String(req.params['id']);
  const review = await DB.getReviewByID(id);
  if (!review) {
    res.status(404).json({ msg: 'Review not found' });
    return;
  }
  await DB.deleteReview(id);
  res.status(204).end();
});

export { publicRouter, secureRouter };
