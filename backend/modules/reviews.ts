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
  const { name, grade, date, review, email } = req.body;
  const classUsed = String(req.params['class']);

  if (!name || !grade || !date || !review || !email) {
    res.status(400).json({ msg: 'Missing required fields: name, grade, date, review, email' });
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

  await DB.addReview({ name, grade, date, class: classUsed, review, email });
  const reviews = await DB.getReviews(classUsed);
  res.send(reviews);
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
