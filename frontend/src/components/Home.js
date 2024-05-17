import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [funding, setFunding] = useState(null);
  const [lastContribution, setLastContribution] = useState([]);

  useEffect(() => {
    fetch('/lastContribution')
      .then((response) => response.json())
      .then((data) => {
        if(data != [])
          setLastContribution(data);
        else 
          setLastContribution(['', '']);
      })
  }, []);

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
    fetch('/funding')
      .then((response) => response.json())
      .then((data) => setFunding(data))
  }, []);

  useEffect(() => {
      const getContract = async () => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const fundingContract = new ethers.Contract(
              '0x5Bc82216107ea117d700B9AC1D2790e9388B77C4',
              funding.abi,
              signer
          );
          setContract(fundingContract);
      }
      console.log("funding: " + funding);
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

                  console.log("provider: " + provider);
                  console.log("signer: " + signer);
                  console.log("currentAccount: " + currentAccount);

                  setAccount(currentAccount);
                } catch (error) {
                  console.error(error);
              }
          } else {
              console.error("MetaMask extension not detected. Please install MetaMask.");
          }
      }
      console.log("contract: " + contract);
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
        account
      });
      const tx = await contract.contribute(campaignId, { value: ethers.utils.parseEther(amount) });
      await tx.wait();
      console.log('Contribution successful!');
      console.log(response.data);
    } catch (error) {
      console.error('Error contributing to campaign:', error);
    } 
  };

  const handleToggleActive = async (campaignId) => {
    try {
      const tx = await contract.toggleCampaignActive(campaignId);
      console.log('Toggle success:', tx.data.message);
      // Fetch the updated list of campaigns
      const updatedCampaigns = await axios.get('/campaigns');
      setCampaigns(updatedCampaigns.data);
    } catch (error) {
      console.error('Error toggling campaign status:', error);
    }
  };
  // console.log("Current account: " + account);
  // for (let x of campaigns) {
  //   console.log("Owner: " + x.owner);
  //   console.log("Goal: " + x.goal);
  // }



  return (
    <div>
      <h1>Welcome to the Crowdfunding App</h1>
      <p>Last contribution made from <br/> 
        user: {lastContribution[0]}, <br/>
        value: {lastContribution[1]} wei</p>
      <p>This is the home page of our crowdfunding app.</p>
      <h2>Active Campaigns</h2>
      <div>
        {campaigns.map((campaign, index) => (
          <div key={index} className="card" style={{padding: '50px 10px'}}>
            <img src={campaign.ipfsUrl} style={{ width: '100px' }} alt="Campaign" />
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <h5>Status: {campaign.status}</h5>
            <p><strong>Owner:</strong> {campaign.owner}</p>
            <p><strong>Goal:</strong> {campaign.goal} ETH</p>
            <p><strong>Raised:</strong> {campaign.raised} ETH</p>
            <p><strong>Active:</strong> {campaign.active ? 'Yes' : 'No'}</p>
            {account === campaign.owner &&
                <button className="btn btn-primary"
                  onClick={() => handleToggleActive(campaign.id)}
                  style={{ width: '200px', padding: '10px 20px' }}
                >
                  Toggle Active
                </button>
            }
            
            {campaign.active &&
              <form onSubmit={handleSubmit}>
                <input className='form-control' style={{ width: '200px', margin: '10px 0px 0px 0px' }}
                type="decimal" name="amount" placeholder="Amount in ETH" />
                <input type="hidden" name="id" value={campaign.id} /> 
                <br /> 
                <button className='btn btn-success' type="submit">Contribute</button>
              </form>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
