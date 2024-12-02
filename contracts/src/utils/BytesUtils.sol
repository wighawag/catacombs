// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.0;

library BytesUtils {
    function sliceAsUint256(bytes memory b, uint256 start) internal pure returns (uint256 result) {
        assembly {
            result := mload(add(b, add(0x20, start)))
        }
    }
}
