// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IQualityOracle } from "./interfaces/IQualityOracle.sol";
import { ICapacitySignal } from "./interfaces/ICapacitySignal.sol";
import { IStakeManager } from "./interfaces/IStakeManager.sol";

/// @title QualityOracle
/// @notice Quality-weighted capacity verification. Extends the CompletionTracker concept with
///         latency, error rate, and satisfaction scoring. Composite quality score weights
///         effective capacity for routing: effectiveCapacity = smoothedCapacity × qualityScore / BPS.
contract QualityOracle is IQualityOracle {
    // ──────────────────── Constants ────────────────────

    uint256 public constant BPS = 10_000;

    /// @notice EWMA smoothing factor for latency (30% new, 70% old).
    uint256 public constant EWMA_ALPHA_BPS = 3_000;

    /// @notice Quality scoring weights (must sum to BPS).
    uint256 public constant WEIGHT_COMPLETION = 4_000; // 40%
    uint256 public constant WEIGHT_LATENCY = 2_000;    // 20%
    uint256 public constant WEIGHT_ERROR = 2_000;       // 20%
    uint256 public constant WEIGHT_SATISFACTION = 2_000; // 20%

    /// @notice Latency reference (ms). At this latency, latency component = 50%.
    uint256 public constant LATENCY_REFERENCE_MS = 2_000;

    /// @notice Maximum latency (ms). Beyond this, latency component = 0.
    uint256 public constant LATENCY_MAX_MS = 10_000;

    /// @notice Quality score below this triggers slashing.
    uint256 public constant SLASH_QUALITY_THRESHOLD = 3_000; // 30%

    /// @notice Slash amount in BPS of stake when quality is too low.
    uint256 public constant SLASH_AMOUNT_BPS = 500; // 5%

    /// @notice Minimum observations before quality score is meaningful.
    uint256 public constant MIN_OBSERVATIONS = 5;

    // ──────────────────── Storage ────────────────────

    ICapacitySignal public immutable capacityRegistry;
    IStakeManager public immutable stakeManager;

    struct InternalMetrics {
        uint256 completionRate;   // BPS
        uint256 avgLatencyMs;     // EWMA-smoothed
        uint256 errorRateBps;     // BPS
        uint256 satisfactionBps;  // BPS (default BPS = perfect)
        uint256 qualityScore;     // Composite BPS
        uint256 lastUpdated;
        uint256 totalTasks;
        uint256 totalErrors;
        uint256 totalSatisfactionReports;
        uint256 satisfactionSum;  // Sum of all satisfaction scores
    }

    mapping(bytes32 => mapping(address => InternalMetrics)) internal _metrics;

    // ──────────────────── Errors ────────────────────

    error ScoreOutOfRange();

    // ──────────────────── Constructor ────────────────────

    constructor(address capacityRegistry_, address stakeManager_) {
        capacityRegistry = ICapacitySignal(capacityRegistry_);
        stakeManager = IStakeManager(stakeManager_);
    }

    // ──────────────────── Quality Reporting ────────────────────

    /// @inheritdoc IQualityOracle
    function reportLatency(bytes32 taskTypeId, address sink, uint256 latencyMs) external {
        InternalMetrics storage m = _metrics[taskTypeId][sink];
        m.totalTasks++;

        // EWMA-smooth the latency
        if (m.avgLatencyMs == 0) {
            m.avgLatencyMs = latencyMs;
        } else {
            m.avgLatencyMs =
                (EWMA_ALPHA_BPS * latencyMs + (BPS - EWMA_ALPHA_BPS) * m.avgLatencyMs) / BPS;
        }

        emit LatencyReported(taskTypeId, sink, latencyMs);
    }

    /// @inheritdoc IQualityOracle
    function reportError(bytes32 taskTypeId, address sink, bytes32 taskId) external {
        InternalMetrics storage m = _metrics[taskTypeId][sink];
        m.totalErrors++;

        // Update error rate: errors / totalTasks
        if (m.totalTasks > 0) {
            m.errorRateBps = (m.totalErrors * BPS) / m.totalTasks;
        }

        emit ErrorReported(taskTypeId, sink, taskId);
    }

    /// @inheritdoc IQualityOracle
    function reportSatisfaction(bytes32 taskTypeId, address sink, uint256 scoreBps) external {
        if (scoreBps > BPS) revert ScoreOutOfRange();

        InternalMetrics storage m = _metrics[taskTypeId][sink];
        m.totalSatisfactionReports++;
        m.satisfactionSum += scoreBps;

        // Rolling average
        m.satisfactionBps = m.satisfactionSum / m.totalSatisfactionReports;

        emit SatisfactionReported(taskTypeId, sink, scoreBps);
    }

    /// @inheritdoc IQualityOracle
    function computeQuality(bytes32 taskTypeId, address sink) external {
        InternalMetrics storage m = _metrics[taskTypeId][sink];

        // Compute completion rate from capacity registry
        uint256 declaredCapacity = capacityRegistry.getSmoothedCapacity(taskTypeId, sink);
        if (declaredCapacity > 0 && m.totalTasks > 0) {
            uint256 rate = (m.totalTasks * BPS) / declaredCapacity;
            if (rate > BPS) rate = BPS;
            m.completionRate = rate;
        } else if (m.totalTasks == 0) {
            m.completionRate = BPS; // No tasks yet, assume perfect
        }

        // Latency component: BPS at 0ms, linear decay to 0 at LATENCY_MAX_MS
        uint256 latencyComponent;
        if (m.avgLatencyMs >= LATENCY_MAX_MS) {
            latencyComponent = 0;
        } else {
            latencyComponent = ((LATENCY_MAX_MS - m.avgLatencyMs) * BPS) / LATENCY_MAX_MS;
        }

        // Error component: BPS at 0 errors, decays linearly
        uint256 errorComponent = m.errorRateBps >= BPS ? 0 : BPS - m.errorRateBps;

        // Satisfaction component: direct BPS value (defaults to BPS before any reports)
        uint256 satisfactionComponent = m.totalSatisfactionReports > 0 ? m.satisfactionBps : BPS;

        // Weighted composite
        uint256 score = (
            WEIGHT_COMPLETION * m.completionRate +
            WEIGHT_LATENCY * latencyComponent +
            WEIGHT_ERROR * errorComponent +
            WEIGHT_SATISFACTION * satisfactionComponent
        ) / BPS;

        if (score > BPS) score = BPS;
        m.qualityScore = score;
        m.lastUpdated = block.timestamp;

        uint256 effectiveCap = (declaredCapacity * score) / BPS;

        emit QualityUpdated(taskTypeId, sink, score, effectiveCap);

        // Quality-based slashing
        if (score < SLASH_QUALITY_THRESHOLD && m.totalTasks >= MIN_OBSERVATIONS) {
            uint256 sinkStake = stakeManager.getStake(sink);
            uint256 slashAmount = (sinkStake * SLASH_AMOUNT_BPS) / BPS;
            if (slashAmount > 0) {
                stakeManager.slash(sink, slashAmount, keccak256("QUALITY_UNDERPERFORMANCE"));
                emit QualitySlashed(taskTypeId, sink, slashAmount, score);
            }
        }
    }

    // ──────────────────── Reads ────────────────────

    /// @inheritdoc IQualityOracle
    function getQualityMetrics(bytes32 taskTypeId, address sink)
        external
        view
        returns (QualityMetrics memory metrics)
    {
        InternalMetrics storage m = _metrics[taskTypeId][sink];
        metrics = QualityMetrics({
            completionRate: m.completionRate,
            avgLatencyMs: m.avgLatencyMs,
            errorRateBps: m.errorRateBps,
            satisfactionBps: m.totalSatisfactionReports > 0 ? m.satisfactionBps : BPS,
            qualityScore: m.qualityScore,
            lastUpdated: m.lastUpdated
        });
    }

    /// @inheritdoc IQualityOracle
    function getQualityScore(bytes32 taskTypeId, address sink) external view returns (uint256) {
        return _metrics[taskTypeId][sink].qualityScore;
    }

    /// @inheritdoc IQualityOracle
    function getEffectiveCapacity(bytes32 taskTypeId, address sink)
        external
        view
        returns (uint256)
    {
        uint256 declared = capacityRegistry.getSmoothedCapacity(taskTypeId, sink);
        uint256 score = _metrics[taskTypeId][sink].qualityScore;
        if (score == 0 && _metrics[taskTypeId][sink].lastUpdated == 0) {
            return declared; // Not yet scored, return full capacity
        }
        return (declared * score) / BPS;
    }
}
