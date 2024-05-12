const express = require('express');
const fileUpload = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');

const app = express();
app.use(fileUpload());
const port = 5000; // You can choose any port
require('dotenv').config();


const funding_address = '0x126793D0c82554740F30655A1475deE0a63c0775';
const { apillonStorageAPI } = require('./apillon-api');
const { user_contract } = require('./scripts/UserContract');
const bucketUUID = process.env.BUCKET_UUID;

async function get_funding_contract() {
  const MyContract = await ethers.getContractFactory("Funding");
  const contract = MyContract.attach(
    funding_address
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
  const user = await user_contract.getUser(address);
  console.log(user);
  res.send(user);
});

app.get('/userProfile', async (req, res) => {
  res.send(UserProfile);
});

app.post('/upload', async (req, res) => {
  // Check if a file was uploaded via the `file` field
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Access the uploaded file via express-fileupload's `req.files`
  const uploadedFile = req.files.file;


  // Step 1: Initialize the Apillon file upload session
  const response = await apillonStorageAPI.post(`/buckets/${bucketUUID}/upload`, {
    files: [{ fileName: uploadedFile.name }],
  });

  const responses = response.data.data.files;
  const sessionUuid = response.data.data.sessionUuid;

  // Step 2: Upload each file to Apillon using the PUT method
  for (let x of responses) {
    const uploadUrl = x.url;

    try {
      // Upload directly using the file buffer with the correct content type
      await axios.put(uploadUrl, uploadedFile.data, {
        headers: {
          'Content-Type': uploadedFile.mimetype, // Use the MIME type of the uploaded file
        },
      });

    } catch (err) {
      console.error("Error uploading file to Apillon:", err);
      return res.status(500).send("Error uploading file to Apillon.");
    }
  }

  // Step 3: Finalize the upload session
  try {
    await apillonStorageAPI.post(`/buckets/${bucketUUID}/upload/${sessionUuid}/end`);
  } catch (err) {
    console.error("Error finalizing Apillon session:", err);
    return res.status(500).send("Error finalizing Apillon session.");
  }

  res.send('File uploaded successfully.');
});

app.post('/create-campaign', async (req, res) => {
  const { title, description, goal, address, ipfsUrl } = req.body;

  // Goal should be in wei, so convert it to a proper format
  const goalInWei = ethers.parseEther(goal);

  try {
    // Get the Funding contract instance
    const fundingContract = await get_funding_contract();
    
    // Interact with the smart contract to create a new campaign
    const tx = await fundingContract.createCampaign(
      title,
      `${description} (Image: ${ipfsUrl})`,
      goalInWei,
      { from: address }
    );

    // Wait for the transaction to be mined
    await tx.wait();

    res.status(200).send('Campaign successfully created!');
    console.log('Campaign successfully created!');
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).send('Error creating campaign');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});

// Add this new endpoint after your other API endpoints

app.get('/campaigns', async (req, res) => {
  try {
    const fundingContract = await get_funding_contract();
    const campaignCount = await fundingContract.campaigns.length;

    // Retrieve information for each campaign
    let campaigns = [];
    for (let i = 0; i < campaignCount; i++) {
      const campaign = await fundingContract.getCampaignInfo(i);
      campaigns.push({
        title: campaign[0],
        description: campaign[1],
        owner: campaign[2],
        goal: ethers.utils.formatEther(campaign[3]), // Convert to ETH
        raised: ethers.utils.formatEther(campaign[4]), // Convert to ETH
        active: campaign[5],
        contributors: campaign[6],
      });
    }

    res.status(200).json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).send('Error fetching campaigns.');
  }
});
