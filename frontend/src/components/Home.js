import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [funding, setFunding] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/campaigns');
        setCampaigns(response.data);
        console.log('Campaigns:', response.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    console.log(account);
      fetch('/profile', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          "address" : account,
        }), 
      })
        .then((response) => response.json())
        .then((data) => setData(data))
    }, [account]);

  useEffect(() => {
      const getContract = async () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const fundingContract = new ethers.Contract(
              '0x3732fAf3c1a65fB858012297BAea953E465ED413',
              funding.abi,
              signer
          );
          setContract(fundingContract);
      }
      
      if (funding) {
          getContract();
      }
  }
  , [funding])

  useEffect(() => {
      const init = async () => {
          if (window.ethereum) {
              try {
                  await window.ethereum.request({ method: 'eth_requestAccounts' });

                  const provider = new ethers.providers.Web3Provider(window.ethereum);
                  const signer = provider.getSigner();
                  const currentAccount = await signer.getAddress();
                  setAccount(currentAccount);
                } catch (error) {
                  console.error(error);
              }
          } else {
              console.error("MetaMask extension not detected. Please install MetaMask.");
          }
      }
      
      if(contract) {
          init();
      }
          
    }, [contract]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Correctly extract values using the form elements directly
    const form = event.target;
    const amount = form.amount.value;
    const campaignId = form.id.value; // Ensure this is accessing the correct hidden input for campaignId
    
    try {
      const response = await axios.post('/contribute', {
        amount,
        campaignId,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error contributing to campaign:', error);
    }
  };

  const handleToggleActive = async (campaignId) => {
    try {
      const response = await axios.post('/toggle-campaign', { campaignId });
      console.log('Toggle success:', response.data.message);
      // Fetch the updated list of campaigns
      const updatedCampaigns = await axios.get('/campaigns');
      setCampaigns(updatedCampaigns.data);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
    }
  };
  console.log("Current account: " + account);
  for (let x of campaigns) {
    console.log("Owner: " + x.owner);
    console.log("Goal: " + x.goal);
  }



  return (
    <div>
      <h1>Welcome to the Crowdfunding App</h1>
      <p>This is the home page of our crowdfunding app.</p>
      <h2>Active Campaigns</h2>
      <div>
        {campaigns.map((campaign, index) => (
          <div key={index} className="card">
            <img src={campaign.ipfsUrl} style={{ width: '100px' }} alt="Campaign" />
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p><strong>Owner:</strong> {campaign.owner}</p>
            <p><strong>Goal:</strong> {campaign.goal} ETH</p>
            <p><strong>Raised:</strong> {campaign.raised} ETH</p>
            <p><strong>Active:</strong> {campaign.active ? 'Yes' : 'No'}</p>
            {account === campaign.owner &&
                <button onClick={() => handleToggleActive(campaign.id)}>Toggle Active</button>
            }
            <form onSubmit={handleSubmit}>
              <input type="decimal" name="amount" placeholder="Amount in ETH" />
              <input type="hidden" name="id" value={campaign.id} />  
              <button type="submit">Contribute</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
