function cloneArray(array) {
	return array.concat();
}

function shuffle(arrayTemp) {
	let array = cloneArray(arrayTemp)
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

const aryMax = function (a,b) {return Math.max(a,b);}
const aryMin = function (a,b) {return Math.min(a,b);}
function maxArray(array) {
	return array.reduce(aryMax);
}
function minArray(array) {
	return array.reduce(aryMin);
}

function arrayEquals(array1,array2) {
	return JSON.stringify(array1) == JSON.stringify(array2);
}

Array.prototype.includesArray = function(elem) {
	if (this.find((item) => arrayEquals(item,elem))) {
		return true;
	} else {
		return false;
	}
}
