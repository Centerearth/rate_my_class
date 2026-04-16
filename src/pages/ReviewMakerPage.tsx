import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { postReview, addClass } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewMakerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grade, setGrade] = useState('A');
  const [classNum, setClassNum] = useState('cs260');
  const [reviewContent, setReviewContent] = useState('');

  const [classId, setClassId] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState(false);

  async function saveReview() {
    if (!user) return;
    const date = new Date().toLocaleDateString();
    const email = user.email;
    const newReview = { name: user.name, grade, date, class: classNum, review: reviewContent, email };
    const reviews = await postReview(classNum, newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    navigate(`/${classNum}`);
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
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to add class');
    }
  }

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <hr style={{ visibility: 'hidden' }} />
          <form id="reviewForm">
            <div className="form-group">
              <label htmlFor="gradeId">Please Select Your Grade</label>
              <select className="form-control" id="gradeId" value={grade} onChange={(e) => setGrade(e.target.value)}>
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
            <hr />
            <div className="form-group">
              <label htmlFor="classId">Please Select the Class</label>
              <select className="form-control" id="classId" value={classNum} onChange={(e) => setClassNum(e.target.value)}>
                <option value="cs260">CS 260</option>
                <option value="cs235">CS 235</option>
                <option value="cs111">CS 111</option>
                <option value="cs180">CS 180</option>
                <option value="math290">MATH 290</option>
                <option value="acc200">ACC 200</option>
                <option value="acc241">ACC 241</option>
                <option value="acc300">ACC 300</option>
                <option value="acc301">ACC 301</option>
                <option value="acc310">ACC 310</option>
                <option value="acc329">ACC 329</option>
                <option value="acc401">ACC 401</option>
                <option value="acc403">ACC 403</option>
                <option value="acc405">ACC 405</option>
                <option value="acc406">ACC 406</option>
              </select>
            </div>
            <hr />
            <div className="form-group">
              <label htmlFor="reviewId">Leave Your Review Here</label>
              <textarea
                className="form-control"
                id="reviewId"
                rows={4}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>
            <hr />
            <button type="button" className="btn btn-primary btn-block mb-4" onClick={saveReview}>
              Submit
            </button>
          </form>
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
