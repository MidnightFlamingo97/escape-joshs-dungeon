//initialise game
const app = new PIXI.Application({
  width: 1000,
  height: 600,
  backgroundColor: 0x25131a,
});
document.body.appendChild(app.view);

//crate data
const crateData = [
  {
    //top left, sight potion
    use: () => {
      app.stage.addChild(shroud2);
      app.stage.removeChild(shroud);

      showMessage(
        "As you approach the crate it begins to glow. A small glowing orb begins to rise up and float towards you. You absorb it... and gain the gift of night sight!"
      );
    },
  },
  {
    //clue to find barrel
    use: () => {
      const barrelIndex = interactions.findIndex((item) => item.id == 1472);
      interactions[barrelIndex].canBeFound = true;
      showMessage(
        "The crate is filled with strange papers and documents. You find an old leather bound diary. The pages are torn and stained, almost impossible to read. On one page you can see part of an entry: 'I _a_ __ h_de th_ k_y in a __rr_l'"
      );
    },
  },
  {
    use: () => {
      //starter clue crate
      showMessage(
        "You spot a note on a crate. It seems ancient; covered in symbols you do not understand. However, you can make out an old sketch of a large door and a strange key with a large gem on its handle..."
      );
    },
  },
  {
    //something for v2
    use: () => {
      showMessage(
        "The crate is empty... other than a few cobwebs and insects."
      );
    },
  },
  {
    //clue to find gem
    use: () => {
      const gemIndex = interactions.findIndex((item) => item.id == 510);
      interactions[gemIndex].canBeFound = true;
      showMessage(
        "You rummage through the crate and find a tattered book. It's pretty old and boring... but on one of the pages there is a rough sketch of a room with 3 inset areas. An arrow points to the left most inset, along with an annotated sketch of a specific brick formation"
      );
    },
  },
];

const hiddenInteractionData = [
  {
    //top left, Gem location
    canBeFound: false,
    use: () => {
      gotGem = true;

      if (gotGem && gotKey) {
        mainDoorKey = true;
      }

      showMessage(
        "You recognise an arrangement of bricks from the book sketch. As you inspect the bricks you push one into the wall, opening a hidden compartment. You reach in and take out a strange glowing gem."
      );
    },
  },
  {
    //something for v2
    canBeFound: false,
    use: () => {
      console.log("Test");
    },
  },
  {
    //top middle left end of hallway, find small key 2
    canBeFound: true,
    use: () => {
      smallDoor2Key = true;
      showMessage(
        "You kick a rock and hear a rattle... On closer inspection, you see the rock is fake and has a seam running around it. You prise it open, and find a small key inside!"
      );
    },
  },
  {
    //bottom right, key for small door 1
    canBeFound: true,
    use: () => {
      smallDoor1Key = true;
      showMessage(
        "Something shiny catches your eye in the corner. You brush away some cobwebs and find a small key"
      );
    },
  },
  {
    //barrel. main door key
    canBeFound: false,
    use: () => {
      gotKey = true;

      if (gotGem && gotKey) {
        mainDoorKey = true;
      }

      showMessage(
        "Unlike the other barrels you have come across, the lid on this one is not sealed. You open it and search inside. It's mainly filled with old clothes and rags. You hand grazes something cold and metal... you pull out a large old key with a gem shaped groove on it's handle."
      );
    },
  },
];

//general global variables
const gameScale = 2;
const movementSpeed = 5;

let gameStarted = false;
let gameEnded = false;

let canMove = true;
let interactiveSpace = false;

let messageShowing = false;
let messageCanBeClosed = false;

let mainDoorKey = false;
let gotGem = false;
let gotKey = false;
let mergeMessageShown = false;

let smallDoor1Key = false;
let smallDoor2Key = false;

const offset = {
  x: -(350 * gameScale),
  y: -(450 * gameScale),
};

const playerOffset = {
  x: app.screen.width / 2 - (24 * gameScale) / 2,
  y: app.screen.height / 2 - (24 * gameScale) / 2,
};

