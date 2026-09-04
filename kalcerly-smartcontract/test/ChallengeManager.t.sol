// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FITToken.sol";
import "../src/ActivityProof.sol";
import "../src/ChallengeManager.sol";

contract ChallengeManagerTest is Test {
    FITToken token;
    ActivityProof ap;
    ChallengeManager cm;

    address admin = address(1);
    address verifier = address(2);
    address rewarder = address(3);
    address user = address(4);
    address user2 = address(5);

    uint256 startTime;
    uint256 endTime;

    function setUp() public {
        token = new FITToken(admin);
        ap = new ActivityProof(admin);
        cm = new ChallengeManager(admin, address(token), address(ap));

        vm.startPrank(admin);
        ap.grantRole(ap.VERIFIER_ROLE(), verifier);
        token.grantRole(token.MINTER_ROLE(), address(cm));
        cm.grantRole(cm.REWARDER_ROLE(), rewarder);
        vm.stopPrank();

        startTime = block.timestamp;
        endTime = block.timestamp + 30 days;
    }

    function _createChallenge() internal returns (uint256) {
        vm.prank(admin);
        cm.createChallenge("Run 50KM", ActivityType.RUNNING, 50_000, 30 days, 100 ether, startTime, endTime);
        return cm.challengeCount();
    }

    function _createProof(address u, bytes32 h, ActivityType t, uint256 dist) internal {
        vm.prank(verifier);
        ap.createProof(u, h, t, dist, 1800);
    }

    function test_CreateChallenge() public {
        uint256 id = _createChallenge();
        assertEq(id, 1);
        (uint256 cid, string memory name,,,,,,,bool active) = cm.challenges(1);
        assertEq(cid, 1);
        assertEq(name, "Run 50KM");
        assertTrue(active);
    }

    function test_UnauthorizedCreationReverts() public {
        vm.prank(user);
        vm.expectRevert();
        cm.createChallenge("Test", ActivityType.RUNNING, 50_000, 30 days, 100 ether, startTime, endTime);
    }

    function test_JoinChallenge() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);
        (,bool joined,,) = cm.userChallenges(id, user);
        assertTrue(joined);
    }

    function test_CannotJoinTwice() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);
        vm.prank(user);
        vm.expectRevert(AlreadyJoined.selector);
        cm.joinChallenge(id);
    }

    function test_InvalidChallengeJoinReverts() public {
        vm.prank(user);
        vm.expectRevert(ChallengeNotFound.selector);
        cm.joinChallenge(999);
    }

    function test_RecordVerifiedActivity() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("activity1");
        _createProof(user, h, ActivityType.RUNNING, 10_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        (uint256 progress,,,) = cm.userChallenges(id, user);
        assertEq(progress, 10_000);
    }

    function test_IncorrectActivityTypeRejected() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("walkact");
        _createProof(user, h, ActivityType.WALKING, 10_000);

        vm.prank(rewarder);
        vm.expectRevert(ActivityTypeMismatch.selector);
        cm.recordActivityProgress(id, user, h);
    }

    function test_ProgressCalculation() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h1 = keccak256("r1");
        bytes32 h2 = keccak256("r2");
        _createProof(user, h1, ActivityType.RUNNING, 20_000);
        _createProof(user, h2, ActivityType.RUNNING, 15_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h1);
        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h2);

        (uint256 progress,,,) = cm.userChallenges(id, user);
        assertEq(progress, 35_000);
    }

    function test_ChallengeCompletion() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("bigrun");
        _createProof(user, h, ActivityType.RUNNING, 50_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        (,, bool completed,) = cm.userChallenges(id, user);
        assertTrue(completed);
    }

    function test_ChallengeReward() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("fullrun");
        _createProof(user, h, ActivityType.RUNNING, 50_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        vm.prank(user);
        cm.claimChallengeReward(id);

        assertEq(token.balanceOf(user), 100 ether);
    }

    function test_DuplicateChallengeRewardRejected() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("dup");
        _createProof(user, h, ActivityType.RUNNING, 50_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        vm.prank(user);
        cm.claimChallengeReward(id);

        vm.prank(user);
        vm.expectRevert(ChallengeRewardAlreadyClaimed.selector);
        cm.claimChallengeReward(id);
    }

    function test_ActivityAlreadyUsedForChallenge() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("reuse");
        _createProof(user, h, ActivityType.RUNNING, 10_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        vm.prank(rewarder);
        vm.expectRevert(ActivityAlreadyUsedForChallenge.selector);
        cm.recordActivityProgress(id, user, h);
    }

    function test_ChallengeCreatedEvent() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit ChallengeManager.ChallengeCreated(1, "Run 50KM");
        cm.createChallenge("Run 50KM", ActivityType.RUNNING, 50_000, 30 days, 100 ether, startTime, endTime);
    }

    function test_ChallengeJoinedEvent() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        vm.expectEmit(true, true, false, false);
        emit ChallengeManager.ChallengeJoined(id, user);
        cm.joinChallenge(id);
    }

    function test_ChallengeProgressUpdatedEvent() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("ev");
        _createProof(user, h, ActivityType.RUNNING, 10_000);

        vm.prank(rewarder);
        vm.expectEmit(true, true, false, true);
        emit ChallengeManager.ChallengeProgressUpdated(id, user, 10_000);
        cm.recordActivityProgress(id, user, h);
    }

    function test_ChallengeCompletedEvent() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("compl");
        _createProof(user, h, ActivityType.RUNNING, 50_000);

        vm.prank(rewarder);
        vm.expectEmit(true, true, false, false);
        emit ChallengeManager.ChallengeCompleted(id, user);
        cm.recordActivityProgress(id, user, h);
    }

    function test_ChallengeRewardedEvent() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("rewev");
        _createProof(user, h, ActivityType.RUNNING, 50_000);

        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h);

        vm.prank(user);
        vm.expectEmit(true, true, false, true);
        emit ChallengeManager.ChallengeRewarded(id, user, 100 ether);
        cm.claimChallengeReward(id);
    }

    function test_NotJoinedCannotRecordProgress() public {
        uint256 id = _createChallenge();
        bytes32 h = keccak256("nojoin");
        _createProof(user, h, ActivityType.RUNNING, 10_000);

        vm.prank(rewarder);
        vm.expectRevert(NotJoined.selector);
        cm.recordActivityProgress(id, user, h);
    }

    function test_NotCompletedCannotClaimReward() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        vm.prank(user);
        vm.expectRevert(ChallengeNotCompleted.selector);
        cm.claimChallengeReward(id);
    }

    function test_CreateChallengeEmptyNameReverts() public {
        vm.prank(admin);
        vm.expectRevert(InvalidName.selector);
        cm.createChallenge("", ActivityType.RUNNING, 50_000, 30 days, 100 ether, startTime, endTime);
    }

    function test_CreateChallengeZeroTargetReverts() public {
        vm.prank(admin);
        vm.expectRevert(InvalidTarget.selector);
        cm.createChallenge("Test", ActivityType.RUNNING, 0, 30 days, 100 ether, startTime, endTime);
    }

    function test_CreateChallengeZeroRewardReverts() public {
        vm.prank(admin);
        vm.expectRevert(InvalidReward.selector);
        cm.createChallenge("Test", ActivityType.RUNNING, 50_000, 30 days, 0, startTime, endTime);
    }

    function test_CreateChallengeZeroStartTimeReverts() public {
        vm.prank(admin);
        vm.expectRevert(InvalidStartTime.selector);
        cm.createChallenge("Test", ActivityType.RUNNING, 50_000, 30 days, 100 ether, 0, endTime);
    }

    function test_CreateChallengeEndBeforeStartReverts() public {
        vm.prank(admin);
        vm.expectRevert(InvalidEndTime.selector);
        cm.createChallenge("Test", ActivityType.RUNNING, 50_000, 30 days, 100 ether, startTime, startTime);
    }

    function test_JoinExpiredChallengeReverts() public {
        uint256 id = _createChallenge();
        vm.warp(endTime + 1);
        vm.prank(user);
        vm.expectRevert(ChallengeExpired.selector);
        cm.joinChallenge(id);
    }

    function test_JoinInactiveChallengeReverts() public {
        uint256 id = _createChallenge();

        bytes32 challengeBaseSlot = keccak256(abi.encode(id, uint256(2)));
        bytes32 activeSlot = bytes32(uint256(challengeBaseSlot) + 8);
        vm.store(address(cm), activeSlot, bytes32(0));

        vm.prank(user);
        vm.expectRevert(ChallengeNotActive.selector);
        cm.joinChallenge(id);
    }

    function test_RecordProgressOnInactiveChallengeReverts() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h = keccak256("inact");
        _createProof(user, h, ActivityType.RUNNING, 10_000);

        bytes32 challengeBaseSlot = keccak256(abi.encode(id, uint256(2)));
        bytes32 activeSlot = bytes32(uint256(challengeBaseSlot) + 8);
        vm.store(address(cm), activeSlot, bytes32(0));

        vm.prank(rewarder);
        vm.expectRevert(ChallengeNotActive.selector);
        cm.recordActivityProgress(id, user, h);
    }

    function test_RecordProgressAlreadyCompleted() public {
        uint256 id = _createChallenge();
        vm.prank(user);
        cm.joinChallenge(id);

        bytes32 h1 = keccak256("full1");
        _createProof(user, h1, ActivityType.RUNNING, 50_000);
        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h1);

        (,, bool completed,) = cm.userChallenges(id, user);
        assertTrue(completed);

        bytes32 h2 = keccak256("full2");
        _createProof(user, h2, ActivityType.RUNNING, 10_000);
        vm.prank(rewarder);
        cm.recordActivityProgress(id, user, h2);

        (uint256 progress,,,) = cm.userChallenges(id, user);
        assertEq(progress, 50_000);
    }

    function test_ClaimRewardOnNonexistentChallengeReverts() public {
        vm.prank(user);
        vm.expectRevert(ChallengeNotFound.selector);
        cm.claimChallengeReward(999);
    }
}
