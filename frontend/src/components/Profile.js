// Profile.js

import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

function Profile() {
const [data, setData] = useState([]);
const [contract, setContract] = useState(null);
const [account, setAccount] = useState(null);
const [userProfile, setUserProfile] = useState(null);
const [error, setError] = useState(null);


useEffect(() => {
    fetch('/userProfile')
      .then((response) => response.json())
      .then((data) => setUserProfile(data))
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
      .then((data) => {
        if(data != undefined && data[0] != undefined && data[0].indexOf('Error') != -1)
          setError(data[0])
        else setData(data)
      })
  }, [account]);

useEffect(() => {
    const getContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const userProfileContract = new ethers.Contract(
            '0x9e2bfb435A4b76B8DfE731fA191fdF9cEDfA49cB',
            userProfile.abi,
            signer
        );
        setContract(userProfileContract);
    }
    
    if(userProfile)
        getContract();
}, [userProfile])

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
    const formData = new FormData(event.target);
    formData.append('address', account);

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    console.log(formData.get('nume'));

    const response = await contract.updateUser(account, formData.get('nume'), formData.get('email'));
  };

  return (
    <div>
      <h2>Profile</h2>
      <form onSubmit={handleSubmit}>
        {/* Your form fields go here */}
        <label>
          Email:
          <input type="email" name="email" defaultValue={data[3]}/>
        </label>
        <br />
        <label>
          Name:
          <input type="text" name="nume" defaultValue={data[2]}/>
        </label>
        <br />
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          {error}
        </p>
        <br />
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
}

export default Profile;
