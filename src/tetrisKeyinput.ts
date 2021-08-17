let dv2Border = 5;

let keyBinding = new Map<string, string>();

function addRightKeyActions(key: string): void {
	addKeyActions(key, onRight, () => {}, onRight, () => {}, 300, 50);
	keyBinding.set('right', key);
}

function addLeftKeyActions(key:string) {
	addKeyActions(key, onLeft, () => {}, onLeft, () => {}, 300, 50);
	keyBinding.set('left', key);
}

function addHardDropKeyActions(key:string) {
	addKeyActions(key, onHardDrop)
	keyBinding.set('hardDrop', key);
}

function addSoftDropKeyActions(key:string) {
	addKeyActions(key, onSoftDrop.bind(null,true), onSoftDrop.bind(null,false))
	keyBinding.set('softDrop', key);
}

function addLeftRotationActions(key:string) {
	addKeyActions(key, onLeftRotation)
	keyBinding.set('leftRotation', key);
}

function addRightRotationActions(key:string) {
	addKeyActions(key, onRightRotation)
	keyBinding.set('rightRotation', key);
}

function addHoldActions(key:string) {
	addKeyActions(key, onHold)
	keyBinding.set('hold', key);
}

function addKeyBinding(type:string, key:string) {
	switch (type) {
		case 'left':
			addLeftKeyActions(key);
			break;
		case 'right':
			addRightKeyActions(key)
			break;
		case 'softDrop':
			addSoftDropKeyActions(key);
			break;
		case 'hardDrop':
			addHardDropKeyActions(key);
			break;
		case 'leftRotation':
			addLeftRotationActions(key);
			break;
		case 'rightRotation':
			addRightRotationActions(key);
			break;
		default:
			break;
	}
}

addRightKeyActions('d');
addLeftKeyActions('a');
addHardDropKeyActions('w');
addSoftDropKeyActions('s');
addLeftRotationActions('ArrowLeft');
addRightRotationActions('ArrowRight');
addHoldActions('Shift');

$(document).on('click', '.keyForAny', {"self": this},(e1) => {
	const type_pre = $(e1.data.self).attr('id');
	console.log(e1.data.self,type_pre);
	if (typeof type_pre === 'string') {
		const type = type_pre.slice(6)
		const formerKey = keyBinding.get(type);
		if (typeof formerKey !== 'undefined') {
			removeKeyActions(formerKey);
		}
		$(document).on('keydown', (e) => {
			const currentKey = e.key;
			$(document).off('keydown');
			console.log(type,currentKey);
			addKeyBinding(type, currentKey);
			$('#keyFor'+type).text(currentKey);
		})
	}
})

$(this).on('swipedist', function (e, d, dv2) {
	console.log(d);
	switch (d) {
		case 'left':
			onLeft()
			break;
		case 'right':
			onRight()
			break;
	}
})

$(this).on('swipestart', function (e, d, dv2) {
	switch (d) {
		case 'up':
			onHold()
			break;
	}
})

$(this).on('longswipe', function (e, d, dv2) {
	//console.log(redLog + dv2 + resetLogColor);
	// console.log(greenLog + d + resetLogColor);
	if (d != "down") {
		onSoftDrop(false)
	}
	switch (d) {
		case 'down':
			onSoftDrop(true)
			break;
		case 'up':
			onHold()
			break;
	}
})

$(this).on('swipeend', function (e, d, dv2) {
	//console.log(redLog + dv2 + resetLogColor);
	onSoftDrop(false)
	switch (d) {
		case 'down':
			if (dv2 > dv2Border) {
				onHardDrop()
			}
			break;
		case 'up':
			onHold()
			break;
	}
})

$(this).on('touched', function (e, x, y) {
	console.log(x,y);
	if (x>300) {
		onRightRotation()
	} else {
		onLeftRotation()
	}
})


function onLeft() {
	moveToLeft(function (b) {
		// if(b)restartFall()
	})
}

function onRight() {
	moveToRight(function (b) {
		// if(b)restartFall()
	})
}

function onSoftDrop(b: boolean) {
	softDrop(b)
}

function onHardDrop() {
	hardDrop()
}

function onRightRotation() {
	rightRotation()
}

function onLeftRotation() {
	leftRotation()
}

function onHold() {
	hold()
}
