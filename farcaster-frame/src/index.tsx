/** @jsxImportSource hono/jsx */
import { Button, FrameContext, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
// import {
//   FarcasterNetwork,
//   Message,
//   MessageData,
//   MessageType,
// } from "@farcaster/hub-nodejs";
import { areaCoord, wallAt } from "template-game-common";
import { EVMGame } from "template-game-contracts-js";


const tokenSymbol = 'peanuts';

type CharacterData = {
  position: {
    x: number;
    y: number;
  };
  characterID: bigint;
  direction: 0 | 1 | 2 | 3;
};
const memory: {
  [fid: string]: CharacterData;
} = {};

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  imageOptions: { width: 600, height: 600 },
  imageAspectRatio: "1:1",
});

export type View = { backWalls: boolean[]; sideWalls: boolean[] }[];

type Area = { southWalls: readonly boolean[]; eastWalls: readonly boolean[] };
// type MutableArea = {southWalls: boolean[], eastWalls: boolean[]};

// function mergeAreas(areas: readonly [Area,Area,Area,Area,Area,Area,Area,Area,Area], size: number): Area {
//   const merged: MutableArea = {
//     southWalls: [],
//     eastWalls: [],
//     // size: size * 3
//   }

//   for (let y = 0; y < size * 3; y++) {
//     for (let x = 0; x < size * 3; x++) {
//       const areaX = Math.floor(x / size);
//       const areaY = Math.floor(y / size);
//       const areaIndex = areaY * 3 + areaX;
//       const area = areas[areaIndex];
//       const index = ((y % size) * size) + (x % size);
//       merged.eastWalls.push(area.eastWalls[index]);
//       merged.southWalls.push(area.southWalls[index]);
//     }
//   }

//   return merged;
// }

export const evmGame = new EVMGame();

async function getSouthWallAt(x: number, y: number) {
  const area = evmGame.getArea(x, y); 
  return wallAt(area.southWalls, x, y);
}

async function getEastWallAt(x: number, y: number) {
  const area = evmGame.getArea(x, y); 
  return wallAt(area.eastWalls, x, y);
}

