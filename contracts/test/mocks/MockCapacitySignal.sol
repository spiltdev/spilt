// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @dev Mock CapacitySignal for testing. Allows setting task type data and smoothed capacity.
///      Does not implement ICapacitySignal to avoid implementing all methods.
///      Just provides the exact function signatures used by our contracts.
contract MockCapacitySignal {
    struct TaskType {
        uint256 minStake;
        uint256 sinkCount;
        uint256 totalCapacity;
    }

    mapping(bytes32 => TaskType) internal _taskTypes;
    mapping(bytes32 => mapping(address => uint256)) internal _smoothed;
    mapping(bytes32 => address[]) internal _sinks;

    function setTaskType(bytes32 taskTypeId, uint256 minStake, uint256 sinkCount, uint256 totalCapacity) external {
        _taskTypes[taskTypeId] = TaskType(minStake, sinkCount, totalCapacity);
    }

    function setSmoothedCapacity(bytes32 taskTypeId, address sink, uint256 cap) external {
        _smoothed[taskTypeId][sink] = cap;
    }

    function addSink(bytes32 taskTypeId, address sink, uint256 cap) external {
        _sinks[taskTypeId].push(sink);
        _smoothed[taskTypeId][sink] = cap;
    }

    function registerTaskType(bytes32 taskTypeId, uint256 minStake) external {
        _taskTypes[taskTypeId] = TaskType(minStake, 0, 0);
    }

    function registerSink(bytes32 taskTypeId, uint256 initialCapacity) external {
        _sinks[taskTypeId].push(msg.sender);
        _smoothed[taskTypeId][msg.sender] = initialCapacity;
        _taskTypes[taskTypeId].sinkCount++;
    }

    function deregisterSink(bytes32) external pure {}
    function commitCapacity(bytes32, bytes32) external pure {}
    function revealCapacity(bytes32, uint256, bytes32) external pure {}

    function getTaskType(bytes32 taskTypeId)
        external
        view
        returns (uint256 minStake, uint256 sinkCount, uint256 totalCapacity)
    {
        TaskType storage t = _taskTypes[taskTypeId];
        return (t.minStake, t.sinkCount, t.totalCapacity);
    }

    function getSmoothedCapacity(bytes32 taskTypeId, address sink) external view returns (uint256) {
        return _smoothed[taskTypeId][sink];
    }

    function getSinks(bytes32 taskTypeId) external view returns (address[] memory, uint256[] memory) {
        address[] memory sinks = _sinks[taskTypeId];
        uint256[] memory caps = new uint256[](sinks.length);
        for (uint256 i; i < sinks.length; ++i) {
            caps[i] = _smoothed[taskTypeId][sinks[i]];
        }
        return (sinks, caps);
    }
}
