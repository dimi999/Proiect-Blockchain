import React, { useState, useEffect } from 'react';

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/home')
      .then((response) => response.json())
      .then((data) => setData(data.mydata))
  }, []);

  return (
    <div>
      <h1>Welcome to Crowdfunding App</h1>
      <p>This is the home page of our crowdfunding app.</p>
      <p>{data}</p>
    </div>
  );
}

export default Home;