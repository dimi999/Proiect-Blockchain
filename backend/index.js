const express = require('express');
const fileUpload = require('express-fileupload');
const {ethers} = require('hardhat');
const axios = require('axios');
const UserProfile = require('./artifacts/contracts/UserProfile.sol/UserProfile.json');
const Funding = require('./artifacts/contracts/Funding.sol/Funding.json');

const app = express();
app.use(fileUpload());
const port = 5000; // You can choose any port
require('dotenv').config();

const { apillonStorageAPI } = require('./apillon-api');
const { user_contract } = require('./scripts/UserContract');
const { funding_contract } = require('./scripts/Funding');
const { reputation_contract } = require('./scripts/Reputation');

const bucketUUID = process.env.BUCKET_UUID;
BigInt.prototype.toJSON = function() { return this.toString() }
let lastContribution = []
funding_contract.addListener("ContributionMade", (_, address, value) => {
    console.log('ceva');
    lastContribution = [address, value];
});


app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the Node.js backend!');
});

app.get('/lastContribution', (req, res) => {
  res.send(lastContribution);
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
  
  const estimatedGas = await user_contract.getUser.estimateGas(address);
  const { gasPrice } = await (ethers.getDefaultProvider()).getFeeData();
  const ethPrice = ethers.formatEther(gasPrice * estimatedGas);

  if (ethPrice < 0.001) {
    const user = await user_contract.getUser(address);
    console.log("User: ", user);
    res.send(user);
  } else {
    res.send(['Error: Fetching data is too expensive', '', '', '']);
  }
});

app.get('/userProfile', async (req, res) => {
  res.send(UserProfile);
});

app.get('/funding', async (req, res) => {
  res.send(Funding);
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

app.get('/campaigns', async (req, res) => {

  try {
    const campaignCount = await funding_contract.getCampaignCount();
    const count = Number(campaignCount.toString());

    let campaigns = [];
    for (let i = 0; i < count; i++) {
      const campaign = await funding_contract.getCampaignInfo(i);

      const goalEther = ethers.formatEther(campaign[3].toString());
      const raisedEther = ethers.formatEther(campaign[4].toString());

      const status = await funding_contract.getState(goalEther, raisedEther);

      const fileUuid = campaign[8];
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
  const { amount, campaignId, account } = req.body;
  console.log(amount, campaignId, account);

  try {
    const tx = await funding_contract.contribute(campaignId, { value: ethers.parseEther(amount) });
    await tx.wait();

    const tx2 = await reputation_contract.mint(account, amount * 1e3);
    await tx2.wait();
    console.log(await reputation_contract.balanceOf(account));

    res.status(200).send('Contribution successful!');
  } catch (error) {
    console.error('Error contributing to campaign:', error);
    res.status(500).send('Error contributing to campaign');
  }
});

app.post('/toggle-campaign', async (req, res) => {
  const { campaignId } = req.body;
  try {
      const tx = await funding_contract.toggleCampaignActive(campaignId);
      await tx.wait();
      res.send({ success: true, message: 'Campaign status toggled successfully.' });
  } catch (error) {
      console.error('Error toggling campaign status:', error);
      res.status(500).send('Error toggling campaign status');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port number ${port}`);
});