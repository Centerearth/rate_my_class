import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getClasses, Class } from '../services/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    getClasses().then(setClasses).catch(() => setClasses([]));
  }, []);

  function goto() {
    const match = classes.find(c => c.classId === inputValue.toLowerCase().trim());
    if (match) {
      navigate(`/${match.classId}`);
    }
  }

  return (
    <Layout>
      <div id="index-main">
        <h1>Welcome!</h1>
        <p>Search for a class below</p>
        <form onSubmit={(e) => { e.preventDefault(); goto(); }}>
          <input
            className="form-control form-control-lg mb-3"
            list="class-options"
            placeholder="Search for a class..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <datalist id="class-options">
            {classes.map((c) => (
              <option key={c.classId} value={c.classId.toLocaleUpperCase()} />
            ))}
          </datalist>
          <button type="submit" className="btn btn-primary btn-block">
            GO
          </button>
        </form>
      </div>
    </Layout>
  );
}