async function firstperson(
  pos: { x: number; y: number },
  direction: 0 | 1 | 2 | 3
): Promise<View> {
  const { x, y } = pos;
  if (direction == 0) {
    return [
      {
        backWalls: [
          await getSouthWallAt(x - 1, y - 1),
          await getSouthWallAt(x, y - 1),
          await getSouthWallAt(x + 1, y - 1),
        ],
        sideWalls: [await getEastWallAt(x - 1, y), await getEastWallAt(x, y)],
      },
      {
        backWalls: [
          await getSouthWallAt(x - 1, y - 2),
          await getSouthWallAt(x, y - 2),
          await getSouthWallAt(x + 1, y - 2),
        ],
        sideWalls: [await getEastWallAt(x - 1, y - 1), await getEastWallAt(x, y - 1)],
      },
      {
        backWalls: [
          await getSouthWallAt(x - 2, y - 3),
          await getSouthWallAt(x - 1, y - 3),
          await getSouthWallAt(x, y - 3),
          await getSouthWallAt(x + 1, y - 3),
          await getSouthWallAt(x + 2, y - 3),
        ],
        sideWalls: [
          await getEastWallAt(x - 2, y - 2),
          await getEastWallAt(x - 1, y - 2),
          await getEastWallAt(x, y - 2),
          await getEastWallAt(x + 1, y - 2),
        ],
      },
    ];
  } else if (direction == 1) {
    return [
      {
        backWalls: [
          await getEastWallAt(x, y - 1),
          await getEastWallAt(x, y),
          await getEastWallAt(x, y + 1),
        ],
        sideWalls: [await getSouthWallAt(x, y-1), await getSouthWallAt(x, y)],
      },
      {
        backWalls: [
          await getEastWallAt(x + 1, y - 1),
          await getEastWallAt(x + 1, y),
          await getEastWallAt(x + 1, y + 1),
        ],
        sideWalls: [await getSouthWallAt(x + 1, y - 1), await getSouthWallAt(x + 1, y)],
      },
      {
        backWalls: [
          await getEastWallAt(x +2, y - 2),
          await getEastWallAt(x +2, y - 1),
          await getEastWallAt(x +2, y ),
          await getEastWallAt(x +2 + 1, y +1),
          await getEastWallAt(x +2 + 2, y +2),
        ],
        sideWalls: [
          await getSouthWallAt(x + 2, y -2),
          await getSouthWallAt(x +2, y - 1),
          await getSouthWallAt(x + 2, y ),
          await getSouthWallAt(x + 2, y +1),
        ],
      },
    ];
  } else if (direction == 2) {
    return [
      {
        backWalls: [
          await getSouthWallAt(x + 1, y),
          await getSouthWallAt(x, y),
          await getSouthWallAt(x - 1, y),
        ],
        sideWalls: [await getEastWallAt(x, y), await getEastWallAt(x-1, y)],
      },
      {
        backWalls: [
          await getSouthWallAt(x + 1, y + 1),
          await getSouthWallAt(x, y + 1),
          await getSouthWallAt(x - 1, y + 1),
        ],
        sideWalls: [await getEastWallAt(x, y + 1), await getEastWallAt(x -1, y + 1)],
      },
      {
        backWalls: [
          await getSouthWallAt(x + 2, y +2),
          await getSouthWallAt(x + 1, y +2),
          await getSouthWallAt(x, y +2),
          await getSouthWallAt(x - 1, y +2),
          await getSouthWallAt(x - 2, y +2),
        ],
        sideWalls: [
          await getEastWallAt(x + 1, y + 2),
          await getEastWallAt(x, y + 2),
          await getEastWallAt(x -1, y + 2),
          await getEastWallAt(x - 2, y + 2),
        ],
      },
    ];
  } else {
    return [
      {
        backWalls: [
          await getEastWallAt(x -1, y + 1),
          await getEastWallAt(x -1, y),
          await getEastWallAt(x -1, y - 1),
        ],
        sideWalls: [await getSouthWallAt(x, y), await getSouthWallAt(x, y - 1)],
      },
      {
        backWalls: [
          await getEastWallAt(x - 2, y +1),
          await getEastWallAt(x - 2, y),
          await getEastWallAt(x -2, y - 1),
        ],
        sideWalls: [await getSouthWallAt(x - 1, y), await getSouthWallAt(x - 1, y - 1)],
      },
      {
        backWalls: [
          await getEastWallAt(x -3, y + 2),
          await getEastWallAt(x -3, y + 1),
          await getEastWallAt(x -3, y ),
          await getEastWallAt(x -3 + 1, y -1),
          await getEastWallAt(x -3 + 2, y -2),
        ],
        sideWalls: [
          await getSouthWallAt(x -2, y +1),
          await getSouthWallAt(x -2, y),
          await getSouthWallAt(x -2, y - 1 ),
          await getSouthWallAt(x -2, y -2 ),
        ],
      },
    ];
  }
}

