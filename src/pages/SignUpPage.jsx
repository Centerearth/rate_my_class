import React from 'react';
import Layout from '../components/Layout';

export default function SignUpPage() {
  async function createUser() {
    const userName = document.querySelector('#your_name')?.value;
    const userEmail = document.querySelector('#email')?.value;
    const password = document.querySelector('#password')?.value;
    const response = await fetch('/api/auth/create', {
      method: 'post',
      body: JSON.stringify({ name: userName, email: userEmail, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    const body = await response.json();

    if (response?.status === 200) {
      localStorage.setItem('userName', userName);
      window.location.href = '/login';
    } else {
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  return (
    <Layout>
      <div className="col-lg-12 col-xl-11">
        <div className="card text-black" style={{ borderRadius: '25px' }}>
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
              <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
              <form className="mx-1 mx-md-4">
                <div className="d-flex flex-row align-items-center mb-4">
                  <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                  <div className="form-outline flex-fill mb-0">
                    <input type="text" id="your_name" className="form-control" />
                    <label className="form-label" htmlFor="your_name">Your Name</label>
                  </div>
                </div>
                <div className="d-flex flex-row align-items-center mb-4">
                  <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                  <div className="form-outline flex-fill mb-0">
                    <input type="email" id="email" className="form-control" />
                    <label className="form-label" htmlFor="email">Your Email</label>
                  </div>
                </div>
                <div className="d-flex flex-row align-items-center mb-4">
                  <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                  <div className="form-outline flex-fill mb-0">
                    <input type="password" id="password" className="form-control" />
                    <label className="form-label" htmlFor="password">Password</label>
                  </div>
                </div>
                <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                  <button type="button" className="btn btn-primary btn-lg" onClick={createUser}>
                    Register
                  </button>
                </div>
              </form>
            </div>
            <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
              <img src="/Y2.png" className="img-fluid" alt="Sample image" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
