const express = require('express');
const fileUpload = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');
const UserProfile = require('./artifacts/contracts/UserProfile.sol/UserProfile.json');
//const ipfsClient = require('ipfs-http-client');
const app = express();
app.use(fileUpload());
const port = 5000; // You can choose any port

const users_address = '0x5C78648C79795A19C83C5edFdc02757DB08deecE';
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

app.post('/profile', async (req, res) => {
  const {address} = req.body;
  if (address == undefined) {
    res.send({name: '', email: ''});
    return;
  }
  const contract = await get_user_contract();
  const user = await contract.getUser(address);
  console.log(user);
  res.send(user);
});

app.get('/userProfile', async (req, res) => {
  res.send(UserProfile);
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