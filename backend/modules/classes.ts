import express from 'express';
import * as DB from './database';

const publicRouter = express.Router();
const secureRouter = express.Router();

// GetClass — public
publicRouter.get('/class/:class', async (req, res) => {
  const classId = String(req.params['class']);
  const classData = await DB.getClassByID(classId);
  res.send(classData);
});

// GetClasses — public
publicRouter.get('/classes', async (req, res) => {
  const classes = await DB.getClasses();
  res.send(classes);
});

// SubmitClass— requires auth (mounted behind secureApiRouter)
secureRouter.post('/class', async (req, res) => {
  const { classId, className, classDescription, credits } = req.body;

  if (!classId || !className || !classDescription || typeof credits !== 'number') {
    res.status(400).json({ msg: 'Missing required fields: classId, className, classDescription, credits' });
    return;
  }

  await DB.addClass({ classId, className, classDescription, credits });
  res.status(201).json({ msg: 'Class added successfully' });
});

export { publicRouter, secureRouter };
