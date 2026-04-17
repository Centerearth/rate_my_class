import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ClassSearch from '../components/ClassSearch';
import StarRating from '../components/StarRating';
import { postReview, addClass, getClasses, Class } from '../services/api';
import { useAuth } from '../context/AuthContext';

function AutoTextarea({ value, onChange, placeholder, required }: { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      style={{ ...inputStyle, resize: 'none', overflow: 'hidden', minHeight: '6rem' }}
      value={value}
      placeholder={placeholder}
      required={required}
      rows={1}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

const card: React.CSSProperties = {
  background: 'rgba(0, 20, 60, 0.45)',
  border: '1px solid rgba(0, 90, 200, 0.25)',
  borderRadius: '12px',
  padding: '1.75rem 2rem',
  backdropFilter: 'blur(8px)',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(0, 20, 60, 0.6)',
  border: '1px solid rgba(0, 90, 200, 0.35)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  padding: '0.5rem 0.75rem',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--text-bright)',
  marginBottom: '0.4rem',
  display: 'block',
};

export default function ReviewMakerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grade, setGrade] = useState('A');
  const [classNum, setClassNum] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(3);
  const [classes, setClasses] = useState<Class[]>([]);
  const [addReviewError, setAddReviewError] = useState('');

  useEffect(() => {
    getClasses().then((data) => {
      setClasses(data);
    }).catch(() => setClasses([]));
  }, []);

  const [classId, setClassId] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [addClassError, setClassAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  async function saveReview(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!classNum || !grade || !reviewContent || !user) return;
    const validClass = classes.find(c => c.classId === classNum.toLowerCase().trim());
    if (!validClass) {
      setAddReviewError(`"${classNum}" is not a recognized class ID.`);
      return;
    }
    setAddReviewError('');
    try {
      const date = new Date().toLocaleDateString();
      const email = user.email;
      const newReview = { name: user.name, grade, date, class: classNum, review: reviewContent, email, rating };
      await postReview(classNum, newReview);
      navigate(`/${classNum}`);
    } catch (err: unknown) {
      setAddReviewError(err instanceof Error ? err.message : 'Failed to save review');
    }
  }

  async function handleAddClass(e: { preventDefault(): void }) {
    e.preventDefault();
    setClassAddError('');
    setAddSuccess(false);
    try {
      await addClass({ classId: classId.toLowerCase(), className, classDescription, credits: Number(credits) });
      setAddSuccess(true);
      setClassId('');
      setClassName('');
      setClassDescription('');
      setCredits('');
      const updated = await getClasses();
      setClasses(updated);
    } catch (err: unknown) {
      setClassAddError(err instanceof Error ? err.message : 'Failed to add class');
    }
  }

  const btnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a4aab 0%, #1a6fd4 100%)',
    border: '1px solid rgba(0, 100, 220, 0.4)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.55rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  };

  return (
    <Layout>
      <div className="two-col" style={{ maxWidth: '1000px', padding: '2rem 1.5rem', alignItems: 'flex-start', textAlign: 'left' }}>

        <div style={{ ...card, flex: 1 }}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Submit a Review</h4>
          <form onSubmit={saveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Class</label>
              <ClassSearch
                classes={classes}
                value={classNum}
                onChange={(v) => setClassNum(v.toLowerCase().trim())}
                inputStyle={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Grade</label>
              <select style={inputStyle} value={grade} onChange={(e) => setGrade(e.target.value)}>
                {['A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F'].map(g => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Review</label>
              <AutoTextarea value={reviewContent} onChange={setReviewContent} required />
            </div>
            <div>
              <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            {addReviewError && <div style={{ color: 'rgba(230,100,100,0.9)', fontSize: '0.9rem' }}>{addReviewError}</div>}
            <button type="submit" style={btnStyle}>Submit Review</button>
          </form>
        </div>

        {user && (
          <div style={{ ...card, flex: 1 }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Add a Class</h4>
            <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Class ID</label>
                <input style={inputStyle} value={classId} onChange={(e) => setClassId(e.target.value)} placeholder="e.g. cs260" required />
              </div>
              <div>
                <label style={labelStyle}>Class Name</label>
                <input style={inputStyle} value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. Web Programming" required />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <AutoTextarea value={classDescription} onChange={setClassDescription} placeholder="Brief description of the class" required />
              </div>
              <div>
                <label style={labelStyle}>Credits</label>
                <input style={inputStyle} type="number" value={credits} onChange={(e) => setCredits(e.target.value)} placeholder="e.g. 3" min={1} required />
              </div>
              {addClassError && <div style={{ color: 'rgba(230,100,100,0.9)', fontSize: '0.9rem' }}>{addClassError}</div>}
              {addSuccess && <div style={{ color: 'rgba(100,220,130,0.9)', fontSize: '0.9rem' }}>Class added successfully!</div>}
              <button type="submit" style={btnStyle}>Add Class</button>
            </form>
          </div>
        )}

      </div>
    </Layout>
  );
}
