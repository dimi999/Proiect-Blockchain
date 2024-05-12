const express = require('express');
const fileUpload = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');
const UserProfile = require('./artifacts/contracts/UserProfile.sol/UserProfile.json');
//const ipfsClient = require('ipfs-http-client');
const app = express();
app.use(fileUpload());
const port = 5000; // You can choose any port
require('dotenv').config();
const formidable = require('formidable');

const users_address = '0x5C78648C79795A19C83C5edFdc02757DB08deecE'; // change this to your deployed contract address
const funding_address = '0x3732fAf3c1a65fB858012297BAea953E465ED413'; // change this to your deployed contract address
const { apillonStorageAPI } = require('./apillon-api');
const bucketUUID = process.env.BUCKET_UUID;

async function get_user_contract() {
  const MyContract = await ethers.getContractFactory("UserProfile");
  const contract = MyContract.attach(
    users_address
  );
  return contract;
}

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
  const contract = await get_user_contract();
  const user = await contract.getUser(address);
  console.log(user);
  res.send(user);
});

app.get('/userProfile', async (req, res) => {
  res.send(UserProfile);
});

app.post('/updateUser', async (req, res) => {
  const contract = await get_user_contract();
  const formData = req.body;
  await contract.updateUser(formData.address, formData.nume, formData.email);
  res.send('');
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
    fileUuid = x.fileUuid;

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
    end_response = await apillonStorageAPI.post(`/buckets/${bucketUUID}/upload/${sessionUuid}/end`);
  } catch (err) {
    console.error("Error finalizing Apillon session:", err);
    return res.status(500).send("Error finalizing Apillon session.");
  }
  res.status(200).send(fileUuid);
});




app.post('/create-campaign', async (req, res) => {
  const { title, description, goal, address, fileUuid } = req.body;

  // Goal should be in wei, so convert it to a proper format
  const goalInWei = ethers.parseEther(goal);

  try {
    // Get the Funding contract instance
    const fundingContract = await get_funding_contract();
    
    // Interact with the smart contract to create a new campaign
    const tx = await fundingContract.createCampaign(
      title,
      description,
      goalInWei,
      fileUuid,
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


app.get('/campaigns', async (req, res) => {

  try {
    const fundingContract = await get_funding_contract();
    const campaignCount = await fundingContract.getCampaignCount();
    const count = Number(campaignCount.toString());

    let campaigns = [];
    for (let i = 0; i < count; i++) {
      const campaign = await fundingContract.getCampaignInfo(i);

      const goalEther = ethers.formatEther(campaign[3].toString());
      const raisedEther = ethers.formatEther(campaign[4].toString());

      const fileUuid = campaign[7];
      let ipfsUrl = '';
      const response = await apillonStorageAPI.get(`/buckets/${bucketUUID}/files/${fileUuid}`);
      if (response.data.data.link == null) {
        ipfsUrl = 'https://cdn.pixabay.com/photo/2024/04/25/06/50/banana-8719086_1280.jpg';
      }
      else {
        ipfsUrl = response.data.data.link;
      }

      campaigns.push({
        id: i,
        title: campaign[0],
        description: campaign[1],
        owner: campaign[2],
        goal: goalEther,
        raised: raisedEther,
        active: campaign[5],
        contributors: campaign[6].length, // Assuming campaign[6] is an array of addresses
        ipfsUrl: ipfsUrl,
      });
    }

    res.status(200).json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).send('Error fetching campaigns.');
  }
});

app.post('/contribute', async (req, res) => {
  const { amount, campaignId } = req.body;

  try {
    const fundingContract = await get_funding_contract();
    const tx = await fundingContract.contribute(campaignId, { value: ethers.parseEther(amount) });
    await tx.wait();

    res.status(200).send('Contribution successful!');
  } catch (error) {
    console.error('Error contributing to campaign:', error);
    res.status(500).send('Error contributing to campaign');
  }
});