// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FITToken.sol";
import "../src/ActivityProof.sol";
import "../src/RewardManager.sol";

contract RewardManagerTest is Test {
    FITToken token;
    ActivityProof ap;
    RewardManager rm;

    address admin = address(1);
    address verifier = address(2);
    address rewarder = address(3);
    address user = address(4);

    function setUp() public {
        token = new FITToken(admin);
        ap = new ActivityProof(admin);
        rm = new RewardManager(admin, address(token), address(ap));

        vm.startPrank(admin);
        ap.grantRole(ap.VERIFIER_ROLE(), verifier);
        token.grantRole(token.MINTER_ROLE(), address(rm));
        rm.grantRole(rm.REWARDER_ROLE(), rewarder);
        vm.stopPrank();
    }

    function _createProof(address u, bytes32 h, ActivityType t, uint256 dist, uint256 dur) internal {
        vm.prank(verifier);
        ap.createProof(u, h, t, dist, dur);
    }

    function test_ValidActivityReceivesReward() public {
        bytes32 h = keccak256("run1");
        _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
        vm.prank(rewarder);
        rm.rewardActivity(h);
        assertEq(token.balanceOf(user), 10 ether);
    }

    function test_InvalidProofReverts() public {
        bytes32 h = keccak256("nonexistent");
        vm.prank(rewarder);
        vm.expectRevert(ProofNotFound.selector);
        rm.rewardActivity(h);
    }

    function test_DuplicateRewardReverts() public {
        bytes32 h = keccak256("run2");
        _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
        vm.prank(rewarder);
        rm.rewardActivity(h);
        vm.prank(rewarder);
        vm.expectRevert(RewardAlreadyClaimed.selector);
        rm.rewardActivity(h);
    }

    function test_UnauthorizedRewardCallReverts() public {
        bytes32 h = keccak256("run3");
        _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
        vm.prank(user);
        vm.expectRevert();
        rm.rewardActivity(h);
    }

    function test_DailyRewardLimit() public {
        for (uint256 i = 0; i < 10; i++) {
            bytes32 h = keccak256(abi.encodePacked("walk", i));
            _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
            vm.prank(rewarder);
            rm.rewardActivity(h);
        }
        bytes32 extra = keccak256("extra");
        _createProof(user, extra, ActivityType.RUNNING, 5000, 1800);
        vm.prank(rewarder);
        vm.expectRevert(DailyRewardLimitExceeded.selector);
        rm.rewardActivity(extra);
    }

    function test_CorrectRewardCalculationWalking() public {
        bytes32 h = keccak256("walk1");
        _createProof(user, h, ActivityType.WALKING, 3000, 1800);
        vm.prank(rewarder);
        rm.rewardActivity(h);
        assertEq(token.balanceOf(user), 3 ether);
    }

    function test_CorrectRewardCalculationCycling() public {
        bytes32 h = keccak256("cycle1");
        _createProof(user, h, ActivityType.CYCLING, 4000, 1800);
        vm.prank(rewarder);
        rm.rewardActivity(h);
        assertEq(token.balanceOf(user), 6 ether);
    }

    function test_FITTokenBalanceIncreases() public {
        bytes32 h = keccak256("runbal");
        _createProof(user, h, ActivityType.RUNNING, 10000, 3600);
        uint256 before = token.balanceOf(user);
        vm.prank(rewarder);
        rm.rewardActivity(h);
        assertGt(token.balanceOf(user), before);
    }

    function test_EventEmission() public {
        bytes32 h = keccak256("runevent");
        _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
        vm.prank(rewarder);
        vm.expectEmit(true, true, false, true);
        emit RewardManager.ActivityRewarded(h, user, 10 ether);
        rm.rewardActivity(h);
    }

    function test_CalculateReward() public {
        bytes32 h = keccak256("calc");
        _createProof(user, h, ActivityType.RUNNING, 5000, 1800);
        assertEq(rm.calculateReward(h), 10 ether);
    }

    function test_InvalidProofNotVerifiedReverts() public {
        bytes32 h = keccak256("unverified");
        vm.prank(verifier);
        ap.createProof(user, h, ActivityType.RUNNING, 5000, 1800);

        bytes32 proofBaseSlot = keccak256(abi.encode(h, uint256(2)));
        bytes32 verifiedSlot = bytes32(uint256(proofBaseSlot) + 6);
        vm.store(address(ap), verifiedSlot, bytes32(0));

        ActivityProof.Proof memory proof = ap.getProof(h);
        assertFalse(proof.verified);

        vm.prank(rewarder);
        vm.expectRevert(InvalidProof.selector);
        rm.rewardActivity(h);
    }
}
