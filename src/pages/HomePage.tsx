import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ClassSearch from '../components/ClassSearch';
import { getClasses, Class } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getClasses().then(setClasses).catch(() => setClasses([]));
  }, []);

  function goto() {
    const match = classes.find(c => c.classId === inputValue.toLowerCase().trim());
    if (match) {
      setNotFound(false);
      navigate(`/${match.classId}`);
    } else {
      setNotFound(true);
    }
  }

  return (
    <Layout>
      <div className="page-row">
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Welcome!</h1>
          <p style={{ color: 'var(--text-bright)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Search for a class below</p>
          <form onSubmit={(e) => { e.preventDefault(); goto(); }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ClassSearch
                classes={classes}
                value={inputValue}
                onChange={(v) => { setInputValue(v); setNotFound(false); }}
                inputStyle={{ background: 'rgba(0, 20, 60, 0.6)', border: '1px solid rgba(0, 90, 200, 0.35)', color: 'var(--text-primary)' }}
              />
              <button type="submit" style={{
                background: 'linear-gradient(135deg, #0a4aab 0%, #1a6fd4 100%)',
                border: '1px solid rgba(0, 100, 220, 0.4)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.55rem 1.5rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}>
                GO
              </button>
            </div>
            {notFound && (
              <p style={{ color: 'rgba(230, 110, 110, 0.9)', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                No class found for "{inputValue}". Try searching by class ID, e.g. <em>cs260</em>.
              </p>
            )}
          </form>
        </div>

        <div className="card-hover" style={{
          flex: '0 0 320px',
          background: 'rgba(0, 20, 60, 0.45)',
          border: '1px solid rgba(0, 90, 200, 0.25)',
          borderRadius: '12px',
          padding: '2rem',
          backdropFilter: 'blur(8px)',
        }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>About Rate My Class</h2>
          <p style={{ color: 'var(--text-bright)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Rate My Class lets BYU students share honest reviews of their courses.
          </p>
          <p style={{ color: 'var(--text-bright)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Browse ratings for workload, difficulty, and overall experience left by students who've already been through it.
          </p>
          <p style={{ color: 'var(--text-bright)', lineHeight: 1.7, margin: 0 }}>
            Have an opinion? <strong style={{ color: 'var(--text-primary)' }}>Post your own review</strong> and help the next student decide.
          </p>
        </div>
      </div>
    </Layout>
  );
}
