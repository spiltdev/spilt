// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import { QualityOracle } from "../src/QualityOracle.sol";
import { MockCapacitySignal } from "./mocks/MockCapacitySignal.sol";
import { StakeManager } from "../src/StakeManager.sol";
import { MockERC20 } from "./mocks/MockERC20.sol";

contract QualityOracleTest is Test {
    QualityOracle public oracle;
    MockCapacitySignal public mockCS;
    StakeManager public stakeManager;
    MockERC20 public token;

    address owner = address(0xA);
    address sink1 = address(0x1);
    address source1 = address(0x2);

    bytes32 constant TASK_ID = keccak256("research");

    function setUp() public {
        token = new MockERC20("Stake", "STK");
        stakeManager = new StakeManager(address(token), 1e18, 100e18, owner);
        mockCS = new MockCapacitySignal();
        oracle = new QualityOracle(address(mockCS), address(stakeManager));

        // Set up task type with capacity
        mockCS.setTaskType(TASK_ID, 100e18, 1, 1000);
        mockCS.setSmoothedCapacity(TASK_ID, sink1, 100);

        // Fund and stake sink1
        _fundAndStake(sink1, 500e18);

        // Authorize oracle as slasher
        vm.prank(owner);
        stakeManager.setSlasher(address(oracle), true);
    }

    function _fundAndStake(address sink, uint256 amount) internal {
        token.mint(sink, amount);
        vm.startPrank(sink);
        token.approve(address(stakeManager), type(uint256).max);
        stakeManager.stake(amount);
        vm.stopPrank();
    }

    // ──────────────────── Latency Reporting ────────────────────

    function test_reportLatency_initial() public {
        oracle.reportLatency(TASK_ID, sink1, 500);

        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertEq(m.avgLatencyMs, 500);
    }

    function test_reportLatency_ewmaSmoothing() public {
        oracle.reportLatency(TASK_ID, sink1, 1000);
        oracle.reportLatency(TASK_ID, sink1, 2000);

        // EWMA: 0.3 * 2000 + 0.7 * 1000 = 600 + 700 = 1300
        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertEq(m.avgLatencyMs, 1300);
    }

    // ──────────────────── Error Reporting ────────────────────

    function test_reportError() public {
        // Report some latency first to have totalTasks > 0
        oracle.reportLatency(TASK_ID, sink1, 100);
        oracle.reportLatency(TASK_ID, sink1, 100);
        oracle.reportError(TASK_ID, sink1, keccak256("task1"));

        // 1 error out of 2 tasks = 5000 BPS (50%)
        oracle.computeQuality(TASK_ID, sink1);
        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertEq(m.errorRateBps, 5000);
    }

    // ──────────────────── Satisfaction Reporting ────────────────────

    function test_reportSatisfaction() public {
        oracle.reportSatisfaction(TASK_ID, sink1, 8000);
        oracle.reportSatisfaction(TASK_ID, sink1, 6000);

        // Average: (8000 + 6000) / 2 = 7000
        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertEq(m.satisfactionBps, 7000);
    }

    function test_reportSatisfaction_revert_outOfRange() public {
        vm.expectRevert(QualityOracle.ScoreOutOfRange.selector);
        oracle.reportSatisfaction(TASK_ID, sink1, 10001);
    }

    // ──────────────────── Quality Computation ────────────────────

    function test_computeQuality_perfect() public {
        // Report enough latency observations for a good score
        for (uint256 i; i < 10; ++i) {
            oracle.reportLatency(TASK_ID, sink1, 100); // Fast
        }
        oracle.reportSatisfaction(TASK_ID, sink1, 10000); // Perfect satisfaction

        // Set smoothed capacity so completion rate looks good
        mockCS.setSmoothedCapacity(TASK_ID, sink1, 10);

        oracle.computeQuality(TASK_ID, sink1);

        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertGt(m.qualityScore, 8000); // Should be very high
    }

    function test_computeQuality_poor_triggers_slash() public {
        // Report high latency and errors for poor quality
        for (uint256 i; i < 6; ++i) {
            oracle.reportLatency(TASK_ID, sink1, 9000);
            oracle.reportError(TASK_ID, sink1, bytes32(i));
        }
        oracle.reportSatisfaction(TASK_ID, sink1, 1000); // Poor satisfaction

        // Set high declared capacity relative to tasks (poor completion rate)
        mockCS.setSmoothedCapacity(TASK_ID, sink1, 1000);

        uint256 stakeBefore = stakeManager.getStake(sink1);
        oracle.computeQuality(TASK_ID, sink1);

        QualityOracle.QualityMetrics memory m = _getMetrics();
        assertLt(m.qualityScore, 3000); // Should be low

        // Should have been slashed
        uint256 stakeAfter = stakeManager.getStake(sink1);
        assertLt(stakeAfter, stakeBefore);
    }

    // ──────────────────── Effective Capacity ────────────────────

    function test_getEffectiveCapacity_unscored() public view {
        // Before any quality computation, returns full declared capacity
        uint256 cap = oracle.getEffectiveCapacity(TASK_ID, sink1);
        assertEq(cap, 100); // Full smoothed capacity
    }

    function test_getEffectiveCapacity_scored() public {
        for (uint256 i; i < 5; ++i) {
            oracle.reportLatency(TASK_ID, sink1, 100);
        }
        mockCS.setSmoothedCapacity(TASK_ID, sink1, 5);
        oracle.computeQuality(TASK_ID, sink1);

        uint256 cap = oracle.getEffectiveCapacity(TASK_ID, sink1);
        // Should be between 0 and declared (100 was set in setUp, then changed to 5)
        assertLe(cap, 5);
    }

    // ──────────────────── Helper ────────────────────

    function _getMetrics() internal view returns (QualityOracle.QualityMetrics memory) {
        return oracle.getQualityMetrics(TASK_ID, sink1);
    }
}
