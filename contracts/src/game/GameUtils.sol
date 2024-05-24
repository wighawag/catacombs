// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.0;

import "./Game.sol";

library GameUtils {
    function getEpoch(Game.Config memory config) internal view returns (uint24 epoch, bool commiting) {
        uint256 epochDuration = config.commitPhaseDuration + config.revealPhaseDuration;
        uint256 time = block.timestamp; // TODO_timestamp();
        if (time < config.startTime) {
            revert Game.GameNotStarted();
        }
        uint256 timePassed = time - config.startTime;
        epoch = uint24(timePassed / epochDuration + 2); // epoch start at 2, this make the hypothetical previous reveal phase's epoch to be 1
        commiting = timePassed - ((epoch - 2) * epochDuration) < config.commitPhaseDuration;
    }
}