const playerPosition = {
  x: playerOffset.x - offset.x,
  y: playerOffset.y - offset.y,
};

//audio
const mainMusic = PIXI.sound.Sound.from(
  "./assets/sound/sinnesloschen-beam-117362.mp3"
);
const noteAudio = PIXI.sound.Sound.from("./assets/sound/pageturn-102978.mp3");
const lockedAudio = PIXI.sound.Sound.from(
  "./assets/sound/door_rattle_03-81018.mp3"
);
const unlockAudio = PIXI.sound.Sound.from(
  "./assets/sound/mortice-door-lock-being-locked-and-unlocked-95884.mp3"
);
const getItemAudio = PIXI.sound.Sound.from(
  "./assets/sound/item-pick-up-38258.mp3"
);

//start game
const startGame = () => {
  document.querySelector(".welcome-screen").style.display = "none";

  mainMusic.play({
    loop: true,
  });
  gameStarted = true;
  //start keyframes/ looping
  app.ticker.add((delta) => loop(delta));
};

document.querySelector(".start-btn").addEventListener("click", startGame);

//playerAnimation info
const playerSpriteSheetPosition = {
  x: 0,
  y: 0,
};

let playerMoving = "no";

//add map
const map = PIXI.Sprite.from("./assets/dungeon_game_map.png");
map.scale.set(gameScale);
map.x = offset.x;
map.y = offset.y;
app.stage.addChild(map);

//collisions collection
const screenCollisions = new PIXI.Container();
app.stage.addChild(screenCollisions);

const collisionPlayerOffset = {
  top: 20,
  right: 5,
  bottom: 2,
  left: 5,
};

//main door
const mainDoor = PIXI.Sprite.from("./assets/main_door.png");
mainDoor.scale.set(gameScale);
app.stage.addChildAt(mainDoor, 1);
const mainDoorOffset = {
  x: 1052 * gameScale,
  y: 417 * gameScale,
};

//small door 1
const smallDoor1 = PIXI.Sprite.from("./assets/small_door.jpg");
smallDoor1.scale.set(gameScale);
app.stage.addChildAt(smallDoor1, 1);
const smallDoor1Offset = {
  x: 600 * gameScale,
  y: 360 * gameScale,
};

//small door 2
const smallDoor2 = PIXI.Sprite.from("./assets/small_door.jpg");
smallDoor2.scale.set(gameScale);
app.stage.addChildAt(smallDoor2, 1);
const smallDoor2Offset = {
  x: 312 * gameScale,
  y: 384 * gameScale,
};

//add character
const character = new PIXI.Container();
character.width = 24 * gameScale;
character.height = 24 * gameScale;
character.x = playerOffset.x;
character.y = playerOffset.y;
app.stage.addChild(character);

const characterSprite = PIXI.Sprite.from("./assets/elf_spritesheet.png");
characterSprite.scale.set((24 / 18) * gameScale);
character.addChild(characterSprite);

const characterMask = new PIXI.Graphics();
characterMask.beginFill(0xffffff); // White color to mask the sprite
characterMask.drawRect(0, 0, 24 * gameScale, 24 * gameScale);
characterMask.endFill();
character.addChild(characterMask);
characterSprite.mask = characterMask;

//create interact prompt
const interactPrompt = new PIXI.Text("SPACE", {
  fontFamily: "Pixelify Sans, sans-serif",
  fontSize: 12,
  fill: 0xffffff,
});
(interactPrompt.x = app.screen.width / 2 - interactPrompt.width / 2),
  (interactPrompt.y = app.screen.height / 2 - 24 * gameScale);

const toggleInteractivePrompt = (show) => {
  if (show) {
    app.stage.addChildAt(interactPrompt, 4);
  } else {
    app.stage.removeChild(interactPrompt);
  }
};

//shroud
const shroud = PIXI.Sprite.from("./assets/shroud.png");
shroud.scale.set(gameScale);
shroud.x = -app.screen.width / 2;
shroud.y = -app.screen.height / 2;
app.stage.addChild(shroud);

