import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import NotFoundPage from './NotFoundPage';
import { Review, Class, getClassByID, getReviews } from '../services/api';

export default function ClassReviewPage() {
  const { classId } = useParams<{ classId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    async function loadClassInfo() {
      try {
        const response = await getClassByID(classId!);
        setClassInfo(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadClassInfo();
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    async function loadReviews() {
      let reviewsData: Review[] = [];
      try {
        reviewsData = await getReviews(classId!);
      } catch (error) {
        console.log(error);
      }
      setReviews(reviewsData);
    }

    loadReviews();
  }, [classId]);

  useEffect(() => {
    if (reviews.length > 0) {
      let total = 0;
      for (const review of reviews) {
        total += review.rating ?? 0;
      }
      const average = total / reviews.length;
      setAverage(average);
    }
  }, [reviews]);

  if (loading) return null;

  if (!classInfo) {
    return <NotFoundPage />;
  }

  const card: React.CSSProperties = {
    background: 'rgba(0, 20, 60, 0.45)',
    border: '1px solid rgba(0, 90, 200, 0.25)',
    borderRadius: '12px',
    padding: '1.75rem 2rem',
    backdropFilter: 'blur(8px)',
  };

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: '900px', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>

        <div style={card}>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {classId!.toUpperCase()} — {classInfo.className}
          </h2>
          <p style={{ color: 'var(--text-bright)', margin: '0 0 1rem', lineHeight: 1.7 }}>{classInfo.classDescription}</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Credits:</strong> {classInfo.credits}</span>
            <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--text-primary)' }}>Avg Rating:</strong> {reviews.length > 0 ? `${average.toFixed(1)} / 5` : 'No ratings yet'}</span>
          </div>
        </div>

        <div style={card}>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Reviews</h4>
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review, i) => (
                <div key={i} style={{ paddingBottom: '1rem', borderBottom: i < reviews.length - 1 ? '1px solid rgba(0, 90, 200, 0.15)' : 'none' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.35rem', alignItems: 'baseline' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{review.name}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{review.date}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Grade: {review.grade}</span>
                    <span style={{ color: '#f5c518', fontSize: '0.85rem' }}>{'★'.repeat(Math.floor(review.rating ?? 0))}{(review.rating ?? 0) % 1 ? '½' : ''} {review.rating ?? '—'}/5</span>
                  </div>
                  <p style={{ color: 'var(--text-bright)', margin: 0, lineHeight: 1.7 }}>{review.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No reviews posted yet.</p>
          )}
        </div>

      </div>
    </Layout>
  );
}
