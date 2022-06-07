
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

// 현재 마우스 위치와 전체 재생바 길이를 이용, 마우스에 해당하는 재생시간점을 알아냄
vid.calc.guagePercentByMouse = function(e) {

    // 재생바 너비
    const barSize = vid.el.guage_full.offsetWidth;
    
    // 재생바 왼쪽 끝 지점
    const rect = vid.el.guage_full.getBoundingClientRect();
    const barStart = rect.left + window.scrollX;

    // 마우스의 재생바의 위치%
    const currMousePosOnBar = e.pageX - barStart;
    let perc = currMousePosOnBar / barSize;
    if(perc > 1) perc = 1;
    else if(perc < 0) perc = 0;

    return perc;

}

// 현재 마우스위치에 해당하는 새 재생시간을 구함
vid.calc.getTimeByPerc = function(e) {
    const perc = vid.calc.guagePercentByMouse(e);
    let newTime = vid.el.screen.duration * perc;
    return newTime;
}

// 현재 마우스 위치와 전체 볼륨바 길이를 이용, 마우스에 해당하는 볼륨비율을 알아냄
vid.calc.volumePercentByMouse = function(e) {

    // 볼륨바 너비
    const barSize = vid.el.volume_full.offsetWidth;
    
    // 볼륨바 왼쪽 끝 지점
    const rect = vid.el.volume_full.getBoundingClientRect();
    const barStart = rect.left + window.scrollX;

    // 마우스의 볼륨바의 위치%
    const currMousePosOnBar = e.pageX - barStart;
    let perc = currMousePosOnBar / barSize;
    if(perc > 1) perc = 1;
    else if(perc < 0) perc = 0;

    return perc;

}
