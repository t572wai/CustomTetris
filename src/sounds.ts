//import { Howl } from "howler";

//// import {Howl} from 'howler';
////
//// const sound = new Howl({
//// 	src: 'sound/lockDownSE.mp3'
//// })




import { Howl, Howler } from 'howler';
//const howler = require('howler');

export const lockDownSound = new Howl({
	src: [
		"sounds/lockDownSE.mp3",
	]
});

export const startSound = new Howl({
	src: [
		"sounds/startSound.mp3",
	]
})
