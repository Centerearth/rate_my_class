import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import * as DB from './modules/database';
import { router as authRouter, secureApiRouter } from './modules/auth';
import { publicRouter as reviewsPublicRouter, secureRouter as reviewsSecureRouter } from './modules/reviews';
import { publicRouter as classesPublicRouter, secureRouter as classesSecureRouter } from './modules/classes';

const dbUser = process.env.MONGOUSER;
const dbPassword = process.env.MONGOPASSWORD;
const dbHostname = process.env.MONGOHOSTNAME;

if (!dbUser) {
  throw new Error('Database not configured. Set environment variables');
}

DB.connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbHostname}`);

const app = express();
const port = process.argv.length > 2 ? Number(process.argv[2]) : 3000;

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.static('dist'));

app.use('/api', authRouter);
app.use('/api', reviewsPublicRouter);
app.use('/api', classesPublicRouter);
app.use('/api', secureApiRouter);
secureApiRouter.use(reviewsSecureRouter);
secureApiRouter.use(classesSecureRouter);

app.use(function (err: Error, _req: Request, res: Response, _next: NextFunction) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req: Request, res: Response) => {
  res.sendFile('index.html', { root: 'dist' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
