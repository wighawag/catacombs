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
        uint256 action = PositionUtils.toPosition(1, 0);
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(1, 0));
    }

    function test_stepReveal2() public view {
        uint256 action = PositionUtils.toPosition(0, 0);
        GameReveal.StateChanges memory initialStateChanges;
        initialStateChanges.newPosition = PositionUtils.toPosition(1, 0);
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }

    function test_move_actions() public view {
        GameReveal.Context memory context;
        uint256[] memory actions = new uint256[](20);
        actions[0] = PositionUtils.toPosition(0, -1);
        actions[1] = PositionUtils.toPosition(-1, -1);
        actions[2] = PositionUtils.toPosition(-1, 0);
        actions[3] = PositionUtils.toPosition(-2, 0);
        actions[4] = PositionUtils.toPosition(-2, 1);
        actions[5] = PositionUtils.toPosition(-2, 2);
        actions[6] = PositionUtils.toPosition(-2, 3);
        actions[7] = PositionUtils.toPosition(-2, 4);
        actions[8] = PositionUtils.toPosition(-2, 5);
        actions[9] = PositionUtils.toPosition(-3, 5);
        actions[10] = PositionUtils.toPosition(-4, 5);
        actions[11] = PositionUtils.toPosition(-4, 4);
        actions[12] = PositionUtils.toPosition(-4, 3);
        actions[13] = PositionUtils.toPosition(-4, 2);
        actions[14] = PositionUtils.toPosition(-4, 1);
        actions[15] = PositionUtils.toPosition(-3, 1);
        actions[16] = PositionUtils.toPosition(-2, 1);
        actions[17] = PositionUtils.toPosition(-2, 2);
        actions[18] = PositionUtils.toPosition(-2, 3);
        actions[19] = PositionUtils.toPosition(-2, 4);

        context.actions = actions;
        context.characterID = 1;
        context.priorPosition = 0;
        // context.controller;
        context.epoch = 0;
        // context.secret;

        GameReveal.StateChanges memory newStateChanges = revealRoute.computeStateChanges(context, false);
    }

    function test_battle_actions() public view {
        GameReveal.StateChanges memory stateChanges;
        int32 x = 2;
        int32 y = -5;
        uint64 position = PositionUtils.toPosition(x, y);
        stateChanges.monsters[0] = GameReveal.Monster({x: x, y: y, hp: 3, kind: 1});
        stateChanges.monsters[1] = GameReveal.Monster({x: x - 5, y: y - 3, hp: 3, kind: 1});
        stateChanges.monsters[2] = GameReveal.Monster({x: x + 5, y: y + 2, hp: 3, kind: 1});
        stateChanges.monsters[3] = GameReveal.Monster({x: x + 6, y: y - 5, hp: 3, kind: 1});
        stateChanges.monsters[4] = GameReveal.Monster({x: x + 4, y: y + 8, hp: 3, kind: 1});
        stateChanges.newPosition = position;
        stateChanges.battle.monsterIndexPlus1 = 1;
        revealRoute.stepChanges(stateChanges, 1 << 248, true);
    }

    function test_battle_actions_3_times() public view {
        GameReveal.StateChanges memory stateChanges;
        int32 x = 2;
        int32 y = -5;
        uint64 position = PositionUtils.toPosition(x, y);
        stateChanges.monsters[0] = GameReveal.Monster({x: x, y: y, hp: 3, kind: 1});
        stateChanges.monsters[1] = GameReveal.Monster({x: x - 5, y: y - 3, hp: 3, kind: 1});
        stateChanges.monsters[2] = GameReveal.Monster({x: x + 5, y: y + 2, hp: 3, kind: 1});
        stateChanges.monsters[3] = GameReveal.Monster({x: x + 6, y: y - 5, hp: 3, kind: 1});
        stateChanges.monsters[4] = GameReveal.Monster({x: x + 4, y: y + 8, hp: 3, kind: 1});
        stateChanges.newPosition = position;
        stateChanges.battle.monsterIndexPlus1 = 1;
        stateChanges = revealRoute.stepChanges(stateChanges, 1 << 248, true);
        stateChanges = revealRoute.stepChanges(stateChanges, (1 << 248) | (1 << 8) | 1, true);
        // revealRoute.stepChanges(stateChanges, (1 << 248) | (1 << 8) | 1, true);
    }

    function testFail_battle_actions_same_card_twice() public view {
        GameReveal.StateChanges memory stateChanges;
        int32 x = 2;
        int32 y = -5;
        uint64 position = PositionUtils.toPosition(x, y);
        stateChanges.monsters[0] = GameReveal.Monster({x: x, y: y, hp: 3, kind: 1});
        stateChanges.monsters[1] = GameReveal.Monster({x: x - 5, y: y - 3, hp: 3, kind: 1});
        stateChanges.monsters[2] = GameReveal.Monster({x: x + 5, y: y + 2, hp: 3, kind: 1});
        stateChanges.monsters[3] = GameReveal.Monster({x: x + 6, y: y - 5, hp: 3, kind: 1});
        stateChanges.monsters[4] = GameReveal.Monster({x: x + 4, y: y + 8, hp: 3, kind: 1});
        stateChanges.newPosition = position;
        stateChanges.battle.monsterIndexPlus1 = 1;
        stateChanges = revealRoute.stepChanges(stateChanges, 1 << 248, true);

        revealRoute.stepChanges(stateChanges, 1 << 248, true);
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
        uint256 action = PositionUtils.toPosition(0, 0);
        GameReveal.StateChanges memory initialStateChanges;
        GameReveal.StateChanges memory newStateChanges = revealRoute.stepChanges(initialStateChanges, action, true);
        assertEq(newStateChanges.newPosition, PositionUtils.toPosition(0, 0));
    }
}
