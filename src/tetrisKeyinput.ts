let dv2Border = 5;

	// setSwiper(document)

	// addKeyActions(39, onRight, () => {}, onRight, () => {}, 300, 50)
	addKeyActions('d', onRight, () => {}, onRight, () => {}, 300, 50)
	// addKeyActions(37, onLeft, () => {}, onLeft, () => {}, 300, 50)
	addKeyActions('a', onLeft, () => {}, onLeft, () => {}, 300, 50)
	addKeyActions('ArrowUp', onHardDrop)
	addKeyActions('w', onHardDrop)
	addKeyActions('ArrowDown', onSoftDrop.bind(null,true), onSoftDrop.bind(null,false))
	addKeyActions('s', onSoftDrop.bind(null,true), onSoftDrop.bind(null,false))

	addKeyActions('ArrowLeft', onLeftRotation)
	addKeyActions('ArrowRight', onRightRotation)

	addKeyActions('Shift', onHold)

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
		console.log(redLog + dv2 + resetLogColor);
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
		console.log(redLog + dv2 + resetLogColor);
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

function onSoftDrop(b) {
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
