import { getClasses, getClassByID, postReview, Review } from './api';

const mockFetch = jest.fn();
window.fetch = mockFetch;

function makeResponse(ok: boolean, body: unknown, status = ok ? 200 : 400) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => mockFetch.mockReset());

const mockClass = { classId: 'cs260', className: 'Web Programming', classDescription: 'desc', credits: 3 };

describe('getClasses', () => {
  it('returns classes on success', async () => {
    mockFetch.mockReturnValue(makeResponse(true, [mockClass]));
    await expect(getClasses()).resolves.toEqual([mockClass]);
  });

  it('throws on failure', async () => {
    mockFetch.mockReturnValue(makeResponse(false, {}));
    await expect(getClasses()).rejects.toThrow('Failed to fetch classes');
  });
});

describe('getClassByID', () => {
  it('returns class on success', async () => {
    mockFetch.mockReturnValue(makeResponse(true, mockClass));
    const result = await getClassByID('cs260');
    expect(result).toEqual(mockClass);
    expect(mockFetch).toHaveBeenCalledWith('/api/class/cs260');
  });

  it('throws when class not found', async () => {
    mockFetch.mockReturnValue(makeResponse(false, {}, 404));
    await expect(getClassByID('invalid')).rejects.toThrow('Failed to fetch class');
  });
});

describe('postReview', () => {
  const review: Review = {
    name: 'Alice', grade: 'A', date: '1/1/2025',
    class: 'cs260', review: 'Great class', email: 'alice@test.com', rating: 4.5,
  };

  it('resolves on success', async () => {
    mockFetch.mockReturnValue(makeResponse(true, null, 201));
    await expect(postReview('cs260', review)).resolves.toBeUndefined();
  });

  it('throws with server message on failure', async () => {
    mockFetch.mockReturnValue(makeResponse(false, { msg: 'Invalid rating' }));
    await expect(postReview('cs260', review)).rejects.toThrow('Invalid rating');
  });

  it('sends to the correct endpoint', async () => {
    mockFetch.mockReturnValue(makeResponse(true, null, 201));
    await postReview('cs260', review);
    expect(mockFetch).toHaveBeenCalledWith('/api/review/cs260', expect.objectContaining({ method: 'POST' }));
  });
});
