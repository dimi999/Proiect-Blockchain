import React, {useState, useEffect} from 'react';
import axios from 'axios';

function CreateProject() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    axios.post('/upload', formData, config).then((response) => {
      console.log(response.data);
    });
  };

  return (
    <div>
      <h2>Create a New Project</h2>
      <form onSubmit={handleSubmit}>
        {/* Your form fields go here */}
        <label class="form-label" for="customFile">Default file input example</label>
        <input type="file" class="form-control" id="customFile" onChange={handleFileChange}/>
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
}

export default CreateProject;