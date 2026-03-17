// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title INestedPool
/// @notice Interface for recursive backpressure pools where a sink can be another pool.
///         Enables hierarchical economic structures: individual → team → marketplace.
///         Backpressure propagates through the hierarchy automatically.
interface INestedPool {
    // ──────────────────── Events ────────────────────

    event ChildRegistered(bytes32 indexed parentTaskTypeId, bytes32 indexed childTaskTypeId, address childPool);
    event ChildDeregistered(bytes32 indexed parentTaskTypeId, bytes32 indexed childTaskTypeId);
    event HierarchyRebalanced(bytes32 indexed rootTaskTypeId, uint256 depth, uint256 totalEffectiveCapacity);

    // ──────────────────── Child Pool Management ────────────────────

    /// @notice Register a child pool as a sink in a parent task type.
    ///         The child pool's aggregate throughput becomes its capacity in the parent.
    /// @param parentTaskTypeId The parent task type to join.
    /// @param childTaskTypeId The child's task type (used to read its total capacity).
    function registerChild(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external;

    /// @notice Deregister a child pool from a parent task type.
    /// @param parentTaskTypeId The parent task type to leave.
    /// @param childTaskTypeId The child's task type.
    function deregisterChild(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external;

    // ──────────────────── Hierarchical Rebalance ────────────────────

    /// @notice Rebalance a pool and all its children recursively up to maxDepth.
    ///         Bottom-up: rebalances leaf pools first, then propagates effective capacity upward.
    /// @param taskTypeId The root task type to rebalance from.
    /// @param maxDepth Maximum recursion depth (capped at MAX_DEPTH).
    function rebalanceHierarchy(bytes32 taskTypeId, uint256 maxDepth) external;

    // ──────────────────── Reads ────────────────────

    /// @notice Check whether a sink address is a registered child pool.
    /// @param parentTaskTypeId The parent task type.
    /// @param childTaskTypeId The child task type to check.
    /// @return isChild True if the child is registered under the parent.
    function isChildPool(bytes32 parentTaskTypeId, bytes32 childTaskTypeId) external view returns (bool isChild);

    /// @notice Get the effective capacity of a task type (accounting for child constraints).
    /// @param taskTypeId The task type to query.
    /// @return effectiveCapacity The effective capacity after hierarchy constraints.
    function getEffectiveCapacity(bytes32 taskTypeId) external view returns (uint256 effectiveCapacity);

    /// @notice Get all child task types registered under a parent.
    /// @param parentTaskTypeId The parent task type.
    /// @return children Array of child task type IDs.
    function getChildren(bytes32 parentTaskTypeId) external view returns (bytes32[] memory children);
}
