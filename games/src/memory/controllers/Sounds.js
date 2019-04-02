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

import chachingSoundFile from '../sounds/chaching.ogg';

import rocketLaunchSoundFile from '../sounds/rocketlaunch.mp3';

//Afraid of sounds
import dogWhimperSoundFile from '../sounds/pupwhimper.wav';

import PigSqueelSoundFile from '../sounds/PigSqueel.wav';

import catMeowSoundFile from '../sounds/catnoise.mp3';

import monkeyScreechSoundFile from '../sounds/monkeynoise.ogg';

import screamSoundFile from '../sounds/Scream.wav';

//combo sounds
import altoSaxSoundFile from '../sounds/Alto Sax.mp3';
import fireTruckSoundFile from '../sounds/Fire Truck.wav';
import guitarSoundFile from '../sounds/Guitar.wav';
import draculaSoundFile from '../sounds/I Am Dracula.wav';
import kidLaughSoundFile from '../sounds/Kid_Laugh.wav';
import snareDrumSoundFile from '../sounds/Snare Drum.mp3';
import trumpetSoundFile from '../sounds/trumpet.wav';
import violinSoundFile from '../sounds/Violin.mp3';
import zombieSoundFile from '../sounds/Zombie Moan.wav';

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
        chaching: new Howl({src: [chachingSoundFile]}),
        rocketLaunch: new Howl({src: [rocketLaunchSoundFile]}),
        altoSax: new Howl({src: [altoSaxSoundFile]}),
        fireTruck: new Howl({src: [fireTruckSoundFile]}),
        guitar: new Howl({src: [guitarSoundFile]}),
        dracula: new Howl({src: [draculaSoundFile]}),
        kidLaugh: new Howl({src: [kidLaughSoundFile]}),
        snareDrum: new Howl({src: [snareDrumSoundFile]}),
        trumpet: new Howl({src: [snareDrumSoundFile]}),
        violin: new Howl({src: [violinSoundFile]}),
        zombie: new Howl({src: [zombieSoundFile]})
    },

    afraidOfSounds : {
        catMeow: new Howl({src: [catMeowSoundFile]}),
        monkeyScreech: new Howl({src: [monkeyScreechSoundFile]}),
        dogWhimper: new Howl ({src: [dogWhimperSoundFile]}),
        pigSqueel: new Howl ({src: [PigSqueelSoundFile]}),
        scream: new Howl ({src: [screamSoundFile]})
    },

    starSounds: [
        new Howl({src: starSoundFile1}),
        new Howl({src: starSoundFile2}),
        new Howl({src: starSoundFile3}),
        new Howl({src: starSoundFile4}),
        new Howl({src: starSoundFile5}),
    ],

    absorbSound: new Howl({src: absorbSoundFile}),
}
