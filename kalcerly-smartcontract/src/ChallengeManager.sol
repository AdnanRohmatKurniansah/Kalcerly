// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FITToken.sol";
import "./ActivityProof.sol";

error ChallengeNotFound();
error ChallengeNotActive();
error ChallengeExpired();
error AlreadyJoined();
error NotJoined();
error ChallengeNotCompleted();
error ChallengeRewardAlreadyClaimed();
error ActivityTypeMismatch();
error ActivityAlreadyUsedForChallenge();
error InvalidName();
error InvalidTarget();
error InvalidReward();
error InvalidStartTime();
error InvalidEndTime();

contract ChallengeManager is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REWARDER_ROLE = keccak256("REWARDER_ROLE");

    struct Challenge {
        uint256 id;
        string name;
        ActivityType activityType;
        uint256 targetDistance;
        uint256 duration;
        uint256 reward;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }

    struct UserChallenge {
        uint256 progress;
        bool joined;
        bool completed;
        bool rewardClaimed;
    }

    uint256 public challengeCount;

    FITToken public immutable fitToken;
    ActivityProof public immutable activityProof;

    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(address => UserChallenge)) public userChallenges;
    mapping(uint256 => mapping(address => mapping(bytes32 => bool))) public activityUsedForChallenge;

    event ChallengeCreated(uint256 indexed challengeId, string name);
    event ChallengeJoined(uint256 indexed challengeId, address indexed user);
    event ChallengeProgressUpdated(uint256 indexed challengeId, address indexed user, uint256 progress);
    event ChallengeCompleted(uint256 indexed challengeId, address indexed user);
    event ChallengeRewarded(uint256 indexed challengeId, address indexed user, uint256 amount);

    constructor(address admin, address fitTokenAddr, address activityProofAddr) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        fitToken = FITToken(fitTokenAddr);
        activityProof = ActivityProof(activityProofAddr);
    }

    /// @notice Creates a new fitness challenge.
    function createChallenge(
        string calldata name,
        ActivityType activityType,
        uint256 targetDistance,
        uint256 duration,
        uint256 reward,
        uint256 startTime,
        uint256 endTime
    ) external onlyRole(ADMIN_ROLE) {
        if (bytes(name).length == 0) revert InvalidName();
        if (targetDistance == 0) revert InvalidTarget();
        if (reward == 0) revert InvalidReward();
        if (startTime == 0) revert InvalidStartTime();
        if (endTime <= startTime) revert InvalidEndTime();

        uint256 id = ++challengeCount;
        challenges[id] = Challenge({
            id: id,
            name: name,
            activityType: activityType,
            targetDistance: targetDistance,
            duration: duration,
            reward: reward,
            startTime: startTime,
            endTime: endTime,
            active: true
        });

        emit ChallengeCreated(id, name);
    }

    /// @notice Allows a user to join an active challenge.
    /// @param challengeId The ID of the challenge to join.
    function joinChallenge(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        if (c.id == 0) revert ChallengeNotFound();
        if (!c.active) revert ChallengeNotActive();
        if (c.endTime <= block.timestamp) revert ChallengeExpired();
        if (userChallenges[challengeId][msg.sender].joined) revert AlreadyJoined();

        userChallenges[challengeId][msg.sender].joined = true;

        emit ChallengeJoined(challengeId, msg.sender);
    }

    /// @notice Records a verified activity toward challenge progress.
    /// @param challengeId The ID of the challenge.
    /// @param user The user whose progress is being updated.
    /// @param activityHash The hash of the verified activity.
    function recordActivityProgress(
        uint256 challengeId,
        address user,
        bytes32 activityHash
    ) external onlyRole(REWARDER_ROLE) {
        Challenge storage c = challenges[challengeId];
        if (c.id == 0) revert ChallengeNotFound();
        if (!c.active) revert ChallengeNotActive();

        UserChallenge storage uc = userChallenges[challengeId][user];
        if (!uc.joined) revert NotJoined();
        if (uc.completed) return;

        if (!activityProof.proofExists(activityHash)) revert ActivityTypeMismatch();
        if (activityUsedForChallenge[challengeId][user][activityHash]) revert ActivityAlreadyUsedForChallenge();

        ActivityProof.Proof memory proof = activityProof.getProof(activityHash);
        if (proof.activityType != c.activityType) revert ActivityTypeMismatch();

        activityUsedForChallenge[challengeId][user][activityHash] = true;
        uc.progress += proof.distance;

        emit ChallengeProgressUpdated(challengeId, user, uc.progress);

        if (uc.progress >= c.targetDistance) {
            uc.completed = true;
            emit ChallengeCompleted(challengeId, user);
        }
    }

    /// @notice Claims the reward for completing a challenge.
    /// @param challengeId The ID of the completed challenge.
    function claimChallengeReward(uint256 challengeId) external nonReentrant {
        Challenge storage c = challenges[challengeId];
        if (c.id == 0) revert ChallengeNotFound();

        UserChallenge storage uc = userChallenges[challengeId][msg.sender];
        if (!uc.completed) revert ChallengeNotCompleted();
        if (uc.rewardClaimed) revert ChallengeRewardAlreadyClaimed();

        uc.rewardClaimed = true;
        fitToken.mint(msg.sender, c.reward);

        emit ChallengeRewarded(challengeId, msg.sender, c.reward);
    }
}
