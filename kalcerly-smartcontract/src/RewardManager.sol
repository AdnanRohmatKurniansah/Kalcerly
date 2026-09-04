// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FITToken.sol";
import "./ActivityProof.sol";

error ProofNotFound();
error RewardAlreadyClaimed();
error DailyRewardLimitExceeded();
error InvalidProof();

contract RewardManager is AccessControl, ReentrancyGuard {
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    uint256 public constant MAX_DAILY_REWARD = 100 ether;

    uint256 public constant WALKING_RATE = 1 ether;
    uint256 public constant RUNNING_RATE = 2 ether;
    uint256 public constant CYCLING_RATE = 1.5 ether;

    FITToken public immutable fitToken;
    ActivityProof public immutable activityProof;

    mapping(bytes32 => bool) public rewardClaimed;
    mapping(address => mapping(uint256 => uint256)) public dailyRewards;

    event ActivityRewarded(bytes32 indexed activityHash, address indexed user, uint256 amount);

    constructor(address admin, address fitTokenAddr, address activityProofAddr) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        fitToken = FITToken(fitTokenAddr);
        activityProof = ActivityProof(activityProofAddr);
    }

    /// @notice Calculates the FIT reward for a given activity proof.
    /// @param activityHash The hash of the verified activity.
    function calculateReward(bytes32 activityHash) public view returns (uint256) {
        ActivityProof.Proof memory proof = activityProof.getProof(activityHash);
        uint256 distanceKm = proof.distance / 1000;
        if (proof.activityType == ActivityType.WALKING) {
            return distanceKm * WALKING_RATE;
        } else if (proof.activityType == ActivityType.RUNNING) {
            return distanceKm * RUNNING_RATE;
        } else {
            return distanceKm * CYCLING_RATE;
        }
    }

    /// @notice Processes and distributes FIT reward for a verified activity.
    /// @param activityHash The hash of the verified activity.
    function rewardActivity(bytes32 activityHash) external onlyRole(REWARDER_ROLE) nonReentrant {
        if (!activityProof.proofExists(activityHash)) revert ProofNotFound();
        if (rewardClaimed[activityHash]) revert RewardAlreadyClaimed();

        ActivityProof.Proof memory proof = activityProof.getProof(activityHash);
        if (!proof.verified) revert InvalidProof();

        uint256 reward = calculateReward(activityHash);
        uint256 day = block.timestamp / 1 days;

        if (dailyRewards[proof.user][day] + reward > MAX_DAILY_REWARD) revert DailyRewardLimitExceeded();

        rewardClaimed[activityHash] = true;
        dailyRewards[proof.user][day] += reward;

        fitToken.mint(proof.user, reward);

        emit ActivityRewarded(activityHash, proof.user, reward);
    }
}