const shroud2 = PIXI.Sprite.from("./assets/shroud_2.png");
shroud2.scale.set(gameScale);
shroud2.x = -app.screen.width / 2;
shroud2.y = -app.screen.height / 2;

//messages
const message = new PIXI.Container();

const messageBackground = new PIXI.Graphics();
messageBackground.beginFill(0x000000);
messageBackground.drawRect(0, 0, app.screen.width, app.screen.height);
messageBackground.endFill();
messageBackground.alpha = 0.6;
message.addChild(messageBackground);

const messageCard = PIXI.Sprite.from("./assets/message_card.jpg");
messageCard.x = 212;
messageCard.y = 132;
message.addChild(messageCard);

const messageText = new PIXI.Text("", {
  fontFamily: "Pixelify Sans, sans-serif",
  fontSize: 24,
  fill: 0xffffff,
  wordWrap: true,
  wordWrapWidth: 450,
  align: "center",
});
message.addChild(messageText);

//message continue prompt
const continuePrompt = new PIXI.Text("Press Space to Contiune", {
  fontFamily: "Pixelify Sans, sans-serif",
  fontSize: 12,
  fill: 0xffffff,
});
continuePrompt.x = app.screen.width / 2 - continuePrompt.width / 2;
continuePrompt.y = 420;

const showMessage = (text) => {
  messageShowing = true;

  messageText.text = text;
  messageText.x = app.screen.width / 2 - messageText.width / 2;
  messageText.y = app.screen.height / 2 - messageText.height / 2;

  app.stage.addChild(message);

  setTimeout(() => {
    message.addChild(continuePrompt);
    messageCanBeClosed = true;
  }, 1000);
};

const hideMessage = () => {
  message.removeChild(continuePrompt);
  app.stage.removeChild(message);

  messageShowing = false;
  messageCanBeClosed = false;
};

//ending messages
const endMessage1 = new PIXI.Text("You Win!", {
  fontFamily: "Pixelify Sans, sans-serif",
  fontSize: 48,
  fill: 0xffffff,
});
endMessage1.x = app.screen.width / 2 - endMessage1.width / 2;
endMessage1.y = 90;

const endMessage2 = new PIXI.Text("You escaped the dungeon", {
  fontFamily: "Pixelify Sans, sans-serif",
  fontSize: 24,
  fill: 0xffffff,
});
endMessage2.x = app.screen.width / 2 - endMessage2.width / 2;
endMessage2.y = 150;

const endMessage3 = new PIXI.Text(
  "Thanks for playing! Game design and build by Josh. Asset pack credit to Pixel_Poem",
  {
    fontFamily: "Pixelify Sans, sans-serif",
    fontSize: 24,
    fill: 0xffffff,
    wordWrap: true,
    wordWrapWidth: 600,
    align: "center",
  }
);
endMessage3.x = app.screen.width / 2 - endMessage3.width / 2;
endMessage3.y = 400;

//see current keys pressed
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

//keydowns
window.addEventListener("keydown", (e) => {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;

  switch (e.key) {
    case "w":
      keys.w = true;
      playerMoving = "up";
      break;
    case "a":
      keys.a = true;
      playerMoving = "left";
      break;
    case "s":
      keys.s = true;
      playerMoving = "down";
      break;
    case "d":
      keys.d = true;
      playerMoving = "right";
      break;
    case " ":
      pressSpace();
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w = false;
      break;
    case "a":
      keys.a = false;
      break;
    case "s":
      keys.s = false;
      break;
    case "d":
      keys.d = false;
      break;
  }

  if (!keys.w && !keys.a && !keys.s && !keys.d) {
    playerMoving = "no";
  }
});

const collisions = [];
const tempCollisions = [];
const interactions = [];

const jsonToRowArrays = (data, layerName) => {
  //pull layer data from JSON
  const allData = data.layers.filter((item) => item.name === layerName)[0].data;

  //separate all collision array into array of 'tile rows'
  const newArray = [];
  for (let i = 0; i < 50; i++) {
    const rowArray = allData.slice(i * 50, i * 50 + 50);
    newArray.push(rowArray);
  }

  return newArray;
};

