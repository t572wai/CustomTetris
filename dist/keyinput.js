let keyActions = {};
let longpresses = {};
let presseds = {};
let timers = {};
let intervalTimers = {};
function addKeyActions(code, keydownAc = function () { }, keyupAc = function () { }, longpressAc = function () { }, shortpressAc = function () { }, sec = 0, interval = 0) {
    longpresses[code] = false;
    longpresses[code] = false;
    // keyActions[code] = {'keydown':keydownAc, 'keyup':keyupAc, 'longpress':longpressAc, 'shortpress':shortpressAc}
    keyActions[code] = {};
    keyActions[code]['keydown'] = function (e) {
        console.log(e.keyCode);
        if (e.keyCode == code) {
            if (!presseds[code]) {
                keydownAc();
                longpresses[code] = false;
                presseds[code] = true;
                timers[code] = setTimeout(() => {
                    longpresses[code] = true;
                    longpressAc();
                    intervalTimers[code] = setInterval(longpressAc, interval);
                }, sec);
            }
        }
    };
    $(document).on('keydown.' + code, keyActions[code]['keydown']);
    keyActions[code]['keyup'] = function (e) {
        if (e.keyCode == code) {
            presseds[code] = false;
            clearTimeout(timers[code]);
            clearInterval(intervalTimers[code]);
            if (!longpresses[code]) {
                shortpressAc();
            }
            else {
                longpresses[code] = false;
            }
            keyupAc();
        }
    };
    $(document).on('keyup.' + code, keyActions[code]['keyup']);
}
function removeKeyActions(code) {
    $(document).off('keydown.' + code);
    $(document).off('keyup.' + code);
}
