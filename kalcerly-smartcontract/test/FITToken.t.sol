// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/FITToken.sol";

contract FITTokenTest is Test {
    FITToken token;
    address admin = address(1);
    address minter = address(2);
    address user = address(3);

    function setUp() public {
        vm.startPrank(admin);
        token = new FITToken(admin);
        token.grantRole(token.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    function test_TokenName() public view {
        assertEq(token.name(), "FIT Token");
    }

    function test_TokenSymbol() public view {
        assertEq(token.symbol(), "FIT");
    }

    function test_InitialSupply() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_MintByAuthorized() public {
        vm.prank(minter);
        token.mint(user, 100 ether);
        assertEq(token.balanceOf(user), 100 ether);
    }

    function test_UnauthorizedMintReverts() public {
        vm.prank(user);
        vm.expectRevert();
        token.mint(user, 100 ether);
    }

    function test_MaxSupply() public view {
        assertEq(token.MAX_SUPPLY(), 1_000_000 ether);
    }

    function test_MintExceedingMaxSupplyReverts() public {
        vm.prank(minter);
        vm.expectRevert(ExceedsMaxSupply.selector);
        token.mint(user, 1_000_001 ether);
    }

    function test_MintUpToMaxSupply() public {
        vm.prank(minter);
        token.mint(user, 1_000_000 ether);
        assertEq(token.totalSupply(), 1_000_000 ether);
    }

    function test_MintBeyondMaxSupplyAfterPartial() public {
        vm.prank(minter);
        token.mint(user, 900_000 ether);
        vm.prank(minter);
        vm.expectRevert(ExceedsMaxSupply.selector);
        token.mint(user, 200_000 ether);
    }

    function test_Transfer() public {
        address receiver = address(4);
        vm.prank(minter);
        token.mint(user, 100 ether);
        vm.prank(user);
        bool success = token.transfer(receiver, 50 ether);
        assertTrue(success);
        assertEq(token.balanceOf(receiver), 50 ether);
        assertEq(token.balanceOf(user), 50 ether);
    }

    function test_TokensMintedEvent() public {
        vm.prank(minter);
        vm.expectEmit(true, false, false, true);
        emit FITToken.TokensMinted(user, 100 ether);
        token.mint(user, 100 ether);
    }
}
