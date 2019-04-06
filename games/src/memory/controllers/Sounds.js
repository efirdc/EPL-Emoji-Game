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
import timerSoundFile from '../sounds/general/timer.wav';
import magicSoundFile from '../sounds/general/magic.mp3';
import magicSoundFile2 from '../sounds/general/magic.wav';
import igniteSoundFile from '../sounds/general/ignite3.mp3';
import fireSmallSoundFile from '../sounds/general/fire_small.mp3';
import fireLargeSoundFile from '../sounds/general/fire_large.mp3';

// Afraid of sounds
import pigSquealSoundFile from '../sounds/afraid_of/pignoise.mp3';
import screamSoundFile from '../sounds/afraid_of/scream.wav';
import screamWhilhelmSoundFile from '../sounds/afraid_of/scream2.wav';
import catMeowSoundFile from '../sounds/afraid_of/catnoise.mp3';
import dogYelpSoundFile from '../sounds/afraid_of/dognoise.mp3';
import teethChatteringSoundFile from '../sounds/afraid_of/teethchattering.mp3';
import monkeyScreechSoundFile from '../sounds/afraid_of/monkeynoise.mp3';
import vomitSoundFile from '../sounds/afraid_of/vomitnoise.mp3';
import nerdSoundFile from '../sounds/afraid_of/nerdnoise.mp3';
import christmasBellsSoundFile from '../sounds/afraid_of/christmasbells.mp3';

// Combo bonus sounds
import zombieSoundFile from '../sounds/combo_bonus/zombie.wav';
import vampireLaughSoundFile from '../sounds/combo_bonus/vampirelaugh.mp3';
import chachingSoundFile from '../sounds/combo_bonus/chaching.ogg';
import babyGiggleSoundFile from '../sounds/combo_bonus/babygiggle.mp3';
import weddingMarchSoundFile from '../sounds/combo_bonus/weddingmarch.mp3';
import weddingSoundFile from '../sounds/combo_bonus/wedding.wav';
import policeSirenSoundFile from '../sounds/combo_bonus/policesiren.mp3';
import ufoSoundFile from '../sounds/combo_bonus/ufo.mp3';
import fireTruckSoundFile from '../sounds/combo_bonus/firetruck.wav';
import defibrillatorSoundFile from '../sounds/combo_bonus/defibrillator.mp3';
import rocketLaunchSoundFile from '../sounds/combo_bonus/rocketlaunch.mp3';

// Chef combo bonus sounds
import foodSizzlingSoundFile from '../sounds/combo_bonus/chef/foodsizzling.mp3';
import foodChoppingSoundFile from '../sounds/combo_bonus/chef/foodchopping.mp3';
import foodWhiskingSoundFile from '../sounds/combo_bonus/chef/foodwhisking.mp3';

// Musician combo bonus sounds
import saxophoneSoundFile from '../sounds/combo_bonus/musician/saxophone.wav';
import electricGuitarSoundFile from '../sounds/combo_bonus/musician/electricguitar.mp3';
import trumpetSoundFile from '../sounds/combo_bonus/musician/trumpet.wav';
import violinSoundFile from '../sounds/combo_bonus/musician/violin.wav';
import drumSoundFile from '../sounds/combo_bonus/musician/drum.mp3';

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
        babyGiggle: new Howl({src: [babyGiggleSoundFile], volume: 0.5}),
        policeSiren: new Howl({src: [policeSirenSoundFile], volume: 0.5}),
        fireTruck: new Howl({src: [fireTruckSoundFile], volume: 0.6}),
        rocketLaunch: new Howl({src: [rocketLaunchSoundFile], volume: 0.2}),
        wedding: new Howl({src: [weddingSoundFile], volume: 0.4}),
        //weddingMarch: new Howl({src: [weddingMarchSoundFile]}),
        ufo: new Howl({src: [ufoSoundFile], volume: 0.3}),
        defibrillator: new Howl({src: [defibrillatorSoundFile], volume: 0.1}),

        foodSizzling: new Howl({src: [foodSizzlingSoundFile]}),
        //foodChopping: new Howl({src: [foodChoppingSoundFile]}),
        //foodWhisking: new Howl({src: [foodWhiskingSoundFile]}),

        saxophone: new Howl({src: [saxophoneSoundFile], volume: 0.3}),
        electricGuitar: new Howl({src: [electricGuitarSoundFile]}),
        drum: new Howl({src: [drumSoundFile], volume: 0.3}),
        trumpet: new Howl({src: [trumpetSoundFile], volume: 0.15}),
        violin: new Howl({src: [violinSoundFile], volume: 0.15}),
    },

    afraidOfSounds : {
        catMeow: new Howl({src: [catMeowSoundFile]}),
        dogYelp: new Howl({src: [dogYelpSoundFile]}),
        pigSqueal: new Howl({src: [pigSquealSoundFile], volume: 0.25}),
        teethChattering: new Howl({src: [teethChatteringSoundFile], volume: 0.25}),
        christmasBells: new Howl({src: [christmasBellsSoundFile], volume: 0.25}),
        monkeyScreech: new Howl({src: [monkeyScreechSoundFile], volume: 0.25}),
        vomit: new Howl({src: [vomitSoundFile], volume: 0.25}),

        scream: new Howl ({src: [screamSoundFile], volume: 0.25}),
        screamWhilhelm: new Howl ({src: [screamWhilhelmSoundFile], volume: 0.25}),
        nerd: new Howl({src: [nerdSoundFile], volume: 0.3}),
    },

    starSounds: [
        new Howl({src: starSoundFile1}),
        new Howl({src: starSoundFile2}),
        new Howl({src: starSoundFile3}),
        new Howl({src: starSoundFile4}),
        new Howl({src: starSoundFile5}),
    ],

    timerSound: new Howl({src: timerSoundFile}),
    absorbSound: new Howl({src: absorbSoundFile, volume: 0.3}),
    shockSound: new Howl({src: shockSoundFile}),
    comboBreakerSound: new Howl({src: comboBreakerSoundFile}),
    igniteSound: new Howl({src: igniteSoundFile}),
    magicSound: new Howl({src: magicSoundFile}),
    magicSound2: new Howl({src: magicSoundFile2}),
    fireSmallSound: new Howl({src: fireSmallSoundFile, loop: true}),
    fireLargeSound: new Howl({src: fireLargeSoundFile, loop: true}),
}
