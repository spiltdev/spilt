// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {
    ISuperfluidToken
} from "@superfluid-finance/contracts/interfaces/superfluid/ISuperfluidToken.sol";
import {
    ISuperfluidPool
} from "@superfluid-finance/contracts/interfaces/agreements/gdav1/ISuperfluidPool.sol";
import {
    PoolConfig
} from "@superfluid-finance/contracts/interfaces/agreements/gdav1/IGeneralDistributionAgreementV1.sol";

/// @dev Minimal mock GDA for testing. Only implements createPool.
///      Since BackpressurePool stores GDA as IGeneralDistributionAgreementV1,
///      we just need the function selector to match for createPool calls.
contract MockGDA {
    uint256 internal _counter;

    function createPool(ISuperfluidToken, address, PoolConfig memory)
        external
        returns (ISuperfluidPool)
    {
        _counter++;
        return ISuperfluidPool(address(uint160(_counter)));
    }

    // Minimal stubs for ISuperfluidAgreement interface (called by Superfluid framework)
    function agreementType() external pure returns (bytes32) { return bytes32(0); }
    function realtimeBalanceOf(ISuperfluidToken, address, uint256) external pure returns (int256, uint256, uint256) { return (0, 0, 0); }
}
