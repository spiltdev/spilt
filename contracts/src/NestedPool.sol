// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { INestedPool } from "./interfaces/INestedPool.sol";
import { IBackpressurePool } from "./interfaces/IBackpressurePool.sol";
import { ICapacitySignal } from "./interfaces/ICapacitySignal.sol";

/// @title NestedPool
/// @notice Recursive backpressure pools where a sink can be another pool.
///         Enables hierarchical economic structures (individual → team → marketplace).
///         Backpressure propagates bottom-up: leaf pool capacity constrains parent routing.
///
///         Example:
///           Marketplace pool
///             ├── Team A pool (3 individual sinks)
///             └── Team B pool (5 individual sinks)
///
///         When Team A's individuals are overloaded, Team A's effective capacity drops,
///         and the marketplace routes more payment to Team B automatically.
contract NestedPool is INestedPool, Ownable {
    // ──────────────────── Constants ────────────────────

    /// @notice Maximum recursion depth for hierarchical rebalance.
    uint256 public constant MAX_DEPTH = 8;

    // ──────────────────── Storage ────────────────────

    IBackpressurePool public immutable backpressurePool;
    ICapacitySignal public immutable capacityRegistry;

    /// @dev Parent task type → array of child task type IDs.
    mapping(bytes32 => bytes32[]) internal _children;

    /// @dev Parent task type → child task type → index+1 (0 = not present, for swap-and-pop).
    mapping(bytes32 => mapping(bytes32 => uint256)) internal _childIndex;

    /// @dev Task type → effective capacity (cached after last hierarchical rebalance).
    mapping(bytes32 => uint256) internal _effectiveCapacity;

    // ──────────────────── Errors ────────────────────

    error ChildAlreadyRegistered();
    error ChildNotRegistered();
    error DepthExceedsMax(uint256 requested, uint256 max);
    error SelfReference();
    error TaskTypeDoesNotExist();

    // ──────────────────── Constructor ────────────────────

    constructor(
        address backpressurePool_,
        address capacityRegistry_,
        address owner_
    ) Ownable(owner_) {
        backpressurePool = IBackpressurePool(backpressurePool_);
        capacityRegistry = ICapacitySignal(capacityRegistry_);
    }

    // ──────────────────── Child Pool Management ────────────────────

    /// @inheritdoc INestedPool
    function registerChild(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external {
        if (parentTaskTypeId == childTaskTypeId) revert SelfReference();
        if (_childIndex[parentTaskTypeId][childTaskTypeId] != 0) revert ChildAlreadyRegistered();

        // Verify both task types exist
        (uint256 parentMinStake,,) = capacityRegistry.getTaskType(parentTaskTypeId);
        (uint256 childMinStake,,) = capacityRegistry.getTaskType(childTaskTypeId);
        if (parentMinStake == 0 && childMinStake == 0) revert TaskTypeDoesNotExist();

        _children[parentTaskTypeId].push(childTaskTypeId);
        _childIndex[parentTaskTypeId][childTaskTypeId] = _children[parentTaskTypeId].length; // 1-indexed

        emit ChildRegistered(
            parentTaskTypeId,
            childTaskTypeId,
            backpressurePool.getPool(childTaskTypeId)
        );
    }

    /// @inheritdoc INestedPool
    function deregisterChild(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external {
        uint256 idx1 = _childIndex[parentTaskTypeId][childTaskTypeId];
        if (idx1 == 0) revert ChildNotRegistered();

        // Swap-and-pop
        uint256 idx = idx1 - 1;
        uint256 lastIdx = _children[parentTaskTypeId].length - 1;
        if (idx != lastIdx) {
            bytes32 lastChild = _children[parentTaskTypeId][lastIdx];
            _children[parentTaskTypeId][idx] = lastChild;
            _childIndex[parentTaskTypeId][lastChild] = idx + 1;
        }
        _children[parentTaskTypeId].pop();
        delete _childIndex[parentTaskTypeId][childTaskTypeId];

        emit ChildDeregistered(parentTaskTypeId, childTaskTypeId);
    }

    // ──────────────────── Hierarchical Rebalance ────────────────────

    /// @inheritdoc INestedPool
    function rebalanceHierarchy(bytes32 taskTypeId, uint256 maxDepth) external {
        uint256 depth = maxDepth > MAX_DEPTH ? MAX_DEPTH : maxDepth;

        // Bottom-up recursive rebalance
        uint256 effectiveCap = _rebalanceRecursive(taskTypeId, depth);

        emit HierarchyRebalanced(taskTypeId, depth, effectiveCap);
    }

    /// @dev Recursive rebalance. Rebalances child pools first (bottom-up), then parent.
    ///      Returns the effective capacity of this task type.
    function _rebalanceRecursive(bytes32 taskTypeId, uint256 remainingDepth) internal returns (uint256) {
        bytes32[] storage children = _children[taskTypeId];

        // If leaf (no children) or depth exhausted, use local capacity directly
        if (children.length == 0 || remainingDepth == 0) {
            (,, uint256 localCap) = capacityRegistry.getTaskType(taskTypeId);
            _effectiveCapacity[taskTypeId] = localCap;

            // Rebalance this pool's member units
            backpressurePool.rebalance(taskTypeId);

            return localCap;
        }

        // Rebalance children first (bottom-up)
        uint256 childCapSum;
        for (uint256 i; i < children.length; ++i) {
            childCapSum += _rebalanceRecursive(children[i], remainingDepth - 1);
        }

        // This pool's effective capacity = sum of child effective capacities + direct sinks
        (,, uint256 localCap) = capacityRegistry.getTaskType(taskTypeId);

        // Effective = local direct sinks capacity + child pool aggregate capacity
        // Children contribute their throughput as capacity in this parent pool
        uint256 effectiveCap = localCap + childCapSum;
        _effectiveCapacity[taskTypeId] = effectiveCap;

        // Rebalance this pool
        backpressurePool.rebalance(taskTypeId);

        return effectiveCap;
    }

    // ──────────────────── Reads ────────────────────

    /// @inheritdoc INestedPool
    function isChildPool(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external view returns (bool) {
        return _childIndex[parentTaskTypeId][childTaskTypeId] != 0;
    }

    /// @inheritdoc INestedPool
    function getEffectiveCapacity(bytes32 taskTypeId) external view returns (uint256) {
        return _effectiveCapacity[taskTypeId];
    }

    /// @inheritdoc INestedPool
    function getChildren(bytes32 parentTaskTypeId) external view returns (bytes32[] memory) {
        return _children[parentTaskTypeId];
    }
}