function renderView(view: View) {
  const colors = [
    { fill: "#222222", stroke: "#aaaaaa" },
    { fill: "#131313", stroke: "#505050" },
    { fill: "#080808", stroke: "#202020" },
  ];
  return (
    <svg width="100%" viewBox="0 0 100 100" fill="#222" stroke="#aaa">
      {(() => {
        const paths: any[] = [];
        for (let i = view.length - 1; i >= 0; i--) {
          const { backWalls, sideWalls } = view[i];

          const z = i - 1;
          const backWallSize = z == 1 ? 20 : z == 0 ? 40 : 80;

          let x = -Math.floor(backWalls.length / 2);
          for (const backWall of backWalls) {
            let wallX1 = x * backWallSize + 50 - backWallSize / 2;
            let wallY1 = 50 - backWallSize / 2;
            let wallX2 = wallX1 + backWallSize;
            let wallY2 = wallY1 + backWallSize;

            if (backWall) {
              paths.push(
                <path
                  fill={colors[i].fill}
                  stroke={colors[i].stroke}
                  d={`M${wallX1} ${wallY1}L${wallX2} ${wallY1}L${wallX2} ${wallY2}L${wallX1} ${wallY2}L${wallX1} ${wallY1}`}
                ></path>
              );
            }

            x++;
          }

          const sideWallSize = z == 1 ? 20 : z == 0 ? 60 : 80;
          x = 0;
          for (const sideWall of sideWalls) {
            if (sideWalls.length == 2) {
              let wallX1 = 50 - sideWallSize / 2 - 10;
              let wallY1 = 50 - sideWallSize / 2 + (z == 0 ? 10 : 0);
              let wallX2 = wallX1 + 10 + (z == 0 ? 10 : 0);
              let wallY2 = wallY1 + sideWallSize - (z == 0 ? 20 : 0);

              if (x == 1) {
                wallX1 = 50 + sideWallSize / 2 + 10;
                wallX2 = 50 + sideWallSize / 2 - (z == 0 ? 10 : 0);

                wallY1 = 50 - sideWallSize / 2 + (z == 0 ? 10 : 0);
                wallY2 = wallY1 + sideWallSize - (z == 0 ? 20 : 0);
              }

              const closing = z == 0 ? 20 : 10;

              if (sideWall) {
                paths.push(
                  <path
                    fill={colors[i].fill}
                    stroke={colors[i].stroke}
                    d={`M${wallX1} ${
                      wallY1 - closing
                    }L${wallX2} ${wallY1}L${wallX2} ${wallY2}L${wallX1} ${
                      wallY2 + closing
                    }L${wallX1} ${wallY1 - closing}`}
                  ></path>
                );
              }
            } else {
              let wallX1 = 50 - sideWallSize / 2 - 10 - sideWallSize * (1 - x);
              let wallY1 = 50 - sideWallSize / 2 + (z == 0 ? 10 : 0);
              let wallX2 = wallX1 + 10 + (z == 0 ? 10 : 0);
              let wallY2 = wallY1 + sideWallSize - (z == 0 ? 20 : 0);

              if (x >= 2) {
                wallX1 = 50 + sideWallSize / 2 + 10 + sideWallSize * (x - 2);
                wallX2 =
                  50 +
                  sideWallSize / 2 -
                  (z == 0 ? 10 : 0) +
                  sideWallSize * (x - 2);

                wallY1 = 50 - sideWallSize / 2 + (z == 0 ? 10 : 0);
                wallY2 = wallY1 + sideWallSize - (z == 0 ? 20 : 0);
              }

              const closing = z == 0 ? 20 : 10;

              if (sideWall) {
                paths.push(
                  <path
                    fill={colors[i].fill}
                    stroke={colors[i].stroke}
                    d={`M${wallX1} ${
                      wallY1 - closing
                    }L${wallX2} ${wallY1}L${wallX2} ${wallY2}L${wallX1} ${
                      wallY2 + closing
                    }L${wallX1} ${wallY1 - closing}`}
                  ></path>
                );
              }
            }

            x++;
          }
        }
        return paths;
      })()}
    </svg>
  );
}

