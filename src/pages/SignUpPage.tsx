import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const inputStyle: React.CSSProperties = {
  background: 'rgba(0, 20, 60, 0.6)',
  border: '1px solid rgba(0, 90, 200, 0.35)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '0.6rem 0.75rem',
  width: '100%',
};

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0a4aab 0%, #1a6fd4 100%)',
  border: '1px solid rgba(0, 100, 220, 0.4)',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.6rem',
  fontWeight: 600,
  cursor: 'pointer',
  width: '100%',
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function createUser() {
    if (!password || password.length < 8) {
      alert('⚠ Error: Password must be at least 8 characters long');
      return;
    }
    try {
      await signup(userName, email, password);
      navigate('/');
    } catch (error) {
      alert(`⚠ Error: ${(error as Error).message}`);
    }
  }

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: '400px', padding: '1rem' }}>
        <div style={{
          background: 'rgba(0, 20, 60, 0.45)',
          border: '1px solid rgba(0, 90, 200, 0.25)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(8px)',
        }}>
          <h1 style={{ color: 'var(--text-primary)', textAlign: 'center', marginBottom: '1.75rem', fontSize: '1.75rem', fontWeight: 700 }}>Sign Up</h1>
          <form onSubmit={(e) => { e.preventDefault(); createUser(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ color: 'var(--text-bright)', display: 'block', marginBottom: '0.4rem' }}>Your Name</label>
              <input type="text" style={inputStyle} value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div>
              <label style={{ color: 'var(--text-bright)', display: 'block', marginBottom: '0.4rem' }}>Email address</label>
              <input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div>
              <label style={{ color: 'var(--text-bright)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
              <input type="password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 8 characters)" required />
            </div>
            <button type="submit" style={{ ...btnStyle, marginTop: '0.5rem' }}>Register</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
              <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
