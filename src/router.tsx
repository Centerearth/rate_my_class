import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ReviewMakerPage from './pages/ReviewMakerPage';
import ClassReviewPage from './pages/ClassReviewPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/account', element: <AccountPage /> },
      { path: '/review-maker', element: <ReviewMakerPage /> },
    ],
  },
  { path: '/:classNum', element: <ClassReviewPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
