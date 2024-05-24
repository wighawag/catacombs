// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface UsingERC4494Errors {
    /// @notice The permit has expired
    /// @param currentTime time at which the error happen
    /// @param deadline the deadline
    error DeadlineOver(uint256 currentTime, uint256 deadline);

    /// @notice The signature do not match the expected signer
    error InvalidSignature();
}