//json importing
fetch("./assets/dungeon_game_map.json")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    //********** COLLISIONS **********//
    const collisionsArray = jsonToRowArrays(data, "Collisions");

    //store a collision obj in collisions for each block
    collisionsArray.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 148) {
          collisions.push({
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
          });
        }
      });
    });
    //
    //
    //
    //********** CRATES **********//
    const cratesArray = jsonToRowArrays(data, "Crates");
    const crateObjs = [];

    cratesArray.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 149) {
          crateObjs.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "crate",
            used: false,
            canBeFound: true,
          });
        }
      });
    });

    crateObjs.forEach((item, i) => {
      interactions.push({
        ...item,
        ...crateData[i],
      });
    });
    //
    //
    //
    //********** MAIN DOOR **********//
    const mainDoorArray = jsonToRowArrays(data, "Main Door");
    mainDoorArray.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 148) {
          tempCollisions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            open: false,
            type: "mainDoor",
          });
        } else if (item == 149) {
          interactions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "mainDoor",
            used: false,
            canBeFound: true,
            use: () => {
              if (mainDoorKey) {
                tempCollisions.forEach((item, i) => {
                  if (item.type === "mainDoor") {
                    tempCollisions[i].open = true;
                  }
                });
                //turn off interactions
                interactions.forEach((item, i) => {
                  if (item.type === "mainDoor") {
                    interactions[i].used = true;
                  }
                });

                app.stage.removeChild(mainDoor);

                showMessage(
                  "You lift the key to the lock and it flies out of your hand. It clicks into the padlock, which then shatters onto the ground. The bolt across the door begins to slide, and the door slowly creaks open."
                );
              } else if (gotKey) {
                showMessage(
                  "You try to put the large key in the lock... but you can't! It's as if the lock is repelling the key. Each time you try, the force get's stronger and stronger. The door remains locked"
                );
              } else {
                showMessage(
                  "A massive, old wooden door blocks your path. You try to pull the bolt across to open it, but it stays firmly locked in place by a strange glowing padlock"
                );
              }
            },
          });
        }
      });
    });
    //
    //
    //
    //********** SMALL DOOR 1 **********//
    const smallDoor1Array = jsonToRowArrays(data, "Small Door 1");
    smallDoor1Array.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 148) {
          tempCollisions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            open: false,
            type: "smallDoor1",
          });
        } else if (item == 149) {
          interactions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "smallDoor1",
            used: false,
            canBeFound: true,
            use: () => {
              if (smallDoor1Key || smallDoor2Key) {
                if (smallDoor1Key) {
                  //turn off temp collisions
                  tempCollisions.forEach((item, i) => {
                    if (item.type === "smallDoor1") {
                      tempCollisions[i].open = true;
                    }
                  });
                  //turn off interactions
                  interactions.forEach((item, i) => {
                    if (item.type === "smallDoor1") {
                      interactions[i].used = true;
                    }
                  });

                  app.stage.removeChild(smallDoor1);
                  if (smallDoor1Key && smallDoor2Key) {
                    showMessage(
                      "You try to unlock you door with one of the keys you found... It's a perfect fit! You unlock the door"
                    );
                  } else {
                    showMessage(
                      "You try to unlock you door with the key you found... It's a perfect fit! You unlock the door"
                    );
                  }
                } else {
                  showMessage(
                    "You try to unlock you door with the key you found, but it does not fit."
                  );
                }
              } else {
                showMessage("The door is locked shut.");
              }
            },
          });
        }
      });
    });
    //********** SMALL DOOR 2 **********//
    const smallDoor2Array = jsonToRowArrays(data, "Small Door 2");
    smallDoor2Array.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 148) {
          tempCollisions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            open: false,
            type: "smallDoor2",
          });
        } else if (item == 149) {
          interactions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "smallDoor2",
            used: false,
            canBeFound: true,
            use: () => {
              if (smallDoor1Key || smallDoor2Key) {
                if (smallDoor2Key) {
                  //turn off temp collisions
                  tempCollisions.forEach((item, i) => {
                    if (item.type === "smallDoor2") {
                      tempCollisions[i].open = true;
                    }
                  });
                  //turn off interactions
                  interactions.forEach((item, i) => {
                    if (item.type === "smallDoor2") {
                      interactions[i].used = true;
                    }
                  });

                  app.stage.removeChild(smallDoor2);
                  if (smallDoor1Key && smallDoor2Key) {
                    showMessage(
                      "You try to unlock you door with one of the keys you found... It's a perfect fit! You unlock the door"
                    );
                  } else {
                    showMessage(
                      "You try to unlock you door with the key you found... It's a perfect fit! You unlock the door"
                    );
                  }
                } else {
                  showMessage(
                    "You try to unlock you door with the key you found, but it does not fit."
                  );
                }
              } else {
                showMessage("The door is locked shut.");
              }
            },
          });
        }
      });
    });
    //
    //
    //
    //********** HIDDEN INTERACTIONS **********//
    const hiddenInteractionsArray = jsonToRowArrays(
      data,
      "Hidden Interactions"
    );
    const hiddenInteractionObjs = [];

    hiddenInteractionsArray.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 149) {
          hiddenInteractionObjs.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "hiddenInteraction",
            used: false,
          });
        }
      });
    });

    hiddenInteractionObjs.forEach((item, i) => {
      interactions.push({
        ...item,
        ...hiddenInteractionData[i],
      });
    });
    //
    //
    //
    //********** END GAME **********//
    const endGameArray = jsonToRowArrays(data, "End Game");

    endGameArray.forEach((row, i) => {
      row.forEach((item, j) => {
        if (item == 149) {
          interactions.push({
            id: i * 50 + (j + 1),
            x: j * 24 * gameScale,
            y: i * 24 * gameScale,
            type: "endGame",
            used: false,
          });
        }
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });

//looped keyframes
const loop = (delta) => {
  const proposedPlayerPosition = {
    x: playerPosition.x,
    y: playerPosition.y,
  };

  if (!messageShowing && gameStarted && !gameEnded) {
    keys.w && (proposedPlayerPosition.y -= 1 * movementSpeed);
    keys.a && (proposedPlayerPosition.x -= 1 * movementSpeed);
    keys.s && (proposedPlayerPosition.y += 1 * movementSpeed);
    keys.d && (proposedPlayerPosition.x += 1 * movementSpeed);
  }

  canMove = true;
  interactiveSpace = false;

  //checks if space about to move into is a collision block
  for (let i = 0; i < collisions.length; i++) {
    const currentCollision = collisions[i];

    if (collisionDetection(proposedPlayerPosition, currentCollision)) {
      canMove = false;
      break;
    }
  }

  //checks if space about to move into is a temp collision block
  for (let i = 0; i < tempCollisions.length; i++) {
    const currentTempCollision = tempCollisions[i];

    if (
      collisionDetection(proposedPlayerPosition, currentTempCollision) &&
      !currentTempCollision.open
    ) {
      canMove = false;
      break;
    }
  }

  //checks if current block is interactive
  const currentInteractiveTile = getInteractiveTile();

  if (currentInteractiveTile) {
    if (currentInteractiveTile.type === "endGame") {
      endGame();
    }

    !currentInteractiveTile.used &&
      currentInteractiveTile.canBeFound &&
      toggleInteractivePrompt(true);
    interactiveSpace = true;
  } else {
    toggleInteractivePrompt(false);
  }

  if (canMove || gameEnded) {
    gameEnded && (proposedPlayerPosition.x += 1 * movementSpeed);
    offset.x = -(proposedPlayerPosition.x - playerOffset.x);
    offset.y = -(proposedPlayerPosition.y - playerOffset.y);
    //update offset & player position

    //updated background
    map.x = offset.x;
    map.y = offset.y;
    screenCollisions.x = offset.x;
    screenCollisions.y = offset.y;
    mainDoor.x = offset.x + mainDoorOffset.x;
    mainDoor.y = offset.y + mainDoorOffset.y;
    smallDoor1.x = offset.x + smallDoor1Offset.x;
    smallDoor1.y = offset.y + smallDoor1Offset.y;
    smallDoor2.x = offset.x + smallDoor2Offset.x;
    smallDoor2.y = offset.y + smallDoor2Offset.y;

    //update player
    playerPosition.x = playerOffset.x - offset.x;
    playerPosition.y = playerOffset.y - offset.y;
  }
};

setInterval(() => {
  if (gameStarted) {
    if (gameEnded) {
      playerSpriteSheetPosition.y = 48 * gameScale;
      if (playerSpriteSheetPosition.x == 7 * 24 * gameScale) {
        playerSpriteSheetPosition.x = 0;
      } else {
        playerSpriteSheetPosition.x += 24 * gameScale;
      }
    } else if (playerMoving === "no") {
      playerSpriteSheetPosition.x = 0;
    } else {
      switch (playerMoving) {
        case "up":
          playerSpriteSheetPosition.y = 24 * gameScale;
          break;
        case "right":
          playerSpriteSheetPosition.y = 48 * gameScale;
          break;
        case "down":
          playerSpriteSheetPosition.y = 0;
          break;
        case "left":
          playerSpriteSheetPosition.y = 72 * gameScale;
          break;
      }
      if (playerSpriteSheetPosition.x == 7 * 24 * gameScale) {
        playerSpriteSheetPosition.x = 0;
      } else {
        playerSpriteSheetPosition.x += 24 * gameScale;
      }
    }

    characterSprite.x = -playerSpriteSheetPosition.x;
    characterSprite.y = -playerSpriteSheetPosition.y;
  }
}, 50);

const getInteractiveTile = () => {
  return interactions.filter((item) => {
    if (collisionDetection(playerPosition, item)) {
      return item;
    }
  })[0];
};

const collisionDetection = (playerPos, blockPos) => {
  if (
    playerPos.x + 24 * gameScale >=
      blockPos.x + collisionPlayerOffset.right * gameScale &&
    playerPos.x + collisionPlayerOffset.left * gameScale <=
      blockPos.x + 24 * gameScale &&
    playerPos.y + 24 * gameScale >=
      blockPos.y + collisionPlayerOffset.bottom * gameScale &&
    playerPos.y + collisionPlayerOffset.top * gameScale <=
      blockPos.y + 24 * gameScale
  ) {
    return true;
  } else {
    return false;
  }
};

const pressSpace = () => {
  //use interactive item
  const currentTile = getInteractiveTile();
  const i = interactions.findIndex((item) => item.id == currentTile?.id);

  if (interactiveSpace && !messageShowing && currentTile.canBeFound) {
    //if hidden interaction used, don't let it be used again
    if (
      !(interactions[i].type === "hiddenInteraction" && interactions[i].used) &&
      !(interactions[i].type === "smallDoor1" && interactions[i].used) &&
      !(interactions[i].type === "smallDoor2" && interactions[i].used) &&
      !(interactions[i].type === "mainDoor" && interactions[i].used)
    ) {
      //find index of interactive object

      currentTile.use();

      //set certain objs to used = true
      if (
        interactions[i].type === "crate" ||
        interactions[i].type === "hiddenInteraction"
      ) {
        interactions[i].used = true;
      }

      toggleInteractivePrompt(false);
    }
  }

  //handle closing message
  if (messageCanBeClosed) {
    hideMessage();

    if (mainDoorKey && !mergeMessageShown) {
      mergeMessageShown = true;
      showMessage(
        "The gem and the key attract to each other like magnets. You click the gem perfectly into the groove on the key's handle... The key glows bright and you can feel it trying to pull you to the east."
      );
    }
  }
};

const endGame = () => {
  gameEnded = true;

  setTimeout(() => {
    app.stage.addChild(endMessage1);
  }, 1500);
  setTimeout(() => {
    app.stage.addChild(endMessage2);
  }, 2500);
  setTimeout(() => {
    app.stage.addChild(endMessage3);
  }, 4000);
};
