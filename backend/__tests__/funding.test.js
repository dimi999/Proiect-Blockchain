const { expect } = require("chai");
const { ethers } = require("hardhat");

// Import artifacts
const { funding_contract } = require('../scripts/Funding');
const { deepStrictEqual } = require("assert");

describe("FundingActions", () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    beforeAll(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        await wait(1000);
        //console.log(funding_contract);
    });

    it("should revert getting inexistent campaign", async () => {
        const campaignCount = await funding_contract.getCampaignCount();
        const invalidCampaignId = campaignCount + BigInt(1);
        await expect(funding_contract.getCampaign(invalidCampaignId)).to.be.revertedWith("Campaign does not exist.");
    });

    it("should create a new campaign", async () => { 
        const tx = await funding_contract.connect(addr3).createCampaign("test project", "Description", 100, "uuid");
        await tx.wait();
        const project = await funding_contract.getCampaign(0);
        expect(project[0]).to.eq("test project");
    }, 30000);

    it("Should revert contributions to a closed campaign", async function() {
        const campaignId = await funding_contract.getCampaignCount();
        const lastCampaignId = campaignId - BigInt(1);

        const campaign = await funding_contract.getCampaign(lastCampaignId);
        // Close the campaign
        const tx = await funding_contract.connect(addr3).closeCampaign(lastCampaignId);
        await tx.wait();

        // Attempt to contribute to the closed campaign
        await expect(funding_contract.connect(owner).contribute(lastCampaignId, { value: ethers.parseEther("0.02") }))
            .to.be.revertedWith("Campaign is closed");
    }, 20000);

});

describe("FundingEvents", () => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    beforeAll(async () => {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        await wait(1000);
        //console.log(funding_contract);
    });
    
    it("should emit event when creating a project", async() => {
        const tx = await funding_contract.connect(addr3).createCampaign("test project", "Other Description", 100, "uuid");
        const result = await tx.wait();
        const logs = result.logs;
        let count = 0;
        for (x of logs) {
            if(x.fragment.name == 'CampaignCreated')
                count += 1;
        }
        expect(count).to.eq(1);

    }, 60000);

    it("should emit event when contributing to a project", async() => {
        const tx = await funding_contract.contribute(0);
        const result = await tx.wait();
        const logs = result.logs;
        let count = 0;
        for (x of logs) {
            if(x.fragment.name == 'ContributionMade')
                count += 1;
        }
        expect(count).to.eq(1);

    }, 40000);

    

});