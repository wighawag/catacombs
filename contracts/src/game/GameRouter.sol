// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./routes/GameEnter.sol";
import "./routes/GameLeave.sol";
import "./routes/GameCommit.sol";
import "./routes/GameReveal.sol";

import "./Game.sol";

contract GameRouter is Game {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // TODO generate this automatically
    ///////////////////////////////////////////////////////////////////////////////////////////////
    struct Routes {
        GameEnter enterRoute;
        GameLeave leaveRoute;
        GameCommit commitRoute;
        GameReveal revealRoute;
    }

    GameEnter internal immutable _route_enter;
    GameLeave internal immutable _route_leave;
    GameCommit internal immutable _route_commit;
    GameReveal internal immutable _route_reveal;

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
    /// @notice the Character NFT Collection
    IERC721 internal immutable CHARACTERS;
    ///////////////////////////////////////////////////////////////////////////////////////////////

    constructor(Routes memory routes, Game.Config memory config) {
        ///////////////////////////////////////////////////////////////////////////////////////////
        // TODO generate this automatically
        ///////////////////////////////////////////////////////////////////////////////////////////
        _route_enter = routes.enterRoute;
        _route_leave = routes.leaveRoute;
        _route_commit = routes.commitRoute;
        _route_reveal = routes.revealRoute;
        ///////////////////////////////////////////////////////////////////////////////////////////

        START_TIME = config.startTime;
        COMMIT_PHASE_DURATION = config.commitPhaseDuration;
        REVEAL_PHASE_DURATION = config.revealPhaseDuration;
        CHARACTERS = config.characters;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // TODO generate this automatically
    ///////////////////////////////////////////////////////////////////////////////////////////////
    function onERC721Received(address, address, uint256, bytes calldata) external {
        _delegateTo(address(_route_enter));
    }

    function enter(uint256, address payable) external payable {
        _delegateTo(address(_route_enter));
    }

    function leave(uint256, address) external {
        _delegateTo(address(_route_leave));
    }

    function commit(uint256, bytes24, address payable) external payable {
        _delegateTo(address(_route_commit));
    }

    function reveal(uint256, Game.Action[] calldata, bytes32) external {
        _delegateTo(address(_route_reveal));
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
                revealPhaseDuration: REVEAL_PHASE_DURATION,
                characters: CHARACTERS
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
