import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewMakerPage from './ReviewMakerPage';
import { getClasses, postReview } from '../services/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  getClasses: jest.fn(),
  postReview: jest.fn(),
  addClass: jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  __esModule: true,
  useAuth: () => ({ user: { name: 'Alice', email: 'alice@test.com' } }),
}));

jest.mock('../components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockClasses = [
  { classId: 'cs260', className: 'Web Programming', classDescription: 'desc', credits: 3 },
];

beforeEach(() => {
  mockNavigate.mockReset();
  (getClasses as jest.Mock).mockResolvedValue(mockClasses);
  (postReview as jest.Mock).mockResolvedValue(undefined);
});

function getReviewForm() {
  return screen.getByRole('button', { name: 'Submit Review' }).closest('form')!;
}

describe('ReviewMakerPage', () => {
  it('renders review form fields', () => {
    render(<ReviewMakerPage />);
    expect(screen.getByPlaceholderText('Search for a class...')).toBeInTheDocument();
    expect(screen.getByText('Grade')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows Add a Class form when logged in', () => {
    render(<ReviewMakerPage />);
    expect(screen.getByText('Add a Class')).toBeInTheDocument();
  });

  it('shows error for an unrecognized class ID', async () => {
    render(<ReviewMakerPage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalled());

    const form = getReviewForm();
    fireEvent.change(screen.getByPlaceholderText('Search for a class...'), {
      target: { value: 'invalid999' },
    });
    fireEvent.change(form.querySelector('textarea')!, {
      target: { value: 'Great class' },
    });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/"invalid999" is not a recognized class ID\./)).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits and navigates on a valid review', async () => {
    render(<ReviewMakerPage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalled());

    const form = getReviewForm();
    fireEvent.change(screen.getByPlaceholderText('Search for a class...'), {
      target: { value: 'cs260' },
    });
    fireEvent.change(form.querySelector('textarea')!, {
      target: { value: 'Loved it!' },
    });
    fireEvent.submit(form);

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/cs260'));
  });
});
