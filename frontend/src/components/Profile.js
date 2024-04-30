// Profile.js

import React, {useEffect, useState} from 'react';

function Profile() {
const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/profile')
      .then((response) => response.json())
      .then((data) => setData(data))
  }, []);


  return (
    <div>
      <h2>Profile</h2>
      <p>Your Balance: {data.balance}</p>
    </div>
  );
}

export default Profile;
