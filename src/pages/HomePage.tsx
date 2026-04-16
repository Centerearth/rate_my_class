import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClasses, Class } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    getClasses().then(setClasses).catch(() => setClasses([]));
  }, []);

  function goto() {
    if (selectedClass) {
      navigate(`/${selectedClass}`);
    }
  }

  return (
    <Layout>
      <div id="index-main">
        <h1>Welcome!</h1>
        <p>Search for a class below</p>
        <select
          className="custom-select custom-select-lg mb-3"
          id="classSelection"
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Class List</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>{c.classId.toUpperCase()}</option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-block" onClick={goto}>
          GO
        </button>
      </div>
    </Layout>
  );
}
