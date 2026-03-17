// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IVelocityToken
/// @notice Interface for a velocity-incentivized token where only idle balances decay.
///         Money in active Superfluid streams does not decay. Money sitting in wallets does.
///         Creates "use it or lose it" economics without punishing productive routing delays.
interface IVelocityToken {
    // ──────────────────── Events ────────────────────

    event IdleDecayApplied(address indexed account, uint256 decayed, uint256 remaining);
    event StreamExemptionUpdated(address indexed account, bool exempt);
    event IdleThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    // ──────────────────── Configuration ────────────────────

    /// @notice Set the idle decay rate (per-second, 18-decimal fixed point).
    ///         Only applies to balances not in active streams.
    /// @param lambda_ New idle decay rate.
    function setIdleDecayRate(uint256 lambda_) external;

    /// @notice Set the idle threshold duration (seconds). Decay only starts after
    ///         balance has been idle for this long.
    /// @param threshold Duration in seconds before idle decay begins.
    function setIdleThreshold(uint256 threshold) external;

    // ──────────────────── Reads ────────────────────

    /// @notice Get the real balance after idle decay for an account.
    /// @param account The account to query.
    /// @return balance The current balance after idle decay.
    function realBalanceOf(address account) external view returns (uint256 balance);

    /// @notice Get the idle duration for an account (seconds since last transfer/stream).
    /// @param account The account to query.
    /// @return idle Seconds the balance has been idle.
    function idleDuration(address account) external view returns (uint256 idle);

    /// @notice Check if an account is currently exempt from decay (has active streams).
    /// @param account The account to query.
    /// @return exempt True if the account has active outgoing streams.
    function isStreamExempt(address account) external view returns (bool exempt);

    /// @notice Get the idle decay rate.
    /// @return rate Per-second decay rate (18-decimal fixed point).
    function idleDecayRate() external view returns (uint256 rate);

    /// @notice Get the idle threshold.
    /// @return threshold Seconds before idle decay begins.
    function idleThreshold() external view returns (uint256 threshold);

    // ──────────────────── Actions ────────────────────

    /// @notice Force-apply idle decay to an account. Anyone can call.
    /// @param account The account to decay.
    function applyIdleDecay(address account) external;

    /// @notice Wrap underlying tokens into VelocityTokens.
    /// @param amount Amount to wrap.
    function wrap(uint256 amount) external;

    /// @notice Unwrap VelocityTokens back to underlying (at current decayed value).
    /// @param amount Amount to unwrap.
    function unwrap(uint256 amount) external;
}
