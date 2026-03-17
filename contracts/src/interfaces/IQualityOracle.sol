// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IQualityOracle
/// @notice Interface for quality-weighted capacity verification.
///         Extends CompletionTracker with latency, error rate, and satisfaction scoring.
///         Quality feeds into routing weight: effectiveCapacity = smoothedCapacity × qualityScore.
interface IQualityOracle {
    // ──────────────────── Events ────────────────────

    event QualityUpdated(
        bytes32 indexed taskTypeId, address indexed sink, uint256 qualityScore, uint256 effectiveCapacity
    );
    event LatencyReported(bytes32 indexed taskTypeId, address indexed sink, uint256 latencyMs);
    event ErrorReported(bytes32 indexed taskTypeId, address indexed sink, bytes32 taskId);
    event SatisfactionReported(bytes32 indexed taskTypeId, address indexed sink, uint256 score);
    event QualitySlashed(bytes32 indexed taskTypeId, address indexed sink, uint256 amount, uint256 qualityScore);

    // ──────────────────── Structs ────────────────────

    struct QualityMetrics {
        uint256 completionRate; // BPS (0-10000)
        uint256 avgLatencyMs; // EWMA-smoothed average latency in ms
        uint256 errorRateBps; // Error rate in BPS (0-10000)
        uint256 satisfactionBps; // Consumer satisfaction in BPS (0-10000, default 10000)
        uint256 qualityScore; // Composite score in BPS (0-10000)
        uint256 lastUpdated; // Timestamp of last quality computation
    }

    // ──────────────────── Quality Reporting ────────────────────

    /// @notice Report task completion latency. Called by source after receiving result.
    /// @param taskTypeId The task type.
    /// @param sink The sink that completed the task.
    /// @param latencyMs Round-trip latency in milliseconds.
    function reportLatency(bytes32 taskTypeId, address sink, uint256 latencyMs) external;

    /// @notice Report a task error/failure. Called by source when sink produces bad output.
    /// @param taskTypeId The task type.
    /// @param sink The sink that failed.
    /// @param taskId The failed task identifier.
    function reportError(bytes32 taskTypeId, address sink, bytes32 taskId) external;

    /// @notice Report consumer satisfaction score for a completed task.
    /// @param taskTypeId The task type.
    /// @param sink The sink that completed the task.
    /// @param scoreBps Satisfaction score in BPS (0-10000).
    function reportSatisfaction(bytes32 taskTypeId, address sink, uint256 scoreBps) external;

    /// @notice Compute and update the composite quality score for a sink.
    ///         Triggers quality-based slashing if score is below threshold.
    /// @param taskTypeId The task type.
    /// @param sink The sink to evaluate.
    function computeQuality(bytes32 taskTypeId, address sink) external;

    // ──────────────────── Reads ────────────────────

    /// @notice Get the full quality metrics for a sink.
    /// @param taskTypeId The task type.
    /// @param sink The sink address.
    /// @return metrics The quality metrics struct.
    function getQualityMetrics(bytes32 taskTypeId, address sink)
        external
        view
        returns (QualityMetrics memory metrics);

    /// @notice Get the composite quality score (0-10000 BPS).
    /// @param taskTypeId The task type.
    /// @param sink The sink address.
    /// @return score The quality score.
    function getQualityScore(bytes32 taskTypeId, address sink) external view returns (uint256 score);

    /// @notice Get the quality-weighted effective capacity.
    ///         effectiveCapacity = smoothedCapacity × qualityScore / BPS
    /// @param taskTypeId The task type.
    /// @param sink The sink address.
    /// @return effectiveCapacity The quality-adjusted capacity.
    function getEffectiveCapacity(bytes32 taskTypeId, address sink)
        external
        view
        returns (uint256 effectiveCapacity);
}
