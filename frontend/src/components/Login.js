import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function Login() {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [userProfile, setUserProfile] = useState(null);


    useEffect(() => {
        fetch('/userProfile')
          .then((response) => response.json())
          .then((data) => setUserProfile(data))
      }, []);

    useEffect(() => {
        const getContract = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userProfileContract = new ethers.Contract(
                '0x74730B0b91e8A5506CEd401534bc45a80AFAcF94',
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
    
    const createUser = async () => {
        // Call a function on the smart contract
          try {
            const result = await contract.createUser('cineva', 'altcineva');
            console.log('Result:', result);
          } catch (error) {
            console.error(error);
          }
    };

    return (
        <div>
            <h2>Login with MetaMask</h2>
            <p>Connected Account: {account}</p>
            <button onClick={createUser}>Create User</button>
        </div>
    );
}

export default Login;