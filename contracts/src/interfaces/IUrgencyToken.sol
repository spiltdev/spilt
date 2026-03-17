// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IUrgencyToken
/// @notice Interface for TTL-stamped tokens that self-destruct after expiry.
///         Encodes urgency directly into the medium: shorter TTL = higher urgency.
///         Protocol routes UETs with priority; expired tokens burn automatically.
interface IUrgencyToken {
    // ──────────────────── Events ────────────────────

    event UrgencyMinted(address indexed to, uint256 indexed depositId, uint256 amount, uint256 expiry);
    event UrgencyBurned(uint256 indexed depositId, uint256 amount, address indexed burner);
    event UrgencyConsumed(uint256 indexed depositId, address indexed sink, uint256 amount);
    event UrgencyDrained(uint256 indexed depositId, address indexed sink, uint256 amount);

    // ──────────────────── Structs ────────────────────

    struct Deposit {
        address owner;
        uint256 amount;
        uint256 expiry; // block.timestamp after which the deposit burns
        bool consumed; // True if routed to a sink before expiry
    }

    // ──────────────────── Minting ────────────────────

    /// @notice Mint urgency tokens with a TTL. Underlying tokens are locked.
    /// @param amount Amount of underlying tokens to lock.
    /// @param ttlSeconds Time-to-live in seconds. After expiry, tokens burn.
    /// @return depositId The unique deposit identifier.
    function mint(uint256 amount, uint256 ttlSeconds) external returns (uint256 depositId);

    // ──────────────────── Consumption ────────────────────

    /// @notice Consume an urgency deposit by routing it to a sink. Only callable by
    ///         authorized pool contracts. Must be called before expiry.
    /// @param depositId The deposit to consume.
    /// @param sink The sink receiving the payment.
    function consume(uint256 depositId, address sink) external;

    // ──────────────────── Burning ────────────────────

    /// @notice Burn an expired deposit. Anyone can call after expiry.
    ///         Burns the underlying tokens permanently.
    /// @param depositId The expired deposit to burn.
    function burn(uint256 depositId) external;

    /// @notice Batch-burn all expired deposits up to a limit.
    /// @param depositIds Array of deposit IDs to attempt to burn.
    /// @return burned Number of deposits actually burned.
    function batchBurn(uint256[] calldata depositIds) external returns (uint256 burned);

    // ──────────────────── Reads ────────────────────

    /// @notice Get deposit details.
    /// @param depositId The deposit ID.
    /// @return deposit The deposit struct.
    function getDeposit(uint256 depositId) external view returns (Deposit memory deposit);

    /// @notice Check if a deposit has expired.
    /// @param depositId The deposit ID.
    /// @return expired True if block.timestamp >= deposit.expiry.
    function isExpired(uint256 depositId) external view returns (bool expired);

    /// @notice Get the remaining TTL in seconds (0 if expired).
    /// @param depositId The deposit ID.
    /// @return remaining Seconds until expiry.
    function remainingTTL(uint256 depositId) external view returns (uint256 remaining);

    /// @notice Get total active (non-expired, non-consumed) urgency deposits.
    /// @return total Sum of all active deposit amounts.
    function totalActive() external view returns (uint256 total);

    /// @notice Get total burned (expired) urgency deposits.
    /// @return total Sum of all burned deposit amounts.
    function totalBurned() external view returns (uint256 total);
}
