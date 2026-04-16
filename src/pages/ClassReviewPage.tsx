import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import NotFoundPage from './NotFoundPage';
import { Review, getClassByID, getReviews } from '../services/api';

export default function ClassReviewPage() {
  const { classId } = useParams<{ classId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!classId) return;

    async function loadClassDescription() {
      try {
        const response = await getClassByID(classId!);
        setDescription(response.classDescription);
      } catch (error) {
        console.log(error);
      }
    }

    loadClassDescription();
  }, [classId]);

  useEffect(() => {
    if (!classId) return;

    async function loadReviews() {
      let reviewsData: Review[] = [];
      try {
        reviewsData = await getReviews(classId!); 
        localStorage.setItem(`reviews-${classId}`, JSON.stringify(reviewsData));
      } catch (error) {
        console.log(error);
        const reviewsText = localStorage.getItem(`reviews-${classId}`);
        if (reviewsText) {
          reviewsData = JSON.parse(reviewsText);
        }
      }
      setReviews(reviewsData);
    }

    loadReviews();
  }, [classId]);

  if (!description) {
    return <NotFoundPage />;
  }

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card" style={{ width: '20rem' }}>
            <div className="card-body">
              <h5 className="card-title text-center">{classId!.toUpperCase()}</h5>
              <p className="card-text">{description}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card" style={{ width: '50rem' }}>
            <div className="card-header">{classId!.toUpperCase()}</div>
            <div className="card-body">
              {/* Add overall rating here */}
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
