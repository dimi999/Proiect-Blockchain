const express = require('express');
const fileUpload = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');
const UserProfile = require('./artifacts/contracts/UserProfile.sol/UserProfile.json');
//const ipfsClient = require('ipfs-http-client');
const app = express();
app.use(fileUpload());
const port = 5000; // You can choose any port

const users_address = '0x74730B0b91e8A5506CEd401534bc45a80AFAcF94';
const { apillonStorageAPI } = require('./apillon-api');

async function get_user_contract() {
  const MyContract = await ethers.getContractFactory("UserProfile");
  const contract = MyContract.attach(
    users_address
  );
  return contract;
}
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.get('/home', (req, res) => {
  res.send({'mydata': 'Hello from the Node.js backend!'});
});

app.get('/profile', async (req, res) => {
  res.send({'balance': 150});
});

app.get('/userProfile', async (req, res) => {
  res.send(UserProfile);
});

app.post('/updateUser', async (req, res) => {
  const contract = get_user_contract();
  const formData = req.data;
});

app.post('/upload', async (req, res) => {
  if (!req.files) {
    return res.status(400).send('No file uploaded.');
  }

  const response = await apillonStorageAPI.post('/buckets/<session_id>/upload', 
  {
    files: [{
      fileName: 'file1' 
    }]
  });

  const responses = response.data.data.files;
  console.log(responses);
  
  for(let x of responses) {
    const uploadUrl = x.url;
    axios.put(uploadUrl, { data: req.files })
  }

  const response2 = await apillonStorageAPI.post(`/buckets/<session_id>/upload/${response.data.data.sessionUuid}/end`)

  res.send('File uploaded successfully.');
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});