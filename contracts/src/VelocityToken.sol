// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IVelocityToken } from "./interfaces/IVelocityToken.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title VelocityToken
/// @notice Wrapper token where only idle balances decay. Active Superfluid streams
///         are exempt. Creates "use it or lose it" economics — the underlying ERC-20 is
///         locked on wrap and returned on unwrap, minus any decay that occurred while idle.
///         Decay formula: effectiveBalance = balance × e^(-lambda × idleDuration).
///         Approximated as linear decay for gas efficiency.
contract VelocityToken is IVelocityToken, Ownable {
    using SafeERC20 for IERC20;

    // ──────────────────── Constants ────────────────────

    uint256 public constant WAD = 1e18;
    uint256 public constant BPS = 10_000;

    // ──────────────────── Storage ────────────────────

    IERC20 public immutable underlying;

    string public name;
    string public symbol;
    uint8 public immutable decimals;

    /// @notice Per-second decay rate as 18-decimal fixed point.
    uint256 public idleDecayRate;

    /// @notice Seconds of inactivity before decay begins.
    uint256 public idleThreshold;

    /// @notice Raw balances (before decay).
    mapping(address => uint256) internal _balances;

    /// @notice Timestamp of last activity per account.
    mapping(address => uint256) internal _lastActivity;

    /// @notice Whether an account is stream-exempt (manually tracked).
    mapping(address => bool) internal _streamExempt;

    /// @notice Total raw supply.
    uint256 public totalSupply;

    // ──────────────────── Errors ────────────────────

    error InsufficientBalance();
    error ZeroAmount();

    // ──────────────────── Constructor ────────────────────

    constructor(
        address underlying_,
        string memory name_,
        string memory symbol_,
        uint256 idleDecayRate_,
        uint256 idleThreshold_,
        address owner_
    ) Ownable(owner_) {
        underlying = IERC20(underlying_);
        name = name_;
        symbol = symbol_;
        decimals = 18;
        idleDecayRate = idleDecayRate_;
        idleThreshold = idleThreshold_;
    }

    // ──────────────────── Configuration ────────────────────

    /// @inheritdoc IVelocityToken
    function setIdleDecayRate(uint256 lambda_) external onlyOwner {
        idleDecayRate = lambda_;
    }

    /// @inheritdoc IVelocityToken
    function setIdleThreshold(uint256 threshold) external onlyOwner {
        uint256 old = idleThreshold;
        idleThreshold = threshold;
        emit IdleThresholdUpdated(old, threshold);
    }

    /// @notice Mark or unmark an account as stream-exempt.
    function setStreamExempt(address account, bool exempt) external onlyOwner {
        _streamExempt[account] = exempt;
        emit StreamExemptionUpdated(account, exempt);
    }

    // ──────────────────── Wrap / Unwrap ────────────────────

    /// @inheritdoc IVelocityToken
    function wrap(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        underlying.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender] += amount;
        _lastActivity[msg.sender] = block.timestamp;
        totalSupply += amount;
    }

    /// @inheritdoc IVelocityToken
    function unwrap(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        // Apply decay first
        _applyDecay(msg.sender);

        if (_balances[msg.sender] < amount) revert InsufficientBalance();
        _balances[msg.sender] -= amount;
        totalSupply -= amount;
        _lastActivity[msg.sender] = block.timestamp;

        underlying.safeTransfer(msg.sender, amount);
    }

    // ──────────────────── Decay ────────────────────

    /// @inheritdoc IVelocityToken
    function applyIdleDecay(address account) external {
        _applyDecay(account);
    }

    function _applyDecay(address account) internal {
        if (_streamExempt[account]) return;

        uint256 idle = _idleDuration(account);
        if (idle <= idleThreshold) return;

        uint256 bal = _balances[account];
        if (bal == 0) return;

        // Linear approximation of exponential decay:
        // decayed = balance × lambda × (idle - threshold) / WAD
        // Capped at full balance
        uint256 decaySeconds = idle - idleThreshold;
        uint256 decayed = (bal * idleDecayRate * decaySeconds) / WAD;
        if (decayed > bal) decayed = bal;

        _balances[account] = bal - decayed;
        totalSupply -= decayed;
        // Decayed tokens are burned (not returned to underlying pool)

        emit IdleDecayApplied(account, decayed, _balances[account]);
        _lastActivity[account] = block.timestamp;
    }

    // ──────────────────── Reads ────────────────────

    /// @inheritdoc IVelocityToken
    function realBalanceOf(address account) external view returns (uint256) {
        if (_streamExempt[account]) return _balances[account];

        uint256 idle = _idleDuration(account);
        if (idle <= idleThreshold) return _balances[account];

        uint256 bal = _balances[account];
        uint256 decaySeconds = idle - idleThreshold;
        uint256 decayed = (bal * idleDecayRate * decaySeconds) / WAD;
        if (decayed > bal) return 0;
        return bal - decayed;
    }

    /// @inheritdoc IVelocityToken
    function idleDuration(address account) external view returns (uint256) {
        return _idleDuration(account);
    }

    /// @inheritdoc IVelocityToken
    function isStreamExempt(address account) external view returns (bool) {
        return _streamExempt[account];
    }

    function _idleDuration(address account) internal view returns (uint256) {
        uint256 last = _lastActivity[account];
        if (last == 0) return 0;
        return block.timestamp - last;
    }
}
