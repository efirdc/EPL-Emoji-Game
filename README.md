# CMPT 395 : EPL Memory Game

The game can be played at https://macewancs.github.io/w19Lovelace/

## How to Play

This game was designed for large touch tables, but if you are playing with a mouse 
you can shift-click to add and remove fake touch points. There are also a number of
cheat hotkeys:

`1` - Toggle the max flip limit.  
`2` - Touch every card.  
`5` - Win the level and add 5 stars.  
`6` - Lose the level.  
`8` - Add 5 seconds to the timer.  
`9` - Subtract 5 seconds from the timer.  
`t` - Toggle the twitter Emojis. Use these if your system doesn't display Emoji's properly.

## About

Write me.

## How to Build

The games are built to run off of Electron, which packages web code into a desktop application.

To setup the project follow these steps:
1. Install node and npm (http://nodejs.org/)
2. Clone this repo
3. `cd games`
4. `npm install`

To run locally use `npm run start`.  
To create a build use `npm run build`. The build will be available in the `/games/build` folder.  
To package the last build as an electron application use `npm run electron-packager`.