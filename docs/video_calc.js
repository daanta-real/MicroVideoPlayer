
// 비디오 함수 중 순수 연산 관련된 것만 모음
vid.calc = {};

// 초를 입력하면 분:초 형태로 되돌려주는 함수
vid.calc.convertToMinAndSecStr = function(sec) {
    return Math.floor(sec / 60) + ":" + $$.numberPad(Math.floor((sec - Math.floor(sec / 60) * 60)), 2);
};

// 비디오 객체의 현재 재생위치 관련 정보를 회신해 주는 함수
vid.calc.getCurrVidPos = function() {
    const currPosRaw = Math.floor(vid.el.screen.currentTime); // 초
    const fullPosRaw = Math.floor(vid.el.screen.duration); // 초
    const currPosTimeStr = vid.calc.convertToMinAndSecStr(currPosRaw); // 분:초
    const fullPosTimeStr = vid.calc.convertToMinAndSecStr(fullPosRaw); // 분:초
    const playedTimeStr = currPosTimeStr + " / " + fullPosTimeStr; // 분:초 / 분:초
    const playedPercStr = currPosRaw / fullPosRaw * 100; // 재생위치(%)
    const info = {
        currPosRaw: currPosRaw,
        fullPosRaw: fullPosRaw,
        currPosTimeStr: currPosTimeStr,
        fullPosTimeStr: fullPosTimeStr,
        playedTimeStr: playedTimeStr,
        playedPercStr: playedPercStr
    };
    return info;
};

// 현재 마우스 위치와 전체 바 길이를 이용, 재생위치를 알아냄
vid.calc.getNewCurrentTimeByMousePos = function() {
    const currPoint = e.offsetX;
    const fullWidth = vid.el.guage_full.offsetWidth;
    const perc = currPoint / fullWidth;
    const newTime = vid.el.screen.duration * perc;
    console.log("currPoint / full = ", currPoint + " / " + fullWidth, "\n=> perc = " + perc + " (newtime = " + newTime);
}

// 마우스 절대위치를 받아, 그에 해당하는 재생위치를 계산하여 퍼센티지(0 ~ 1)로 회신해 주는 함수
vid.calc.getCurrHoveredPerc = function(currClientX) {
    const rectObj = vid.el.guage_full.getBoundingClientRect(); // px
    const width = rectObj.width;
    const x = currClientX - rectObj.left;
    let perc = x / width;
    return perc > 1 ? 1
            : perc < 0 ? 0
            : perc;
};
