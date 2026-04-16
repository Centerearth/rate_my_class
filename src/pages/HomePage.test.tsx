import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import HomePage from './HomePage';
import { getClasses } from '../services/api';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../services/api', () => ({
  getClasses: jest.fn(),
}));

jest.mock('../components/Layout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockClasses = [
  { classId: 'cs260', className: 'Web Programming', classDescription: 'desc', credits: 3 },
  { classId: 'cs312', className: 'Algorithms', classDescription: 'desc', credits: 3 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockReset();
  (getClasses as jest.Mock).mockResolvedValue(mockClasses);
});

describe('HomePage', () => {
  it('renders a search input and GO button', async () => {
    render(<HomePage />);
    await act(async () => {});
    expect(screen.getByPlaceholderText('Search for a class...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'GO' })).toBeInTheDocument();
  });

  it('fetches classes on mount', async () => {
    render(<HomePage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalledTimes(1));
  });

  it('navigates to the class page on valid input', async () => {
    render(<HomePage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText('Search for a class...'), {
      target: { value: 'cs260' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'GO' }));

    expect(mockNavigate).toHaveBeenCalledWith('/cs260');
  });

  it('does not navigate for an unrecognized class ID', async () => {
    render(<HomePage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText('Search for a class...'), {
      target: { value: 'invalid999' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'GO' }));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates on Enter key via form submit', async () => {
    render(<HomePage />);
    await waitFor(() => expect(getClasses).toHaveBeenCalled());

    const input = screen.getByPlaceholderText('Search for a class...');
    fireEvent.change(input, { target: { value: 'cs312' } });
    fireEvent.submit(input.closest('form')!);

    expect(mockNavigate).toHaveBeenCalledWith('/cs312');
  });
});
