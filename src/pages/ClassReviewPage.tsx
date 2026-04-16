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

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card" style={{ width: '20rem' }}>
            <div className="card-body">
              <h5 className="card-title text-center">{classId!.toUpperCase()}</h5>
              <p className="card-text">{classInfo.classDescription}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card" style={{ width: '50rem' }}>
            <div className="card-header">{classId!.toUpperCase()}</div>
            <div className="card-body">
              <p><strong>Class Name:</strong> {classInfo.className}</p>
              <p><strong>Credits:</strong> {classInfo.credits}</p>
              <p><strong>Average Rating:</strong> {average.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid text-center">
        <table className="table table-striped-columns">
          <thead className="table-primary">
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody id="reviewTable">
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <tr key={i}>
                  <td>{review.name}</td>
                  <td>{review.grade}</td>
                  <td>{review.rating ?? '—'}</td>
                  <td>{review.date}</td>
                  <td>{review.review}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>{'No reviews posted yet.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
