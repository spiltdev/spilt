// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import { UrgencyToken } from "../src/UrgencyToken.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";

contract UrgencyTokenTest is Test {
    UrgencyToken public uToken;
    MockERC20 public underlying;

    address owner = address(0xA);
    address alice = address(0x1);
    address pool = address(0x2);

    function setUp() public {
        underlying = new MockERC20("Underlying", "UND");
        uToken = new UrgencyToken(address(underlying), owner);

        // Authorize pool as consumer
        vm.prank(owner);
        uToken.setAuthorizedConsumer(pool, true);

        // Fund alice
        underlying.mint(alice, 1000e18);
        vm.prank(alice);
        underlying.approve(address(uToken), type(uint256).max);
    }

    // ──────────────────── Minting ────────────────────

    function test_mint() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600); // 1 hour TTL

        assertEq(uToken.totalActive(), 100e18);
        assertEq(underlying.balanceOf(alice), 900e18);

        UrgencyToken.Deposit memory d = _getDeposit(id);
        assertEq(d.owner, alice);
        assertEq(d.amount, 100e18);
        assertEq(d.expiry, block.timestamp + 3600);
        assertFalse(d.consumed);
    }

    function test_mint_revert_zeroAmount() public {
        vm.prank(alice);
        vm.expectRevert(UrgencyToken.ZeroAmount.selector);
        uToken.mint(0, 3600);
    }

    function test_mint_revert_ttlTooLow() public {
        vm.prank(alice);
        vm.expectRevert(UrgencyToken.TTLOutOfRange.selector);
        uToken.mint(100e18, 30); // Below MIN_TTL of 60
    }

    function test_mint_revert_ttlTooHigh() public {
        vm.prank(alice);
        vm.expectRevert(UrgencyToken.TTLOutOfRange.selector);
        uToken.mint(100e18, 86_400 * 31); // Above MAX_TTL of 30 days
    }

    // ──────────────────── Consumption ────────────────────

    function test_consume() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600);

        address sink = address(0x3);
        vm.prank(pool);
        uToken.consume(id, sink);

        assertEq(underlying.balanceOf(sink), 100e18);
        assertEq(uToken.totalActive(), 0);

        UrgencyToken.Deposit memory d = _getDeposit(id);
        assertTrue(d.consumed);
    }

    function test_consume_revert_notAuthorized() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600);

        vm.prank(alice); // Not authorized consumer
        vm.expectRevert(UrgencyToken.NotAuthorizedConsumer.selector);
        uToken.consume(id, address(0x3));
    }

    function test_consume_revert_expired() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 60);

        // Advance past expiry
        vm.warp(block.timestamp + 61);

        vm.prank(pool);
        vm.expectRevert(UrgencyToken.DepositExpired.selector);
        uToken.consume(id, address(0x3));
    }

    function test_consume_revert_alreadyConsumed() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600);

        vm.prank(pool);
        uToken.consume(id, address(0x3));

        vm.prank(pool);
        vm.expectRevert(UrgencyToken.DepositAlreadyConsumed.selector);
        uToken.consume(id, address(0x3));
    }

    // ──────────────────── Burning ────────────────────

    function test_burn_afterExpiry() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 60);

        vm.warp(block.timestamp + 61);
        uToken.burn(id);

        assertEq(uToken.totalActive(), 0);
        assertEq(uToken.totalBurned(), 100e18);
        // Tokens sent to dead address
        assertEq(underlying.balanceOf(address(0xdead)), 100e18);
    }

    function test_burn_revert_notExpired() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600);

        vm.expectRevert(UrgencyToken.DepositNotExpired.selector);
        uToken.burn(id);
    }

    function test_batchBurn() public {
        vm.startPrank(alice);
        uint256 id0 = uToken.mint(50e18, 60);
        uint256 id1 = uToken.mint(50e18, 60);
        uint256 id2 = uToken.mint(50e18, 3600); // Long TTL, won't burn
        vm.stopPrank();

        vm.warp(block.timestamp + 61);

        uint256[] memory ids = new uint256[](3);
        ids[0] = id0;
        ids[1] = id1;
        ids[2] = id2;

        uint256 burned = uToken.batchBurn(ids);
        assertEq(burned, 2); // Only first two expired
        assertEq(uToken.totalBurned(), 100e18);
        assertEq(uToken.totalActive(), 50e18); // id2 still active
    }

    // ──────────────────── Reads ────────────────────

    function test_isExpired() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 60);

        assertFalse(uToken.isExpired(id));
        vm.warp(block.timestamp + 60);
        assertTrue(uToken.isExpired(id));
    }

    function test_remainingTTL() public {
        vm.prank(alice);
        uint256 id = uToken.mint(100e18, 3600);

        assertEq(uToken.remainingTTL(id), 3600);

        vm.warp(block.timestamp + 1000);
        assertEq(uToken.remainingTTL(id), 2600);

        vm.warp(block.timestamp + 3000);
        assertEq(uToken.remainingTTL(id), 0);
    }

    // ──────────────────── Helper ────────────────────

    function _getDeposit(uint256 id) internal view returns (UrgencyToken.Deposit memory) {
        return uToken.getDeposit(id);
    }
}
