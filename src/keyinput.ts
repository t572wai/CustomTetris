//let keyActions = new Map<number, Map<string, (e)=>void>>();
let longpresses = new Map<string, boolean>();
let presseds = new Map<string, boolean>();
let timers = new Map<string, any>();
let intervalTimers = new Map<string, any>();

export function addKeyActions(
		code: string,
		keydownAc: ()=>void = function () {},
		keyupAc: ()=>void = function () {},
		longpressAc: ()=>void = function () {},
		shortpressAc: ()=>void = function () {},
		sec: number = 0,
		interval: number = 0
	) {
	longpresses.set(code, false);
	longpresses.set(code, false);

	// keyActions[code] = {'keydown':keydownAc, 'keyup':keyupAc, 'longpress':longpressAc, 'shortpress':shortpressAc}
	//keyActions.set(code, new Map<string, (e)=>void>());

	//keyActions.set(code, keyActions.get(code).set('keydown', ));
	$(document).on('keydown.'+code, function (e) {
		console.log(e.key);
		if (e.key == code) {
			if (!presseds.get(code)) {
				keydownAc()
				longpresses.set(code, false);
				presseds.set(code, true);
				timers.set(code, setTimeout(() => {
					longpresses.set(code, true);
					longpressAc()
					intervalTimers.set(code, setInterval(longpressAc,interval))
				}, sec))
			}
		}
	})

	//keyActions.set(code, keyActions.get(code).set('keyup', ));
	$(document).on('keyup.'+code, function (e) {
		if (e.key == code) {
			presseds.set(code, false);
			clearTimeout(timers.get(code));
			clearInterval(intervalTimers.get(code))
			if (!longpresses.get(code)) {
				shortpressAc()
			} else {
				longpresses.set(code, false);
			}
			keyupAc()
		}
	})
}

export function removeKeyActions(code: string) {
	$(document).off('.'+code);
}
