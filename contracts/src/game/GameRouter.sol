// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./routes/GameCommit.sol";
import "./routes/GameController.sol";
import "./routes/GameReveal.sol";
import "./Game.sol";

contract GameRouter {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // TODO generate this automatically
    ///////////////////////////////////////////////////////////////////////////////////////////////
    struct Routes {
        GameCommit commitRoute;
        GameController controllerRoute;
        GameReveal revealRoute;
    }

    GameCommit internal immutable _commit;
    GameController internal immutable _controller;
    GameReveal internal immutable _reveal;
    ///////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // CONFIG
    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// @notice the timestamp (in seconds) at which the game start, it start in the commit phase
    uint256 internal immutable START_TIME;
    /// @notice the duration of the commit phase in seconds
    uint256 internal immutable COMMIT_PHASE_DURATION;
    /// @notice the duration of the reveal phase in seconds
    uint256 internal immutable REVEAL_PHASE_DURATION;
    /// @notice the max number of level a cell can reach in the game
    ///////////////////////////////////////////////////////////////////////////////////////////////

    constructor(Routes memory routes, Game.Config memory config) {
        ///////////////////////////////////////////////////////////////////////////////////////////
        // TODO generate this automatically
        ///////////////////////////////////////////////////////////////////////////////////////////
        _commit = routes.commitRoute;
        _controller = routes.controllerRoute;
        _reveal = routes.revealRoute;
        ///////////////////////////////////////////////////////////////////////////////////////////

        START_TIME = config.startTime;
        COMMIT_PHASE_DURATION = config.commitPhaseDuration;
        REVEAL_PHASE_DURATION = config.revealPhaseDuration;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // TODO generate this automatically
    ///////////////////////////////////////////////////////////////////////////////////////////////
    function commit(uint256, bytes24, address) external payable {
        _delegateTo(address(_commit));
    }

    function join(uint256) external {
        _delegateTo(address(_controller));
    }

    function reveal(uint256, Game.Action[] calldata, bytes32) external {
        _delegateTo(address(_reveal));
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // INTERNAL
    ///////////////////////////////////////////////////////////////////////////////////////////////
    function _getConfig() internal view returns (Game.Config memory) {
        return
            Game.Config({
                startTime: START_TIME,
                commitPhaseDuration: COMMIT_PHASE_DURATION,
                revealPhaseDuration: REVEAL_PHASE_DURATION
            });
    }

    function _delegateTo(address route) internal {
        bytes memory configEncoded = abi.encode(_getConfig());
        // taken from https://github.com/OpenZeppelin/openzeppelin-contracts/blob/8cab922347e79732f6a532a75da5081ba7447a71/contracts/proxy/Proxy.sol#L22-L45
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())
            let confifSize := mload(configEncoded)
            mcopy(calldatasize(), add(configEncoded, 32), confifSize)
            mstore(add(calldatasize(), confifSize), shl(240, confifSize)) // max 2 bytes for size spec

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), route, 0, add(calldatasize(), add(confifSize, 2)), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
