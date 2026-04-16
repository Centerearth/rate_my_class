import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postReview, addClass, getClasses, Class } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewMakerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grade, setGrade] = useState('A');
  const [classNum, setClassNum] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [rating, setRating] = useState(3);
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    getClasses().then((data) => {
      setClasses(data);
      if (data.length > 0) setClassNum(data[0].classId);
    }).catch(() => setClasses([]));
  }, []);

  const [classId, setClassId] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  async function saveReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!classNum || !grade || !reviewContent || !user) return;
    setAddError('');
    try {
      const date = new Date().toLocaleDateString();
      const email = user.email;
      const newReview = { name: user.name, grade, date, class: classNum, review: reviewContent, email, rating: rating };
      await postReview(classNum, newReview);
      navigate(`/${classNum}`);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to save review');
    }
  }

  async function handleAddClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError('');
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
      setAddError(err instanceof Error ? err.message : 'Failed to add class');
    }
  }

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card">
            <div className="card-header">Submit a Review</div>
            <div className="card-body">
              <form id="reviewForm" onSubmit={saveReview}>
                <div className="mb-3">
                  <label className="form-label">Class</label>
                  <select className="form-control" value={classNum} onChange={(e) => setClassNum(e.target.value)}>
                    {classes.map((c) => (
                      <option key={c.classId} value={c.classId}>{c.classId.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select className="form-control" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option>A</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B</option>
                    <option>B-</option>
                    <option>C+</option>
                    <option>C</option>
                    <option>C-</option>
                    <option>D+</option>
                    <option>D</option>
                    <option>D-</option>
                    <option>F</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Review</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Rating: {rating} / 5</label>
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={5}
                    step={0.5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                </div>
                {addError && <div className="alert alert-danger">{addError}</div>}
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </form>
            </div>
          </div>
        </div>

        {user && (
          <div className="col">
            <hr style={{ visibility: 'hidden' }} />
            <div className="card">
              <div className="card-header">Add a Class</div>
              <div className="card-body">
                <form onSubmit={handleAddClass}>
                  <div className="mb-3">
                    <label className="form-label">Class ID</label>
                    <input
                      className="form-control"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                      placeholder="e.g. cs260"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Class Name</label>
                    <input
                      className="form-control"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g. Web Programming"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={classDescription}
                      onChange={(e) => setClassDescription(e.target.value)}
                      placeholder="Brief description of the class"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Credits</label>
                    <input
                      className="form-control"
                      type="number"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                      placeholder="e.g. 3"
                      min={1}
                      required
                    />
                  </div>
                  {addError && <div className="alert alert-danger">{addError}</div>}
                  {addSuccess && <div className="alert alert-success">Class added successfully!</div>}
                  <button type="submit" className="btn btn-primary">Add Class</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
