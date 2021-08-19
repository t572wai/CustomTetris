let dv2Border = 5;

const Operations = ['left','right','hardDrop','softDrop','leftRotation','rightRotation','hold'] as const;
type Operate = typeof Operations[number];

const MethodsOfOpForTouch = ['swipe', 'button'] as const;
type MethodOfOpForTouch = typeof MethodsOfOpForTouch[number];
const MethodOfOpForTouchEnum: Enum<MethodOfOpForTouch> = {
	defArray: MethodsOfOpForTouch,
	toEnum: toMethodsOfOpForTouch,
	getTitle: getTitleOfMethodOfOpForTouch,
}
const MethodOfOpForTouchOption = new GameOption('methodOfOpForTouch', 0, MethodOfOpForTouchEnum);

function toMethodsOfOpForTouch(arg: any): MethodOfOpForTouch|undefined {
	if (typeof arg !== 'string') {
		return undefined
	}
	if (MethodsOfOpForTouch.includes(arg as MethodOfOpForTouch)) {
		return arg as MethodOfOpForTouch;
	}
	return undefined;
}
function toString(arg: MethodOfOpForTouch): string {
	console.log(arg,arg as string);
	return arg as string;
}
function getTitleOfMethodOfOpForTouch(arg: MethodOfOpForTouch): string {
	switch (arg) {
		case 'swipe':
			return 'スワイプ'

		case 'button':
			return 'ボタン';
	}
}

let keyBinding = new Map<Operate, string>();

document.oncontextmenu = function () {return false;}
document.body.oncontextmenu = () => {
	return false;
}
document.addEventListener('touchmove', function (e) {
	e.preventDefault();
}, {passive: false})

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
		case 'hold':
			addHoldActions(key);
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

function toOperate(str: string): Operate|undefined {
	if (Operations.includes(str as Operate)) {
		return str as Operate;
	} else {
		return undefined;
	}
}

$(document).on('click', '.keyForAny', (e1) => {
	const type_pre = $(e1.currentTarget).attr('id');
	//console.log(e1,type_pre);
	if (typeof type_pre === 'string') {
		const type = type_pre.slice(6);
		const type_lower = toLowerFirstLetter(type);
		const formerKey = keyBinding.get(toOperate(type_lower)!);
		if (typeof formerKey !== 'undefined') {
			removeKeyActions(formerKey);
		}
		$(document).off('.onClickKeyForAny');
		$(document).on('keydown.onClickKeyForAny', (e) => {
			const currentKey = e.key;
			$(document).off('.onClickKeyForAny');
			if (typeof currentKey === 'string') {
				//console.log(type,currentKey);
				const thisKeybinding = keyBinding.get(toOperate(type_lower)!)!;
				for (const iterator of keyBinding.entries()) {
					//console.log(iterator[1],currentKey,thisKeybinding);
					if (iterator[1]==currentKey) {
						console.log(iterator[0],'#keyFor'+toUpperFirstLetter(iterator[0]));
						removeKeyActions(currentKey);
						addKeyBinding(iterator[0], thisKeybinding);
						$('#keyFor'+toUpperFirstLetter(iterator[0])).text(thisKeybinding);
					}
				}
				addKeyBinding(type_lower, currentKey);
				$('#keyFor'+type).text(currentKey);
			}
		})
	}
})


setButtonActions('.buttonsToOperate[data-operate="left"]', 300, 50);
setButtonActions('.buttonsToOperate[data-operate="right"]', 300, 50);
setButtonActions('.buttonsToOperate[data-operate="softDrop"]');
setButtonActions('.buttonsToOperate[data-operate="hardDrop"]');
setButtonActions('.buttonsToOperate[data-operate="leftRotation"]');
setButtonActions('.buttonsToOperate[data-operate="rightRotation"]');
setButtonActions('.buttonsToOperate[data-operate="hold"]');

$(document).on('pressstart', '.buttonsToOperate[data-operate="left"]', (e) => {
	//console.log('pressstart');
	onLeft()
})
$(document).on('longpress', '.buttonsToOperate[data-operate="left"]', (e) => {
	//console.log('longpress');
	onLeft()
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="right"]', (e) => {
	//console.log('pressstart');
	onRight()
})
$(document).on('longpress', '.buttonsToOperate[data-operate="right"]', (e) => {
	//console.log('longpress');
	onRight()
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="softDrop"]', (e) => {
	onSoftDrop(true);
})
$(document).on('pressend', '.buttonsToOperate[data-operate="softDrop"]', (e) => {
	onSoftDrop(false);
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="hardDrop"]', (e) => {
	onHardDrop()
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="leftRotation"]', (e) => {
	onLeftRotation()
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="rightRotation"]', (e) => {
	onRightRotation()
})
$(document).on('pressstart', '.buttonsToOperate[data-operate="hold"]', (e) => {
	onHold()
})

function switchOperate(type:Operate, b?: boolean): void {
	switch(type) {
		case 'left':
			onLeft();
			break;
		case 'right':
			onRight();
			break;
		case 'softDrop':
			if (typeof b !== 'undefined') {
				onSoftDrop(b);
			}
			break;
		case 'hardDrop':
			onHardDrop();
			break;
		case 'leftRotation':
			onLeftRotation();
			break;
		case 'rightRotation':
			onRightRotation();
			break;
		case 'hold':
			onHold();
			break;
		default:
			break;
	}
}

$(document).on('swipedist', function (e, d, dv2) {
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

$(document).on('swipestart', function (e, d, dv2) {
	switch (d) {
		case 'up':
			onHold()
			break;
	}
})

$(document).on('longswipe', function (e, d, dv2) {
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

$(document).on('swipeend', function (e, d, dv2) {
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

$(document).on('touched', function (e, x, y) {
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
