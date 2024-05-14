// scripts/deployProxy.js
const { ethers, upgrades } = require('hardhat');

async function main() {
    const Funding = await ethers.getContractFactory('Funding');
    const funding = await upgrades.deployProxy(Funding, [], { initializer: 'initialize' });
    console.log('Funding deployed to:', funding.target);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });
