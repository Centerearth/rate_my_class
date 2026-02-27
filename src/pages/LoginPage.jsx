import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function LoginPage() {
  async function loginUser() {
    loginOrCreate(`/api/auth/login`);
  }

  async function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
    }).then(() => (window.location.href = '/login'));
  }

  async function loginOrCreate(endpoint) {
    const userEmail = document.querySelector('#email')?.value;
    const password = document.querySelector('#password')?.value;
    const response = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({ email: userEmail, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    const body = await response.json();

    if (response?.status === 200) {
      localStorage.setItem('userEmail', userEmail);
      window.location.href = '/review-maker';
    } else {
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  return (
    <Layout>
      <div id="login-main">
        <h1>Login</h1>
        <form id="myForm">
          <div className="form-outline mb-4">
            <input type="email" id="email" className="form-control" />
            <label className="form-label" htmlFor="email">Email address</label>
          </div>
          <div className="form-outline mb-4">
            <input type="password" id="password" className="form-control" />
            <label className="form-label" htmlFor="password">Password</label>
          </div>
          <button type="button" className="btn btn-primary" onClick={loginUser}>
            Sign in
          </button>
          <button type="button" className="btn btn-primary" onClick={logout}>
            Logout
          </button>
          <div className="text-center">
            <p>
              Don't have an account? Set one up <Link to="/sign-up">here!</Link>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
}
