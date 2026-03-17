// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import { NestedPool } from "../src/NestedPool.sol";
import { MockBackpressurePool } from "./mocks/MockBackpressurePool.sol";
import { MockCapacitySignal } from "./mocks/MockCapacitySignal.sol";

contract NestedPoolTest is Test {
    NestedPool public nested;
    MockBackpressurePool public mockBP;
    MockCapacitySignal public mockCS;

    address owner = address(0xA);

    bytes32 constant MARKETPLACE = keccak256("marketplace");
    bytes32 constant TEAM_A = keccak256("team-a");
    bytes32 constant TEAM_B = keccak256("team-b");
    bytes32 constant INDIVIDUAL = keccak256("individual");

    function setUp() public {
        mockBP = new MockBackpressurePool();
        mockCS = new MockCapacitySignal();

        nested = new NestedPool(address(mockBP), address(mockCS), owner);

        // Set up task types with capacity
        mockCS.setTaskType(MARKETPLACE, 100e18, 2, 500);
        mockCS.setTaskType(TEAM_A, 100e18, 3, 300);
        mockCS.setTaskType(TEAM_B, 100e18, 2, 200);
        mockCS.setTaskType(INDIVIDUAL, 100e18, 1, 100);

        // Create pools
        mockBP.createPool(MARKETPLACE);
        mockBP.createPool(TEAM_A);
        mockBP.createPool(TEAM_B);
        mockBP.createPool(INDIVIDUAL);
    }

    // ──────────────────── Child Registration ────────────────────

    function test_registerChild() public {
        nested.registerChild(MARKETPLACE, TEAM_A);
        assertTrue(nested.isChildPool(MARKETPLACE, TEAM_A));

        bytes32[] memory children = nested.getChildren(MARKETPLACE);
        assertEq(children.length, 1);
        assertEq(children[0], TEAM_A);
    }

    function test_registerChild_multiple() public {
        nested.registerChild(MARKETPLACE, TEAM_A);
        nested.registerChild(MARKETPLACE, TEAM_B);

        bytes32[] memory children = nested.getChildren(MARKETPLACE);
        assertEq(children.length, 2);
    }

    function test_registerChild_revert_selfReference() public {
        vm.expectRevert(NestedPool.SelfReference.selector);
        nested.registerChild(MARKETPLACE, MARKETPLACE);
    }

    function test_registerChild_revert_duplicate() public {
        nested.registerChild(MARKETPLACE, TEAM_A);
        vm.expectRevert(NestedPool.ChildAlreadyRegistered.selector);
        nested.registerChild(MARKETPLACE, TEAM_A);
    }

    // ──────────────────── Child Deregistration ────────────────────

    function test_deregisterChild() public {
        nested.registerChild(MARKETPLACE, TEAM_A);
        nested.registerChild(MARKETPLACE, TEAM_B);

        nested.deregisterChild(MARKETPLACE, TEAM_A);
        assertFalse(nested.isChildPool(MARKETPLACE, TEAM_A));
        assertTrue(nested.isChildPool(MARKETPLACE, TEAM_B));

        bytes32[] memory children = nested.getChildren(MARKETPLACE);
        assertEq(children.length, 1);
        assertEq(children[0], TEAM_B); // Team B swapped into Team A's position
    }

    function test_deregisterChild_revert_notRegistered() public {
        vm.expectRevert(NestedPool.ChildNotRegistered.selector);
        nested.deregisterChild(MARKETPLACE, TEAM_A);
    }

    // ──────────────────── Hierarchical Rebalance ────────────────────

    function test_rebalanceHierarchy_leafOnly() public {
        // No children — rebalance leaf node
        nested.rebalanceHierarchy(TEAM_A, 4);

        // Should have rebalanced Team A and cached its effective capacity
        assertEq(nested.getEffectiveCapacity(TEAM_A), 300);
        assertEq(mockBP.rebalanceCount(TEAM_A), 1);
    }

    function test_rebalanceHierarchy_twoLevel() public {
        // Marketplace → [Team A, Team B]
        nested.registerChild(MARKETPLACE, TEAM_A);
        nested.registerChild(MARKETPLACE, TEAM_B);

        nested.rebalanceHierarchy(MARKETPLACE, 4);

        // Children rebalanced first (bottom-up)
        assertEq(mockBP.rebalanceCount(TEAM_A), 1);
        assertEq(mockBP.rebalanceCount(TEAM_B), 1);
        assertEq(mockBP.rebalanceCount(MARKETPLACE), 1);

        // Effective = local(500) + childA(300) + childB(200) = 1000
        assertEq(nested.getEffectiveCapacity(MARKETPLACE), 1000);
    }

    function test_rebalanceHierarchy_threeLevel() public {
        // Marketplace → Team A → Individual
        nested.registerChild(MARKETPLACE, TEAM_A);
        nested.registerChild(TEAM_A, INDIVIDUAL);

        nested.rebalanceHierarchy(MARKETPLACE, 4);

        // Bottom-up: Individual(100), then Team A(300 + 100 = 400), then Marketplace(500 + 400 = 900)
        assertEq(nested.getEffectiveCapacity(INDIVIDUAL), 100);
        assertEq(nested.getEffectiveCapacity(TEAM_A), 400);
        assertEq(nested.getEffectiveCapacity(MARKETPLACE), 900);
    }

    function test_rebalanceHierarchy_depthLimit() public {
        // With depth 0, only rebalances the top level (treats as leaf)
        nested.registerChild(MARKETPLACE, TEAM_A);

        nested.rebalanceHierarchy(MARKETPLACE, 0);

        // At depth 0, Marketplace treated as leaf — uses local capacity only
        assertEq(nested.getEffectiveCapacity(MARKETPLACE), 500);
        // Team A should NOT have been rebalanced
        assertEq(mockBP.rebalanceCount(TEAM_A), 0);
    }
}
