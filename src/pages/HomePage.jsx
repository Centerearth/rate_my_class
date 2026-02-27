import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = React.useState('');

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
          <option value="cs260">CS 260</option>
          <option value="cs235">CS 235</option>
          <option value="cs111">CS 111</option>
          <option value="cs180">CS 180</option>
        </select>
        <button type="button" className="btn btn-primary btn-block" onClick={goto}>
          GO
        </button>
      </div>
    </Layout>
  );
}
