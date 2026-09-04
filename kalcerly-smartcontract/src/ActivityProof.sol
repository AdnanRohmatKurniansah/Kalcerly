// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

error ZeroAddress();
error InvalidDistance();
error InvalidDuration();
error ActivityAlreadyExists();

enum ActivityType {
    WALKING,
    RUNNING,
    CYCLING
}

contract ActivityProof is AccessControl {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Proof {
        address user;
        bytes32 activityHash;
        ActivityType activityType;
        uint256 distance;
        uint256 duration;
        uint256 timestamp;
        bool verified;
    }

    mapping(bytes32 => bool) public proofExists;
    mapping(bytes32 => Proof) public proofs;

    event ActivityProofCreated(
        bytes32 indexed activityHash,
        address indexed user,
        ActivityType activityType,
        uint256 distance,
        uint256 duration,
        uint256 timestamp
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Records a verified activity proof on-chain.
    /// @param user Wallet address of the activity owner.
    /// @param activityHash Unique hash identifying the activity.
    /// @param activityType Type of activity performed.
    /// @param distance Distance in meters.
    /// @param duration Duration in seconds.
    function createProof(
        address user,
        bytes32 activityHash,
        ActivityType activityType,
        uint256 distance,
        uint256 duration
    ) external onlyRole(VERIFIER_ROLE) {
        if (user == address(0)) revert ZeroAddress();
        if (distance == 0) revert InvalidDistance();
        if (duration == 0) revert InvalidDuration();
        if (proofExists[activityHash]) revert ActivityAlreadyExists();

        proofExists[activityHash] = true;
        proofs[activityHash] = Proof({
            user: user,
            activityHash: activityHash,
            activityType: activityType,
            distance: distance,
            duration: duration,
            timestamp: block.timestamp,
            verified: true
        });

        emit ActivityProofCreated(activityHash, user, activityType, distance, duration, block.timestamp);
    }

    /// @notice Returns the full proof data for a given activity hash.
    /// @param activityHash The hash of the activity.
    function getProof(bytes32 activityHash) external view returns (Proof memory) {
        return proofs[activityHash];
    }
}
