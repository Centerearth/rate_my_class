import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClassReviewPage from './ClassReviewPage';
import { getClassByID, getReviews } from '../services/api';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ classId: 'cs260' }),
}));

jest.mock('../services/api', () => ({
  getClassByID: jest.fn(),
  getReviews: jest.fn(),
}));

jest.mock('../components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('./NotFoundPage', () => ({
  __esModule: true,
  default: () => <div>Not Found</div>,
}));

const mockClass = {
  classId: 'cs260',
  className: 'Web Programming',
  classDescription: 'Learn web dev',
  credits: 3,
};

const mockReviews = [
  { _id: '1', name: 'Alice', grade: 'A', date: '1/1/2025', class: 'cs260', review: 'Great!', email: 'a@test.com', rating: 4 },
  { _id: '2', name: 'Bob', grade: 'B', date: '2/1/2025', class: 'cs260', review: 'Good.', email: 'b@test.com', rating: 5 },
];

beforeEach(() => {
  (getClassByID as jest.Mock).mockResolvedValue(mockClass);
  (getReviews as jest.Mock).mockResolvedValue(mockReviews);
});

describe('ClassReviewPage', () => {
  it('shows class info after loading', async () => {
    render(<ClassReviewPage />);
    expect(await screen.findByText(/Web Programming/)).toBeInTheDocument();
    expect(await screen.findByText(/credits/i)).toBeInTheDocument();
  });

  it('shows NotFoundPage when the class does not exist', async () => {
    (getClassByID as jest.Mock).mockRejectedValue(new Error('Not found'));
    render(<ClassReviewPage />);
    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });

  it('displays reviews in the table', async () => {
    render(<ClassReviewPage />);
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
    expect(await screen.findByText('Great!')).toBeInTheDocument();
  });

  it('computes and displays the average rating', async () => {
    render(<ClassReviewPage />);
    await screen.findByText('Alice'); // wait for reviews to render
    await waitFor(() => {
      expect(screen.getByText(/avg rating/i).closest('span')).toHaveTextContent('4.5');
    });
  });

  it('shows dash for reviews without a rating', async () => {
    (getReviews as jest.Mock).mockResolvedValue([
      { _id: '1', name: 'Alice', grade: 'A', date: '1/1/2025', class: 'cs260', review: 'Great!', email: 'a@test.com' },
    ]);
    render(<ClassReviewPage />);
    expect(await screen.findByText(/—\/5/)).toBeInTheDocument();
  });

  it('shows "No reviews posted yet" when there are no reviews', async () => {
    (getReviews as jest.Mock).mockResolvedValue([]);
    render(<ClassReviewPage />);
    expect(await screen.findByText('No reviews posted yet.')).toBeInTheDocument();
  });
});
