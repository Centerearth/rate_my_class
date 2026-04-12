import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import classDescriptionsJson from '../data/class-descriptions.json';
import NotFoundPage from './NotFoundPage';
import { Review, getReviews } from '../services/api';
import { useAuth } from '../context/AuthContext';

const classDescriptions = classDescriptionsJson as Record<string, string>;

export default function ClassReviewPage() {
  const { classNum } = useParams<{ classNum: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const description = classNum ? classDescriptions[classNum] : undefined;
  const { user } = useAuth();

  useEffect(() => {
    if (!classNum) return;

    async function loadReviews() {
      let reviewsData: Review[] = [];
      try {
        reviewsData = await getReviews(classNum!); 
        localStorage.setItem(`reviews-${classNum}`, JSON.stringify(reviewsData));
      } catch (error) {
        console.log(error);
        const reviewsText = localStorage.getItem(`reviews-${classNum}`);
        if (reviewsText) {
          reviewsData = JSON.parse(reviewsText);
        }
      }
      setReviews(reviewsData);
    }

    loadReviews();
  }, [classNum]);

  if (!description) {
    return <NotFoundPage />;
  }

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card" style={{ width: '20rem' }}>
            <div className="card-body">
              <h5 className="card-title text-center">{classNum!.toUpperCase()}</h5>
              <p className="card-text">{description}</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card" style={{ width: '50rem' }}>
            <div className="card-header">{classNum!.toUpperCase()}</div>
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
