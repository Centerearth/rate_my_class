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

const VALID_GRADES = new Set(['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']);

// SubmitReview — requires auth (mounted behind secureApiRouter)
secureRouter.post('/review/:class', async (req, res) => {
  const { name, grade, date, review } = req.body;
  const classUsed = String(req.params['class']);

  if (!name || !grade || !date || !review) {
    res.status(400).json({ msg: 'Missing required fields: name, grade, date, review' });
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

  await DB.addReview({ name, grade, date, class: classUsed, review });
  const reviews = await DB.getReviews(classUsed);
  res.send(reviews);
});

export { publicRouter, secureRouter };
