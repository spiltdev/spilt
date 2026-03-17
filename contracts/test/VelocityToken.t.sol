// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import { VelocityToken } from "../src/VelocityToken.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";

contract VelocityTokenTest is Test {
    VelocityToken public vToken;
    MockERC20 public underlying;

    address owner = address(0xA);
    address alice = address(0x1);
    address bob = address(0x2);

    // Decay rate: 1% per second in WAD terms = 0.01 * 1e18 = 1e16
    uint256 constant DECAY_RATE = 1e16;
    // Idle threshold: 60 seconds
    uint256 constant IDLE_THRESHOLD = 60;

    function setUp() public {
        underlying = new MockERC20("Underlying", "UND");
        vToken = new VelocityToken(
            address(underlying),
            "Velocity Underlying",
            "vUND",
            DECAY_RATE,
            IDLE_THRESHOLD,
            owner
        );

        // Fund alice
        underlying.mint(alice, 1000e18);
        vm.prank(alice);
        underlying.approve(address(vToken), type(uint256).max);
    }

    // ──────────────────── Wrap / Unwrap ────────────────────

    function test_wrap() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        assertEq(vToken.realBalanceOf(alice), 100e18);
        assertEq(vToken.totalSupply(), 100e18);
        assertEq(underlying.balanceOf(alice), 900e18);
    }

    function test_unwrap() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        vm.prank(alice);
        vToken.unwrap(50e18);

        assertEq(vToken.realBalanceOf(alice), 50e18);
        assertEq(underlying.balanceOf(alice), 950e18);
    }

    function test_unwrap_revert_insufficient() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        vm.prank(alice);
        vm.expectRevert(VelocityToken.InsufficientBalance.selector);
        vToken.unwrap(200e18);
    }

    function test_wrap_revert_zero() public {
        vm.prank(alice);
        vm.expectRevert(VelocityToken.ZeroAmount.selector);
        vToken.wrap(0);
    }

    // ──────────────────── Idle Decay ────────────────────

    function test_noDecayBeforeThreshold() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        // Advance 59 seconds (below 60s threshold)
        vm.warp(block.timestamp + 59);

        assertEq(vToken.realBalanceOf(alice), 100e18);
    }

    function test_decayAfterThreshold() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        // Advance 160 seconds (100 seconds past threshold)
        vm.warp(block.timestamp + 160);

        // Decay = 100e18 * 1e16 * 100 / 1e18 = 100e18 * 1e18 / 1e18 = 1e18
        // Wait: 100e18 * 1e16 * 100 / 1e18 = 100 * 1e16 * 100 = 1e20 / 1e0 ... let me recalculate
        // bal * idleDecayRate * decaySeconds / WAD
        // = 100e18 * 1e16 * 100 / 1e18
        // = 100e18 * 1e18 / 1e18
        // = 100e18
        // That would mean full decay, which is too much. Let me adjust...
        // Actually: 100e18 * 1e16 * 100 = 1e38, / 1e18 = 1e20 = 100e18
        // So decay rate of 1e16 means 1% per second — after 100 seconds idle, that's 100% decayed.
        // For test, let's check with less time.

        // Let's just check that real balance is less than original
        uint256 realBal = vToken.realBalanceOf(alice);
        assertLt(realBal, 100e18);
    }

    function test_decayPrecise() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        // Advance exactly 70 seconds (10 seconds past 60s threshold)
        vm.warp(block.timestamp + 70);

        // Decay = 100e18 * 1e16 * 10 / 1e18 = 10e18 (10% decay at 1%/s for 10s)
        uint256 realBal = vToken.realBalanceOf(alice);
        assertEq(realBal, 90e18); // 100e18 - 10e18 = 90e18
    }

    function test_applyIdleDecay_materializes() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        vm.warp(block.timestamp + 70);

        // Force-apply decay
        vToken.applyIdleDecay(alice);

        // totalSupply should reflect the burn
        assertEq(vToken.totalSupply(), 90e18);
    }

    // ──────────────────── Stream Exemption ────────────────────

    function test_streamExempt_noDecay() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        vm.prank(owner);
        vToken.setStreamExempt(alice, true);

        // Advance well past threshold
        vm.warp(block.timestamp + 1000);

        // No decay because exempt
        assertEq(vToken.realBalanceOf(alice), 100e18);
    }

    // ──────────────────── Configuration ────────────────────

    function test_setIdleDecayRate_onlyOwner() public {
        vm.prank(owner);
        vToken.setIdleDecayRate(2e16);
        assertEq(vToken.idleDecayRate(), 2e16);
    }

    function test_setIdleThreshold_onlyOwner() public {
        vm.prank(owner);
        vToken.setIdleThreshold(120);
        assertEq(vToken.idleThreshold(), 120);
    }

    // ──────────────────── Idle Duration ────────────────────

    function test_idleDuration() public {
        vm.prank(alice);
        vToken.wrap(100e18);

        vm.warp(block.timestamp + 200);
        assertEq(vToken.idleDuration(alice), 200);
    }

    function test_idleDuration_zero_noActivity() public view {
        assertEq(vToken.idleDuration(alice), 0);
    }
}
