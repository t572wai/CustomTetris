let pressTimer = new Map<string, NodeJS.Timer>();
let pressInterval = new Map<string, NodeJS.Timer>();
let pressDidLongpressed = new Map<string, boolean>();

function setButtonActions(obj: string, waitSec: number, intervalSec: number) {
	//let target = $(obj);
	//console.log(obj,target);
	$(document).on('mousedown touchstart', obj, function (e) {
		//target.trigger('pressstart');
		$(document).trigger('pressstart', obj);
		pressDidLongpressed.set(obj, false);
		console.log('pressstart');
		pressTimer.set(obj, setTimeout(function () {
			//target.trigger('longpress');
			$(document).trigger('longpress', obj);
			pressDidLongpressed.set(obj, true);
			pressInterval.set(obj, setInterval(function () {
				console.log('longpress');
				$(document).trigger('longpress', obj);
				//target.trigger('longpress')
			}, intervalSec))
		}, waitSec))
	})

	$(document).on('mouseup touchend', obj, function (e) {
		//target.trigger('pressend');
		$(document).trigger('pressend', obj);
		if (pressDidLongpressed.get(obj)) {
			//target.trigger('shortpress');
			$(document).trigger('shortpress', obj);
		}
		clearTimeout(pressTimer.get(obj)!);
		clearInterval(pressInterval.get(obj)!);
	})
}
