//import * as deepEqual from "deep-equal";

//import { deepEqual } from "assert";

function cloneArray<T>(array: T[]): T[] {
	return array.concat();
}

function shuffle<T>(arrayTemp: T[]): T[] {
	let array = cloneArray<T>(arrayTemp)
	for(var i = array.length - 1; i > 0; i--){
			var r = Math.floor(Math.random() * (i + 1));
			var tmp = array[i];
			array[i] = array[r];
			array[r] = tmp;
	}
	return array;
}

const resetLogColor = '\u001b[0m';

const redLog = '\u001b[31m';
const greenLog = '\u001b[32m';

const aryMax = function (a: number, b: number): number {return Math.max(a,b);}
const aryMin = function (a: number, b: number): number {return Math.min(a,b);}
function maxArray(array: number[]): number {
	return array.reduce(aryMax);
}
function minArray(array: number[]): number {
	return array.reduce(aryMin);
}

function arrayEquals<T>(array1: T[],array2: T[]): boolean {
	return JSON.stringify(array1) == JSON.stringify(array2);
}

function equal(item1, item2): boolean {
	return JSON.stringify(item1) == JSON.stringify(item2);
}

function includesArray<T>(array: T[], elem: T): boolean {
	if (array.find((item) => equal(item,elem))) {
		return true;
	} else {
		return false;
	}
}
