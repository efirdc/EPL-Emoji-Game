import match1SoundFile1 from "../sounds/piece_destroy_1.ogg";
import match2SoundFile2 from "../sounds/piece_destroy_2.ogg";
import match3SoundFile3 from "../sounds/piece_destroy_3.ogg";
import match4SoundFile4 from "../sounds/piece_destroy_4.ogg";

import flipSoundFile1 from "../sounds/shift_1.ogg";
import flipSoundFile2 from "../sounds/shift_2.ogg";
import flipSoundFile3 from "../sounds/shift_3.ogg";
import flipSoundFile4 from "../sounds/shift_4.ogg";
import flipSoundFile5 from "../sounds/shift_5.ogg";
import flipSoundFile6 from "../sounds/shift_6.ogg";
import flipSoundFile7 from "../sounds/shift_7.ogg";

import winSoundFile from "../sounds/game_over.ogg";
import loadSoundFile from "../sounds/start_game.ogg";
import loseSoundFile from '../sounds/game_over_booch.ogg';

import starSoundFile1 from '../sounds/star1.mp3';
import starSoundFile2 from '../sounds/star2.mp3';
import starSoundFile3 from '../sounds/star3.mp3';
import starSoundFile4 from '../sounds/star4.mp3';
import starSoundFile5 from '../sounds/star5.mp3';

import absorbSoundFile from '../sounds/getmoney.ogg'

import zombieSoundFile from '../sounds/zombie.wav';
import vampireLaughSoundFile from '../sounds/vampirelaugh.mp3';
import chachingSoundFile from '../sounds/chaching.ogg';
import babyGiggleSoundFile from '../sounds/babygiggle.mp3';
import foodSizzlingSoundFile from '../sounds/foodsizzling.mp3';
import foodChoppingSoundFile from '../sounds/foodchopping.mp3';
import potsAndPansSoundFile from '../sounds/potsandpans.mp3';
import policeSirenSoundFile from '../sounds/policesiren.mp3';
import fireTruckHornSoundFile from '../sounds/firetruckhorn.mp3';
import sneezeSoundFile from '../sounds/sneeze.mp3';
import rocketLaunchSoundFile from '../sounds/rocketlaunch.mp3';
import electricGuitarSoundFile from '../sounds/electricguitar.mp3';

import catMeowSoundFile from '../sounds/catnoise.mp3';
import dogYelpSoundFile from '../sounds/dognoise.mp3';
import pigSquealSoundFile from '../sounds/pignoise.mp3';
import teethChatteringSoundFile from '../sounds/teethchattering.mp3';
import monkeyScreechSoundFile from '../sounds/monkeynoise.mp3';
import vomitSoundFile from '../sounds/vomitnoise.mp3';

import shockSoundFile from '../sounds/shortcircuit.wav';

import comboBreakerSoundFile from '../sounds/combobreaker.wav';

import {Howl} from "howler";

export default {
    flipSounds: [
        //new Howl({src: [flipSoundFile1]}),
        new Howl({src: [flipSoundFile2]}),
        new Howl({src: [flipSoundFile3]}),
        new Howl({src: [flipSoundFile4]}),
        new Howl({src: [flipSoundFile5]}),
        new Howl({src: [flipSoundFile6]}),
        new Howl({src: [flipSoundFile7]}),
    ],
    matchSounds: [
        new Howl({src: [match1SoundFile1]}),
        new Howl({src: [match2SoundFile2]}),
        new Howl({src: [match3SoundFile3]}),
        new Howl({src: [match4SoundFile4]}),
    ],

    winSound: new Howl({src: [winSoundFile]}),
    loadSound: new Howl({src: [loadSoundFile]}),
    loseSound: new Howl({src: [loseSoundFile]}),

    comboBonusSounds: {
        zombie: new Howl({src: [zombieSoundFile]}),
        vampireLaugh: new Howl({src: [vampireLaughSoundFile]}),
        chaching: new Howl({src: [chachingSoundFile]}),
        babyGiggle: new Howl({src: [babyGiggleSoundFile]}),
        foodSizzling: new Howl({src: [foodSizzlingSoundFile]}),
        foodChopping: new Howl({src: [foodChoppingSoundFile]}),
        potsAndPans: new Howl({src: [potsAndPansSoundFile]}),
        policeSiren: new Howl({src: [policeSirenSoundFile]}),
        fireTruckHorn: new Howl({src: [fireTruckHornSoundFile]}),
        sneeze: new Howl({src: [sneezeSoundFile]}),
        rocketLaunch: new Howl({src: [rocketLaunchSoundFile]}),
        electricGuitar: new Howl({src: [electricGuitarSoundFile]}),
    },

    afraidOfSounds : {
        catMeow: new Howl({src: [catMeowSoundFile]}),
        dogYelp: new Howl({src: [dogYelpSoundFile]}),
        pigSqueal: new Howl({src: [pigSquealSoundFile]}),
        teethChattering: new Howl({src: [teethChatteringSoundFile]}),
        monkeyScreech: new Howl({src: [monkeyScreechSoundFile]}),
        vomit: new Howl({src: [vomitSoundFile]}),
    },

    starSounds: [
        new Howl({src: starSoundFile1}),
        new Howl({src: starSoundFile2}),
        new Howl({src: starSoundFile3}),
        new Howl({src: starSoundFile4}),
        new Howl({src: starSoundFile5}),
    ],

    absorbSound: new Howl({src: absorbSoundFile}),

    shockSound: new Howl({src: shockSoundFile}),

    comboBreakerSound: new Howl({src: comboBreakerSoundFile}),
}
