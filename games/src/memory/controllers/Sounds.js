import match1SoundFile1 from "../sounds/general/piece_destroy_1.ogg";
import match2SoundFile2 from "../sounds/general/piece_destroy_2.ogg";
import match3SoundFile3 from "../sounds/general/piece_destroy_3.ogg";
import match4SoundFile4 from "../sounds/general/piece_destroy_4.ogg";

import flipSoundFile1 from "../sounds/general/shift_1.ogg";
import flipSoundFile2 from "../sounds/general/shift_2.ogg";
import flipSoundFile3 from "../sounds/general/shift_3.ogg";
import flipSoundFile4 from "../sounds/general/shift_4.ogg";
import flipSoundFile5 from "../sounds/general/shift_5.ogg";
import flipSoundFile6 from "../sounds/general/shift_6.ogg";
import flipSoundFile7 from "../sounds/general/shift_7.ogg";

import winSoundFile from "../sounds/general/game_over.ogg";
import loadSoundFile from "../sounds/general/start_game.ogg";
import loseSoundFile from '../sounds/general/game_over_booch.ogg';

import starSoundFile1 from '../sounds/general/star1.mp3';
import starSoundFile2 from '../sounds/general/star2.mp3';
import starSoundFile3 from '../sounds/general/star3.mp3';
import starSoundFile4 from '../sounds/general/star4.mp3';
import starSoundFile5 from '../sounds/general/star5.mp3';

import shockSoundFile from '../sounds/general/shortcircuit.wav';
import comboBreakerSoundFile from '../sounds/general/combobreaker.wav';
import absorbSoundFile from '../sounds/general/getmoney.ogg'
import timerSoundFile from '../sounds/general/timer.mp3';
import igniteSoundFile from '../sounds/general/ignite.mp3';

// Afraid of sounds
import dogWhimperSoundFile from '../sounds/afraid_of/pupwhimper.wav';
import pigSquealSoundFile from '../sounds/afraid_of/pignoise.mp3';
import pigSquealSoundFile2 from '../sounds/afraid_of/PigSqueel.wav';
import screamSoundFile from '../sounds/afraid_of/scream.wav';
import catMeowSoundFile from '../sounds/afraid_of/catnoise.mp3';
import dogYelpSoundFile from '../sounds/afraid_of/dognoise.mp3';
import teethChatteringSoundFile from '../sounds/afraid_of/teethchattering.mp3';
import monkeyScreechSoundFile from '../sounds/afraid_of/monkeynoise.mp3';
import vomitSoundFile from '../sounds/afraid_of/vomitnoise.mp3';
import nerdSoundFile from '../sounds/afraid_of/nerdnoise.mp3';

// Combo bonus sounds
import zombieSoundFile from '../sounds/combo_bonus/zombie.wav';
import vampireLaughSoundFile from '../sounds/combo_bonus/vampirelaugh.mp3';
import chachingSoundFile from '../sounds/combo_bonus/chaching.ogg';
import babyGiggleSoundFile from '../sounds/combo_bonus/babygiggle.mp3';
import policeSirenSoundFile from '../sounds/combo_bonus/policesiren.mp3';
import fireTruckHornSoundFile from '../sounds/combo_bonus/firetruckhorn.mp3';
import rocketLaunchSoundFile from '../sounds/combo_bonus/rocketlaunch.mp3';
import fireTruckSoundFile from '../sounds/combo_bonus/Fire Truck.wav';
import draculaSoundFile from '../sounds/combo_bonus/I Am Dracula.wav';
import kidLaughSoundFile from '../sounds/combo_bonus/Kid_Laugh.wav';
import sneezeSoundFile from '../sounds/combo_bonus/sneeze.mp3';

// Chef combo bonus sounds
import foodSizzlingSoundFile from '../sounds/combo_bonus/chef/foodsizzling.mp3';
import foodChoppingSoundFile from '../sounds/combo_bonus/chef/foodchopping.mp3';
import potsAndPansSoundFile from '../sounds/combo_bonus/chef/potsandpans.mp3';

// Musician combo bonus sounds
import altoSaxSoundFile from '../sounds/combo_bonus/musician/Alto Sax.mp3';
import guitarSoundFile from '../sounds/combo_bonus/musician/Guitar.wav';
import electricGuitarSoundFile from '../sounds/combo_bonus/musician/electricguitar.mp3';
import snareDrumSoundFile from '../sounds/combo_bonus/musician/Snare Drum.mp3';
import trumpetSoundFile from '../sounds/combo_bonus/musician/trumpet.wav';
import violinSoundFile from '../sounds/combo_bonus/musician/Violin.mp3';


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

        altoSax: new Howl({src: [altoSaxSoundFile]}),
        fireTruck: new Howl({src: [fireTruckSoundFile]}),
        guitar: new Howl({src: [guitarSoundFile]}),
        dracula: new Howl({src: [draculaSoundFile]}),
        kidLaugh: new Howl({src: [kidLaughSoundFile]}),
        snareDrum: new Howl({src: [snareDrumSoundFile]}),
        trumpet: new Howl({src: [trumpetSoundFile]}),
        violin: new Howl({src: [violinSoundFile]}),
    },

    afraidOfSounds : {
        catMeow: new Howl({src: [catMeowSoundFile]}),
        dogYelp: new Howl({src: [dogYelpSoundFile]}),
        pigSqueal: new Howl({src: [pigSquealSoundFile]}),
        teethChattering: new Howl({src: [teethChatteringSoundFile]}),
        monkeyScreech: new Howl({src: [monkeyScreechSoundFile]}),
        vomit: new Howl({src: [vomitSoundFile]}),

        dogWhimper: new Howl ({src: [dogWhimperSoundFile]}),
        scream: new Howl ({src: [screamSoundFile]}),
        nerd: new Howl({src: [nerdSoundFile]}),
    },

    starSounds: [
        new Howl({src: starSoundFile1}),
        new Howl({src: starSoundFile2}),
        new Howl({src: starSoundFile3}),
        new Howl({src: starSoundFile4}),
        new Howl({src: starSoundFile5}),
    ],

    timerSound: new Howl({src: timerSoundFile}),
    absorbSound: new Howl({src: absorbSoundFile}),
    shockSound: new Howl({src: shockSoundFile}),
    comboBreakerSound: new Howl({src: comboBreakerSoundFile}),
    igniteSound: new Howl({src: igniteSoundFile}),
}
