let pressTimer = new Map<string, NodeJS.Timer>();
let pressInterval = new Map<string, NodeJS.Timer>();
let pressDidLongpressed = new Map<string, boolean>();

function setButtonActions(obj: string, waitSec: number, intervalSec: number) {
	let target = $(obj);
	target.on('mousedown touchstart' , function (e) {
		target.trigger('pressstart');
		pressDidLongpressed.set(obj, false);
		console.log('pressstart');
		pressTimer.set(obj, setTimeout(function () {
			target.trigger('longpress');
			pressDidLongpressed.set(obj, true);
			pressInterval.set(obj, setInterval(function () {
				console.log('longpress');
				target.trigger('longpress')
			}, intervalSec))
		}, waitSec))
	})

	target.on('mouseup touchend', function (e) {
		target.trigger('pressend');
		if (pressDidLongpressed.get(obj)) {
			target.trigger('shortpress');
		}
		clearTimeout(pressTimer.get(obj)!);
		clearInterval(pressInterval.get(obj)!);
	})
}
