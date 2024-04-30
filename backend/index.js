const express = require('express');
const {ethers} = require('hardhat');
const app = express();
const port = 5000; // You can choose any port

const users_address = '0x74730B0b91e8A5506CEd401534bc45a80AFAcF94';

app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.get('/home', (req, res) => {
  res.send({'mydata': 'Hello from the Node.js backend!'});
});

app.get('/profile', async (req, res) => {
  const MyContract = await ethers.getContractFactory("UserProfile");
  const contract = MyContract.attach(
    users_address
  );
  await contract.createUser('dimi', 'dimi999');
  res.send({'balance': 150});
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});