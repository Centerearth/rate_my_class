export interface User {
  name: string;
  email: string;
}

export interface Review {
  name: string;
  grade: string;
  date: string;
  class: string;
  review: string;
  email: string;
}

export async function postAuthRequest(endpoint: string, data: Record<string, string>): Promise<unknown> {
  const response = await fetch(endpoint, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  });

  const body = await response.json();

  if (response.status !== 200) {
    throw new Error(body.msg || 'An unknown error occurred');
  }

  return body;
}

export async function logout(): Promise<void> {
  await fetch(`/api/auth/logout`, { method: 'delete' });
}

export async function getUser(): Promise<User | null> {
  const response = await fetch('/api/auth/me');
  if (response.ok) {
    return response.json();
  }
  return null;
}

export async function getReviews(classNum: string): Promise<Review[]> {
  const response = await fetch(`/api/review/${classNum}`);
  return response.json();
}


export async function postReview(classNum: string, review: Review): Promise<Review[]> {
  const response = await fetch(`/api/review/${classNum}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(review),
  });
  return response.json();
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch('/api/auth/account', { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
}
