// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "src/game/Game.sol";
import "src/game/routes/GameReveal.sol";

contract RevealTest is Test {
    uint256 testNumber;
    GameReveal revealRoute;

    error GenericError(string str);

    function setUp() public {
        revealRoute = new GameReveal();
    }

    function test_stepReveal() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(1, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(1, 0));
    }

    function test_stepReveal2() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(0, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        initialStateChanges.newPosition = PositionUtils.toPosition(1, 0);
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }

    function test_actions() public view {
        GameReveal.Context memory context;
        Game.Action[] memory actions = new Game.Action[](20);
        actions[0] = Game.Action({position: PositionUtils.toPosition(0, -1), action: 0});
        actions[1] = Game.Action({position: PositionUtils.toPosition(-1, -1), action: 0});
        actions[2] = Game.Action({position: PositionUtils.toPosition(-1, 0), action: 0});
        actions[3] = Game.Action({position: PositionUtils.toPosition(-2, 0), action: 0});
        actions[4] = Game.Action({position: PositionUtils.toPosition(-2, 1), action: 0});
        actions[5] = Game.Action({position: PositionUtils.toPosition(-2, 2), action: 0});
        actions[6] = Game.Action({position: PositionUtils.toPosition(-2, 3), action: 0});
        actions[7] = Game.Action({position: PositionUtils.toPosition(-2, 4), action: 0});
        actions[8] = Game.Action({position: PositionUtils.toPosition(-2, 5), action: 0});
        actions[9] = Game.Action({position: PositionUtils.toPosition(-3, 5), action: 0});
        actions[10] = Game.Action({position: PositionUtils.toPosition(-4, 5), action: 0});
        actions[11] = Game.Action({position: PositionUtils.toPosition(-4, 4), action: 0});
        actions[12] = Game.Action({position: PositionUtils.toPosition(-4, 3), action: 0});
        actions[13] = Game.Action({position: PositionUtils.toPosition(-4, 2), action: 0});
        actions[14] = Game.Action({position: PositionUtils.toPosition(-4, 1), action: 0});
        actions[15] = Game.Action({position: PositionUtils.toPosition(-3, 1), action: 0});
        actions[16] = Game.Action({position: PositionUtils.toPosition(-2, 1), action: 0});
        actions[17] = Game.Action({position: PositionUtils.toPosition(-2, 2), action: 0});
        actions[18] = Game.Action({position: PositionUtils.toPosition(-2, 3), action: 0});
        actions[19] = Game.Action({position: PositionUtils.toPosition(-2, 4), action: 0});

        context.actions = actions;
        context.characterID = 1;
        context.priorPosition = 0;
        // context.controller;
        context.epoch = 0;
        // context.secret;

        GameReveal.StateChanges memory newStateChanges = revealRoute.computeStateChanges(context, false);
    }

    function test_area() public view {
        int32 x;
        int32 y;
        x = 1;
        y = 0;
        bytes32 areaHash = keccak256(abi.encodePacked(PositionUtils.areaCoord(x), PositionUtils.areaCoord(y)));

        for (y = 0; y < 5; y++) {
            for (x = 0; x < 5; x++) {
                bytes32 testAreaHash = keccak256(
                    abi.encodePacked(PositionUtils.areaCoord(x), PositionUtils.areaCoord(y))
                );
                if (testAreaHash != areaHash) {
                    revert GenericError("not same hash");
                }
            }
        }

        x = 1;
        y = 0;
        uint8 lx = PositionUtils.areaLocalCoord(x);
        uint8 ly = PositionUtils.areaLocalCoord(y);
        console.log("(%i, %i)", lx, ly);
        uint8 index = ly * uint8(int8(PositionUtils.AREA_SIZE)) + lx;
        console.log("(%i)", index);
        console.log("area num: %i", uint256(areaHash) % 5);
        Game.Area memory area = GameUtils.areaAt(x, y);
        console.log(area.eastWalls);
        console.log("wall: %b", ((area.eastWalls >> (127 - index)) & 0x1) == 1);

        console.log(GameUtils.wallAt(area.eastWalls, x, y));
    }

    function testFail_stepReveal() public view {
        Game.Action memory action = Game.Action({position: PositionUtils.toPosition(0, 0), action: 0});
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }
}
