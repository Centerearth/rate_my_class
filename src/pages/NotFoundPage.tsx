import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="text-center pt-5">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you are looking for does not exist.</p>
        <Link to="/" style={{
          background: 'linear-gradient(135deg, #0a4aab 0%, #1a6fd4 100%)',
          border: '1px solid rgba(0, 100, 220, 0.4)',
          borderRadius: '8px',
          color: '#fff',
          padding: '0.55rem 1.5rem',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Go to Home
        </Link>
      </div>
    </Layout>
  );
}
