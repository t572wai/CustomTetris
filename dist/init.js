// // ビジーwaitを使う方法
// function sleep(waitMsec) {
// 	var startMsec = new Date();
//
// 	// 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
// 	while (new Date() - startMsec < waitMsec);
// }
initDialogs();
$(document).on('click', '#startButton', () => {
    initTetris();
    startTetris();
});
$(document).on('touched', '#startButton', () => {
    initTetris();
    startTetris();
});
toMainMenu();
// $('#startButton').off()
// reset();
//
// startToAppearMinos();
