const express = require('express');
const fileUploadd = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');
const UserProfile = require('./artifacts/contracts/UserProfile.sol/UserProfile.json');
//const ipfsClient = require('ipfs-http-client');
const app = express();
// app.use(fileUpload());
const port = 5000; // You can choose any port
require('dotenv').config();
const formidable = require('formidable');

const users_address = '0x5C78648C79795A19C83C5edFdc02757DB08deecE'; // change this to your deployed contract address
const funding_address = '0xEfC0C53471217D18828884116255e5A42861c95e'; // change this to your deployed contract address
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

// app.get('/campaigns', async (req, res) => {
//   try {
//     const fundingContract = await get_funding_contract();
//     const campaignCount = await fundingContract.getCampaignCount();
//     const count = Number(campaignCount.toString());  // Convert BigInt to Number

//     let campaigns = [];
//     for (let i = 0; i < count; i++) {
//       const campaign = await fundingContract.getCampaignInfo(i);

//       // Debugging each campaign data
//       console.log(`Campaign ${i}:`, campaign);

//       // Ensure all elements are defined
//       if(campaign[3] !== undefined && campaign[4] !== undefined) {
//         campaigns.push({
//           title: campaign[0],
//           description: campaign[1],
//           owner: campaign[2],
//           goal: ethers.utils.formatEther(campaign[3]),
//           raised: ethers.utils.formatEther(campaign[4]),
//           active: campaign[5],
//           contributors: campaign[6].length // Assuming campaign[6] is an array of addresses
//         });
//       }
//     }

//     res.status(200).json(campaigns);
//   } catch (err) {
//     console.error('Error fetching campaigns:', err);
//     res.status(500).send('Error fetching campaigns.');
//   }
// });

app.get('/campaigns', async (req, res) => {
  try {
    const fundingContract = await get_funding_contract();
    const campaignCount = await fundingContract.getCampaignCount();
    const count = Number(campaignCount.toString());  // Convert BigInt to Number

    let campaigns = [];
    for (let i = 0; i < count; i++) {
      const campaign = await fundingContract.getCampaignInfo(i);

      console.log(`Campaign ${i}:`, campaign);

      // Convert BigInt to a string to be compatible with formatEther
      const goalEther = ethers.formatEther(campaign[3].toString());
      const raisedEther = ethers.formatEther(campaign[4].toString());

      campaigns.push({
        title: campaign[0],
        description: campaign[1],
        owner: campaign[2],
        goal: goalEther,
        raised: raisedEther,
        active: campaign[5],
        contributors: campaign[6].length // Assuming campaign[6] is an array of addresses
      });
    }

    res.status(200).json(campaigns);
  } catch (err) {
    console.error('Error fetching campaigns:', err);
    res.status(500).send('Error fetching campaigns.');
  }
});