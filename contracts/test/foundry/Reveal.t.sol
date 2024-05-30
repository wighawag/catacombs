// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "src/game/Game.sol";
import "src/game/routes/GameReveal.sol";

contract RevealTest is Test {
    uint256 testNumber;
    GameReveal revealRoute;

    function setUp() public {
        revealRoute = new GameReveal();
    }

    function test_stepReveal() public view {
        GameReveal.Context memory context = GameReveal.Context({
            characterID: 1,
            priorPosition: PositionUtils.toPosition(0, 0),
            controller: address(this),
            epoch: 1,
            actions: new Game.Action[](0),
            secret: bytes32(0)
        });
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(1, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(
            context,
            initialStateChanges,
            action,
            true
        );
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(1, 0));
    }

    function testFail_stepReveal() public view {
        GameReveal.Context memory context = GameReveal.Context({
            characterID: 1,
            priorPosition: PositionUtils.toPosition(0, 0),
            controller: address(this),
            epoch: 1,
            actions: new Game.Action[](0),
            secret: bytes32(0)
        });
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(0, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(
            context,
            initialStateChanges,
            action,
            true
        );
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }
}
