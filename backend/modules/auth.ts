import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import * as DB from './database';
import { DBUser } from './database';

declare module 'express-serve-static-core' {
  interface Request {
    user?: DBUser;
  }
}

const authCookieName = 'token';
const router = express.Router();

router.use(express.json());
router.use(cookieParser());

// CreateAuth token for a new user
router.post('/auth/create', async (req: Request, res: Response) => {
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await DB.createUser(req.body.name, req.body.email, req.body.password);
    setAuthCookie(res, user.token);
    res.send({ id: user._id });
  }
});

// GetAuth token for the provided credentials
router.post('/auth/login', async (req: Request, res: Response) => {
  const user = await DB.getUser(req.body.email);
  if (user && (await DB.verifyPassword(req.body.password, user.password))) {
    setAuthCookie(res, user.token);
    res.send({ id: user._id });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
router.delete('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetUser returns information about a user
router.get('/user/:email', async (req: Request, res: Response) => {
  const user = await DB.getUser(String(req.params.email));
  if (user) {
    const token = req?.cookies.token;
    res.send({ email: user.email, authenticated: token === user.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
const secureApiRouter = express.Router();

secureApiRouter.use(async (req: Request, res: Response, next) => {
  const authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    req.user = user;
    next();
  } else {
    console.log(`[AUTH] Unauthorized access attempt to ${req.originalUrl}`);
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

secureApiRouter.get('/auth/me', (req: Request, res: Response) => {
  res.send({ email: req.user!.email, name: req.user!.name });
});

secureApiRouter.delete('/auth/account', async (req: Request, res: Response) => {
  await DB.deleteUser(req.user!.email);
  res.clearCookie(authCookieName);
  res.status(204).end();
});

function setAuthCookie(res: Response, authToken: string): void {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

export { router, secureApiRouter };
