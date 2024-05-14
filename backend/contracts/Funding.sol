// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserProfile.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Funding is Initializable, OwnableUpgradeable {

    struct FundingCampaign {
        string title;
        string description;
        address owner;
        uint256 goal;
        uint256 raised;
        bool active;
        address[] contributors;
        uint256[] contributions;
        string ipfsUuid;
    }

    FundingCampaign[] public campaigns;

    event CampaignCreated(uint256 indexed campaignId, string title, string description, address owner, uint256 goal, string ipfsUuid);
    event ContributionMade(uint256 indexed campaignId, address contributor, uint256 amount);
    event CampaignClosed(uint256 indexed campaignId);

    event Debug(string message, uint256 value);

    function initialize() public initializer {
        __Ownable_init();
    }

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goal,
        string calldata ipfsUuid
    ) external {
        emit Debug("Creating campaign, current count", campaigns.length);
        uint256 idx = campaigns.length;
        campaigns.push();
        FundingCampaign storage campaign = campaigns[idx];
        campaign.title = title;
        campaign.description = description;
        campaign.owner = msg.sender;
        campaign.goal = goal;
        campaign.raised = 0;
        campaign.active = true;
        campaign.ipfsUuid = ipfsUuid;

        emit CampaignCreated(campaigns.length - 1, title, description, msg.sender, goal, ipfsUuid);
        emit Debug("Campaign created, new count", campaigns.length);
    }

    // Explicit getter for the campaigns array
    function getCampaign(uint index) public view returns (FundingCampaign memory) {
        require(index < campaigns.length, "Campaign does not exist.");
        return campaigns[index];
    }

    // Function to get total number of campaigns
    function getCampaignCount() public view returns (uint) {
        return campaigns.length;
    }


    function contribute(uint256 campaignId) external payable {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        FundingCampaign storage campaign = campaigns[campaignId];
        require(campaign.active, "Campaign is closed");


        campaign.contributions.push(msg.value);
        campaign.contributors.push(msg.sender);
        campaign.raised += msg.value;

        // send the funds to the campaign owner
        payable(campaign.owner).transfer(msg.value);

        emit ContributionMade(campaignId, msg.sender, msg.value);
    }

    function closeCampaign(uint256 campaignId) external {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        FundingCampaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.owner, "Only the owner can close the campaign");

        campaign.active = false;

        emit CampaignClosed(campaignId);
    }

    function getCampaignInfo(uint256 campaignId) external view returns (
        string memory title,
        string memory description,
        address owner,
        uint256 goal,
        uint256 raised,
        bool active,
        address[] memory contributors,
        uint256[] memory contributions,
        string memory ipfsUuid
    ) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        FundingCampaign storage campaign = campaigns[campaignId];

        return (
            campaign.title,
            campaign.description,
            campaign.owner,
            campaign.goal,
            campaign.raised,
            campaign.active,
            campaign.contributors,
            campaign.contributions,
            campaign.ipfsUuid
        );
    }

    function toggleCampaignActive(uint256 campaignId) external {
        FundingCampaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.owner, "Only the campaign owner can toggle the state");
        
        campaign.active = !campaign.active; // Toggle the active state

        emit CampaignStatusChanged(campaignId, campaign.active);
    }

    event CampaignStatusChanged(uint256 indexed campaignId, bool newStatus);

    // function getContribution(uint256 campaignId, address contributor) external view returns (uint256) {
    //     require(campaignId < campaigns.length, "Invalid campaign ID");
    //     FundingCampaign storage campaign = campaigns[campaignId];
        
    //     return campaign.contributions[contributor];
    // }
}
