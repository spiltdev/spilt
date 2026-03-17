// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IUrgencyToken } from "./interfaces/IUrgencyToken.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title UrgencyToken
/// @notice TTL-stamped self-destructing tokens. Encodes urgency into the medium:
///         shorter TTL = higher urgency = protocol routes with priority.
///         Underlying ERC-20 tokens are locked on mint; consumed by authorized flow
///         contracts before expiry, or burned permanently after expiry.
contract UrgencyToken is IUrgencyToken, Ownable {
    using SafeERC20 for IERC20;

    // ──────────────────── Constants ────────────────────

    /// @notice Minimum TTL to prevent griefing with near-instant expiry.
    uint256 public constant MIN_TTL = 60; // 1 minute

    /// @notice Maximum TTL to prevent indefinite locks.
    uint256 public constant MAX_TTL = 86_400 * 30; // 30 days

    // ──────────────────── Storage ────────────────────

    IERC20 public immutable underlying;

    /// @notice Auto-incrementing deposit ID.
    uint256 public nextDepositId;

    /// @notice Deposit records.
    mapping(uint256 => Deposit) internal _deposits;

    /// @notice Authorized consumers (pool contracts that can route urgency tokens).
    mapping(address => bool) public authorizedConsumers;

    /// @notice Running totals.
    uint256 public totalActive;
    uint256 public totalBurned;

    // ──────────────────── Errors ────────────────────

    error ZeroAmount();
    error TTLOutOfRange();
    error DepositNotFound();
    error DepositAlreadyConsumed();
    error DepositNotExpired();
    error DepositExpired();
    error NotAuthorizedConsumer();

    // ──────────────────── Constructor ────────────────────

    constructor(address underlying_, address owner_) Ownable(owner_) {
        underlying = IERC20(underlying_);
    }

    // ──────────────────── Admin ────────────────────

    /// @notice Authorize or deauthorize a consumer (pool contract).
    function setAuthorizedConsumer(address consumer, bool authorized) external onlyOwner {
        authorizedConsumers[consumer] = authorized;
    }

    // ──────────────────── Minting ────────────────────

    /// @inheritdoc IUrgencyToken
    function mint(uint256 amount, uint256 ttlSeconds) external returns (uint256 depositId) {
        if (amount == 0) revert ZeroAmount();
        if (ttlSeconds < MIN_TTL || ttlSeconds > MAX_TTL) revert TTLOutOfRange();

        underlying.safeTransferFrom(msg.sender, address(this), amount);

        depositId = nextDepositId++;
        uint256 expiry = block.timestamp + ttlSeconds;

        _deposits[depositId] = Deposit({
            owner: msg.sender,
            amount: amount,
            expiry: expiry,
            consumed: false
        });

        totalActive += amount;

        emit UrgencyMinted(msg.sender, depositId, amount, expiry);
    }

    // ──────────────────── Consumption ────────────────────

    /// @inheritdoc IUrgencyToken
    function consume(uint256 depositId, address sink) external {
        if (!authorizedConsumers[msg.sender]) revert NotAuthorizedConsumer();

        Deposit storage d = _deposits[depositId];
        if (d.owner == address(0)) revert DepositNotFound();
        if (d.consumed) revert DepositAlreadyConsumed();
        if (block.timestamp >= d.expiry) revert DepositExpired();

        d.consumed = true;
        totalActive -= d.amount;

        // Transfer underlying to sink
        underlying.safeTransfer(sink, d.amount);

        emit UrgencyConsumed(depositId, sink, d.amount);
    }

    // ──────────────────── Burning ────────────────────

    /// @inheritdoc IUrgencyToken
    function burn(uint256 depositId) external {
        Deposit storage d = _deposits[depositId];
        if (d.owner == address(0)) revert DepositNotFound();
        if (d.consumed) revert DepositAlreadyConsumed();
        if (block.timestamp < d.expiry) revert DepositNotExpired();

        d.consumed = true; // Mark as consumed to prevent double-burn
        totalActive -= d.amount;
        totalBurned += d.amount;

        // Burn underlying tokens by sending to dead address
        underlying.safeTransfer(address(0xdead), d.amount);

        emit UrgencyBurned(depositId, d.amount, msg.sender);
    }

    /// @inheritdoc IUrgencyToken
    function batchBurn(uint256[] calldata depositIds) external returns (uint256 burned) {
        for (uint256 i; i < depositIds.length; ++i) {
            Deposit storage d = _deposits[depositIds[i]];
            if (d.owner == address(0) || d.consumed || block.timestamp < d.expiry) continue;

            d.consumed = true;
            totalActive -= d.amount;
            totalBurned += d.amount;
            burned++;

            underlying.safeTransfer(address(0xdead), d.amount);
            emit UrgencyBurned(depositIds[i], d.amount, msg.sender);
        }
    }

    // ──────────────────── Reads ────────────────────

    /// @inheritdoc IUrgencyToken
    function getDeposit(uint256 depositId) external view returns (Deposit memory) {
        return _deposits[depositId];
    }

    /// @inheritdoc IUrgencyToken
    function isExpired(uint256 depositId) external view returns (bool) {
        Deposit storage d = _deposits[depositId];
        return d.owner != address(0) && block.timestamp >= d.expiry;
    }

    /// @inheritdoc IUrgencyToken
    function remainingTTL(uint256 depositId) external view returns (uint256) {
        Deposit storage d = _deposits[depositId];
        if (d.owner == address(0) || block.timestamp >= d.expiry) return 0;
        return d.expiry - block.timestamp;
    }
}
