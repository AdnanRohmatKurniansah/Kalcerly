// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ActivityProof.sol";

contract ActivityProofTest is Test {
    ActivityProof ap;
    address admin = address(1);
    address verifier = address(2);
    address user = address(3);

    bytes32 constant HASH = keccak256("activity1");

    function setUp() public {
        vm.startPrank(admin);
        ap = new ActivityProof(admin);
        ap.grantRole(ap.VERIFIER_ROLE(), verifier);
        vm.stopPrank();
    }

    function test_CreateValidProof() public {
        vm.prank(verifier);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
        assertTrue(ap.proofExists(HASH));
    }

    function test_UnauthorizedVerifierReverts() public {
        vm.prank(user);
        vm.expectRevert();
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
    }

    function test_DuplicateActivityHashReverts() public {
        vm.prank(verifier);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
        vm.prank(verifier);
        vm.expectRevert(ActivityAlreadyExists.selector);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
    }

    function test_ZeroAddressReverts() public {
        vm.prank(verifier);
        vm.expectRevert(ZeroAddress.selector);
        ap.createProof(address(0), HASH, ActivityType.RUNNING, 5000, 1800);
    }

    function test_InvalidDistanceReverts() public {
        vm.prank(verifier);
        vm.expectRevert(InvalidDistance.selector);
        ap.createProof(user, HASH, ActivityType.RUNNING, 0, 1800);
    }

    function test_InvalidDurationReverts() public {
        vm.prank(verifier);
        vm.expectRevert(InvalidDuration.selector);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 0);
    }

    function test_ProofExistence() public {
        assertFalse(ap.proofExists(HASH));
        vm.prank(verifier);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
        assertTrue(ap.proofExists(HASH));
    }

    function test_EventEmission() public {
        vm.prank(verifier);
        vm.expectEmit(true, true, false, true);
        emit ActivityProof.ActivityProofCreated(HASH, user, ActivityType.RUNNING, 5000, 1800, block.timestamp);
        ap.createProof(user, HASH, ActivityType.RUNNING, 5000, 1800);
    }

    function test_ProofData() public {
        vm.prank(verifier);
        ap.createProof(user, HASH, ActivityType.CYCLING, 10000, 3600);
        ActivityProof.Proof memory proof = ap.getProof(HASH);
        assertEq(proof.user, user);
        assertEq(proof.distance, 10000);
        assertEq(proof.duration, 3600);
        assertTrue(proof.verified);
        assertEq(uint8(proof.activityType), uint8(ActivityType.CYCLING));
    }
}
