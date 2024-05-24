// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UsingERC712.sol";
import "./Named.sol";

abstract contract UsingERC712WithStaticChainID is UsingERC712, Named {
    uint256 private immutable _chainId;
    bytes32 private immutable _domainSeparator;
    address private immutable _verifyingContract;

    /// @dev we let you specifying the verifying contract so that if you use a proxy, the implementation can use it.
    constructor(address verifyingContract) {
        uint256 chainID;
        assembly {
            chainID := chainid()
        }

        _chainId = chainID;
        _verifyingContract = verifyingContract == address(0) ? address(this) : verifyingContract;
        _domainSeparator = _calculateDomainSeparator(chainID, _verifyingContract);
    }

    /// @inheritdoc IERC5267
    function eip712Domain()
        external
        view
        virtual
        override
        returns (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainID,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        )
    {
        fields = 0x0D;
        name = _name();
        version = "";
        chainID = _chainId;
        verifyingContract = _verifyingContract;
        salt = 0;
        extensions = new uint256[](0);
    }

    // ------------------------------------------------------------------------------------------------------------------
    // INTERNALS
    // ------------------------------------------------------------------------------------------------------------------

    // need to ensure we can use return value "name" in `eip712Domain`
    function _name() internal view returns (string memory) {
        return name();
    }

    function _currentDomainSeparator() internal view returns (bytes32) {
        return _domainSeparator;
    }

    /// @dev Calculate the Domain Separator used to compute ERC712 hash
    function _calculateDomainSeparator(uint256 chainID, address verifyingContract) private view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)"),
                    keccak256(bytes(name())),
                    chainID,
                    verifyingContract
                )
            );
    }
}
