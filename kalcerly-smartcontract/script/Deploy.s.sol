// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/FITToken.sol";
import "../src/ActivityProof.sol";
import "../src/RewardManager.sol";
import "../src/ChallengeManager.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        FITToken fitToken = new FITToken(deployer);
        ActivityProof activityProof = new ActivityProof(deployer);
        RewardManager rewardManager = new RewardManager(deployer, address(fitToken), address(activityProof));
        ChallengeManager challengeManager = new ChallengeManager(deployer, address(fitToken), address(activityProof));

        fitToken.grantRole(fitToken.MINTER_ROLE(), address(rewardManager));
        fitToken.grantRole(fitToken.MINTER_ROLE(), address(challengeManager));
        activityProof.grantRole(activityProof.VERIFIER_ROLE(), deployer);
        rewardManager.grantRole(rewardManager.REWARDER_ROLE(), deployer);
        challengeManager.grantRole(challengeManager.REWARDER_ROLE(), deployer);

        vm.stopBroadcast();

        console2.log("FITToken:", address(fitToken));
        console2.log("ActivityProof:", address(activityProof));
        console2.log("RewardManager:", address(rewardManager));
        console2.log("ChallengeManager:", address(challengeManager));
    }
}
