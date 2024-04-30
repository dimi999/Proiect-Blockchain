// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserProfile.sol";

contract Funding {
    UserProfile public userProfile;

    struct FundingCampaign {
        string title;
        string description;
        address owner;
        uint256 goal;
        uint256 raised;
        bool active;
        mapping(address => uint256) contributions;
        address[] contributors;
    }

    FundingCampaign[] public campaigns;

    event CampaignCreated(uint256 indexed campaignId, string title, string description, address owner, uint256 goal);
    event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignClosed(uint256 indexed campaignId);

    constructor(UserProfile _userProfile) {
        userProfile = _userProfile;
    }

    function createCampaign(
        string calldata title,
        string calldata description,
        uint256 goal
    ) external {
        require(userProfile.getUser(msg.sender).userAddress == msg.sender, "User profile does not exist");

        FundingCampaign storage campaign = campaigns.push();
        campaign.title = title;
        campaign.description = description;
        campaign.owner = msg.sender;
        campaign.goal = goal;
        campaign.raised = 0;
        campaign.active = true;

        emit CampaignCreated(campaigns.length - 1, title, description, msg.sender, goal);
    }

    function contribute(uint256 campaignId) external payable {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        FundingCampaign storage campaign = campaigns[campaignId];
        require(campaign.active, "Campaign is closed");

        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
        }

        campaign.contributions[msg.sender] += msg.value;
        campaign.raised += msg.value;

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
        address[] memory contributors
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
            campaign.contributors
        );
    }

    function getContribution(uint256 campaignId, address contributor) external view returns (uint256) {
        require(campaignId < campaigns.length, "Invalid campaign ID");
        FundingCampaign storage campaign = campaigns[campaignId];
        
        return campaign.contributions[contributor];
    }
}
