import React from 'react';
import Layout from '../components/Layout';

export default function ReviewMakerPage() {
  const [socket, setSocket] = React.useState(null);
  const [messages, setMessages] = React.useState([]);

  React.useEffect(() => {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);

    ws.onopen = (event) => {
      displayMsg('system', 'Websocket', 'connected');
    };

    ws.onclose = (event) => {
      displayMsg('system', 'Websocket', 'disconnected');
    };

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      displayMsg('player', msg.from, ` has had a new review posted!`);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  function displayMsg(cls, from, msg) {
    setMessages((prevMessages) => [
      <div className="event" key={Date.now()}>
        <span className={`${cls}-event`}>{from}</span> {msg}
      </div>,
      ...prevMessages,
    ]);
  }

  function broadcastEvent(from, value) {
    const event = {
      from: from,
      value: value,
    };
    socket.send(JSON.stringify(event));
    displayMsg('player', from.toUpperCase(), ` has had a new review posted!`);
  }

  async function saveReview() {
    const userName = document.querySelector("#nameId")?.value;
    const letterGrade = document.querySelector('#gradeId')?.value;
    const classNum = document.querySelector('#classId')?.value;
    const reviewContent = document.querySelector('#reviewId')?.value;
    const date = new Date().toLocaleDateString();
    const newReview = { name: userName, grade: letterGrade, date: date, class:classNum, review:reviewContent};
    const response = await fetch(`/api/review/${classNum}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newReview),
    });
    const reviews = await response.json();
    localStorage.setItem('reviews', JSON.stringify(reviews));
    broadcastEvent(classNum, {});
    window.location.href = `/${classNum}`;
  }

  return (
    <Layout>
      <div className="col-lg-12 col-xl-11">
        <hr style={{ visibility: 'hidden' }} />
        <form id="reviewForm">
          <div className="form-group">
            <label htmlFor="nameId">First Name</label>
            <textarea className="form-control" id="nameId" rows="1"></textarea>
          </div>
          <hr />
          <div className="form-group">
            <label htmlFor="gradeId">Please Select Your Grade</label>
            <select className="form-control" id="gradeId">
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
            <select className="form-control" id="classId">
              <option value="cs260">CS 260</option>
              <option value="cs111">CS 111</option>
              <option value="cs180">CS 180</option>
              <option value="cs235">CS 235</option>
            </select>
          </div>
          <hr />
          <div className="form-group">
            <label htmlFor="reviewId">Leave Your Review Here</label>
            <textarea className="form-control" id="reviewId" rows="4"></textarea>
          </div>
          <hr />
          <button type="button" className="btn btn-primary btn-block mb-4" onClick={saveReview}>
            Submit
          </button>
        </form>
      </div>
      <div id="player-messages">{messages}</div>
    </Layout>
  );
}
