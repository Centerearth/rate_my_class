# Rate My Class

Gone is the stress you feel every time you pick classes for your next semester at BYU. **Rate My Class** is a RateMyProfessor-style app that makes choosing classes easy by giving you all the information you need to make informed decisions. Students who have taken a class can post reviews covering difficulty, grade received, and general thoughts. Students looking to take a class can browse reviews from previous takers to make their BYU experience as smooth as possible.

## Features

- Secure account creation and login
- Browse supported BYU classes and read peer reviews
- Post reviews for classes you have taken (requires login)
- Reviews stored persistently in MongoDB

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 19, React Router, Bootstrap 5 |
| Build    | Vite                              |
| Backend  | Node.js, Express 5                |
| Database | MongoDB                           |
| Auth     | bcrypt, httpOnly cookies          |

## Getting Started

### Prerequisites

- Node.js
- A running MongoDB instance
- A `.env` file at the project root with:

```
MONGODB_URI=<your connection string>
```

### Install dependencies

```bash
npm install
```

### Run in development

Start the frontend dev server (proxies API calls to `localhost:3000`):

```bash
npm run dev
```

Start the backend in a separate terminal:

```bash
npm start
```

### Build for production

```bash
npm run build   # outputs to dist/
npm start       # serves dist/ and the API on port 3000
```

## Deployment

The app is deployed at [ratemyclass.me](https://ratemyclass.me).
