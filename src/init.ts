// // ビジーwaitを使う方法
// function sleep(waitMsec) {
// 	var startMsec = new Date();
//
// 	// 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
// 	while (new Date() - startMsec < waitMsec);
// }

initDialogs()

$(document).on('click','#startButton', () => {
	initTetris();
	startTetris()
})
//$(document).on('touched','#startButton', () => {
//	initTetris();
//	startTetris();
//})

$(document).on('click','#toKeyBindings', () => {
	toKeyBindings();
})

$(document).on('click','#fromKeyToMainMenu', () => {
	$(document).off('click', '.keyForAny');
	toMainMenu();
})
//$(document).on('touched','#fromKeyToMainMenu', () => {
//	toMainMenu();
//})

toMainMenu()

// $('#startButton').off()

// reset();
//
// startToAppearMinos();
