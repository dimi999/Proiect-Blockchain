import React, {useState, useEffect} from 'react';
import axios from 'axios';

function CreateProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [file, setFile] = useState(null);
  const [userAddress, setUserAddress] = useState(''); // Example user address (could be provided dynamically)
  const [data, setData] = useState([]);


  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    let ipfsUrl = '';

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    try {
      const response = await axios.post('/upload', formData, config);
      ipfsUrl = response.data; // Adjust based on the response structure
    } catch (error) {
      console.error('Error uploading image to IPFS:', error);
      return;
    }

     // Prepare campaign data to submit
     const campaignData = {
      title,
      description,
      goal,
      address: userAddress,
      ipfsUrl,
    };

    // Call the backend to create the campaign
    try {
      const response = await axios.post('/create-campaign', campaignData);
      console.log(response.data); // Success message
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <div>
      <h2>Create a New Project</h2>
      <form onSubmit={handleSubmit}>
        <label>Project Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <label>Funding Goal (ETH):</label>
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <label className="form-label" htmlFor="customFile">Upload Project Image:</label>
        <input type="file" className="form-control" id="customFile" onChange={handleFileChange} />
        <button type="submit">Create Project</button>
      </form>
      <div>{data}</div>
    </div>
  );
}

export default CreateProject;