function defaultView(
  c: FrameContext,
  title: string,
  subTitle: string,
  intents?: any
) {
  return c.res({
    image: (
      <div
        style={{
          alignItems: "center",
          background: "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        {renderView([
          { backWalls: [false, false, false], sideWalls: [true, true] },
          { backWalls: [true, false, true], sideWalls: [false, false] },
          { backWalls: [false, false, false, false, false], sideWalls: [false, true, true, false] },
        ])}
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            flexWrap: "nowrap",
            justifyContent: "center",
            textAlign: "center",
            background: "#00000050",
            height: "100%",
            width: "100%",
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          <p
            style={{
              width: "100%",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            {title}
          </p>
          <p
            style={{
              width: "100%",
              textAlign: "center",
              justifyContent: "center",
              fontSize: 40,
            }}
          >
            {subTitle}
          </p>
        </div>
      </div>
    ),
    // imageOptions: { width: 600, height: 600 },
    // imageAspectRatio: "1:1",
    intents,
  });
}

async function moveView(c: FrameContext, characterData: CharacterData) {
  const characterArea = {
    x: areaCoord(characterData.position.x),
    y: areaCoord(characterData.position.y),
  };
  const view = await firstperson(characterData.position, characterData.direction);
  return c.res({
    image: (
      <div
        style={{
          // alignItems: "center",
          // background: "linear-gradient(to right, #432889, #17101F)",
          // backgroundSize: "100% 100%",
          display: "flex",
          // flexDirection: "column",
          // flexWrap: "nowrap",
          background: "#000",
          height: "100%",
          // justifyContent: "center",
          // textAlign: "center",
          width: "100%",
        }}
      >
        {renderView(view)}
      </div>
    ),
    // imageOptions: { width: 600, height: 600 },
    // imageAspectRatio: "1:1",
    intents: [
      // <Button value="continue">continue</Button>,
      // <Button value="commit">commit</Button>,
      // <Button value="restart">Restart</Button>,

      // <Button value="commit">commit</Button>,
      // <Button value="restart">Restart</Button>,

      // <Button value="restart">Restart</Button>,

      <Button value="rotate-left">↶</Button>,
      <Button value="forward">↑</Button>,
      <Button value="rotate-right">↷</Button>,
      // <Button.Reset>Reset</Button.Reset>,
      <Button value="reset">reset</Button>,

      // // <TextInput placeholder="Enter custom fruit..." />,
      // <Button value="attack">⚔</Button>,
      // <Button value="retreat">🠳</Button>,
    ],
  });
}

app.frame("/", async (c: FrameContext) => {
  const { buttonValue, inputText, status, req } = c;
  console.log({ buttonValue });
  console.log({ status });
  if (status === "response") {
    const json = await req.json();
    const { trustedData, untrustedData } = json;
    // const frameMessage = Message.decode(
    //   Buffer.from(trustedData.messageBytes, "hex")
    // );

    // const messageSignature = Buffer.from(frameMessage.signature).toString(
    //   "hex"
    // );

    // if (frameMessage.data) {
    //   const { fid } = frameMessage.data;
    //   const messageData: MessageData = {
    //     type: frameMessage.data.type as MessageType,
    //     fid: fid,
    //     timestamp: frameMessage.data.timestamp as number,
    //     network: frameMessage.data.network as FarcasterNetwork,
    //     frameActionBody: frameMessage.data?.frameActionBody,
    //   };

    //   const messageEncoded = MessageData.encode(messageData).finish();

    //   const args = [
    //     "0x" + Buffer.from(frameMessage.signer).toString("hex"), // public_key
    //     "0x" + Buffer.from(messageSignature).slice(0, 32).toString("hex"), // signature_r
    //     "0x" + Buffer.from(messageSignature).slice(32, 64).toString("hex"), // signature_s
    //     "0x" + Buffer.from(messageEncoded).toString("hex"), // message
    //   ];

    if (untrustedData) {
      const {fid} = untrustedData;

      let fidDATA = memory[fid];

      if (buttonValue == 'reset') {
        delete memory[fid];
        return defaultView(c, `Stake 5 ${tokenSymbol}`, "", [
          <Button value="stake">Stake 5 {tokenSymbol}</Button>,
        ]);
      }

      if (!fidDATA) {
        if (buttonValue === "stake") {
          fidDATA = memory[fid] = {
            characterID: 1n,
            direction: 0,
            position: { x: 0, y: 0 },
          };
        } else {
          return defaultView(c, `Stake 5 ${tokenSymbol}`, "", [
            <Button value="stake">Stake 5 {tokenSymbol}</Button>,
          ]);
        }
      } else {
        console.log(buttonValue)
        if (buttonValue == 'rotate-right') {
          fidDATA.direction  = (fidDATA.direction + 1) % 4 as 0 | 1 | 2 | 3;
        } else if (buttonValue == 'rotate-left') {
          fidDATA.direction  = (fidDATA.direction - 1) as 0 | 1 | 2 | 3;
          if (fidDATA.direction < 0) {
            fidDATA.direction += 4;
          }
        } else if (buttonValue == 'forward') {
          if (fidDATA.direction == 0) {
            fidDATA.position.y -= 1;
          } else if (fidDATA.direction == 1) {
            fidDATA.position.x += 1;
          } else if (fidDATA.direction == 2) {
            fidDATA.position.y += 1;
          } else if (fidDATA.direction == 3) {
            fidDATA.position.x -= 1;
          }
        }
      }

      return moveView(c, fidDATA);
    } else {
      return (
        defaultView(c, "Unknown Request", "Please Try again"),
        [<Button value="Enter">Try again</Button>]
      );
    }
  } else {
    return defaultView(c, "Catacombs", "Enter at your own risk", [
      <Button value="Enter">Enter</Button>,
    ]);
  }
});

const isCloudflareWorker = typeof caches !== "undefined";
if (isCloudflareWorker) {
  const manifest = await import("__STATIC_CONTENT_MANIFEST");
  const serveStaticOptions = { manifest, root: "./" };
  app.use("/*", serveStatic(serveStaticOptions));
  devtools(app, { assetsPath: "/frog", serveStatic, serveStaticOptions });
} else {
  devtools(app, { serveStatic });
}

export default app;
