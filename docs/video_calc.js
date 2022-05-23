
// 비디오 함수 중 순수 연산 관련된 것만 모음
vid.Math = {};

// 키보드 입력에 따라 이벤트 실행
// IE에서는 e.code를 지원하지 않으므로, 이벤트에 들어간 키보드 키를 크로스브라우징 이슈 없이 검출하려면 e.keyCode의 숫자로 해야 한다.
vid.func.keyHandlr = function(e) {

    // 단축키 발동이 가능한 곳인지를 검사하여, 불가능 시 리턴함
    if(!$$.isKeyInputAvailable(e)) return;
    
    // 키 맵핑 리스트에 있는 키가 눌렸을 경우 해당 함수를 실행
    for(let i = 0; i < vid.handlrList.length; i++) {
        const info = vid.handlrList[i];
        const keyCode = info[1], executer = info[2];
        if(keyCode == null) continue; // 키입력 아예 안 받는 리스너는 제낌
        if(e.keyCode == keyCode) { // 리스너 맵에 해당되는 키보드입력이 들어왔을 경우
            // 버블링 방지 3단콤보
            e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;

            executer();
            vid.func.closeSpeedMenu();
            return;
        }
    }

};

// ESC키를 눌렀을 때 동작. 풀스크린 모드를 해제하고, 배속 창을 닫는다.
vid.func.escKeyHandlr = function() {
    console.log("ESC");
    vid.el.container.classList.remove("fullScreen");
    vid.func.closeSpeedMenu();
};

// 재생 토글
vid.func.togglePlay = function() {

    // 관련 엘리먼트 선언
    const isPaused = vid.el.screen.paused;
    const btnEl = vid.el.btn_play;
    const iconEl = vid.el.icon_play;

    // 정지 시에는 재생시킴
    if(!isPaused) {
        // 실제 비디오 상태 전환
        vid.el.screen.pause();
        // 컨트롤바 아이콘
        btnEl.classList.remove("xi-pause");
        btnEl.classList.add("xi-play");
        animate_heartbeat(btnEl);
        // 중앙 아이콘
        iconEl.classList.remove("xi-play");
        iconEl.classList.add("xi-pause");
        animate_pop_run(vid.el.icon_play);
    }

    // 재생 시에는 정지시킴
    else {
        // 실제 비디오 상태 전환
        vid.el.screen.play();
        // 컨트롤바 아이콘
        btnEl.classList.remove("xi-play");
        btnEl.classList.add("xi-pause");
        animate_heartbeat(btnEl);
        // 중앙 아이콘
        iconEl.classList.remove("xi-pause");
        iconEl.classList.add("xi-play");
        animate_pop_run(vid.el.icon_play);
    }

    console.log("재생/정지 토글");

};

// 반복기능 갱신. 실상 토글기능이지만, input태그 체크상태 보고 그대로 반영하는 식으로 토글하므로 갱신이란 표현을 썼음
vid.func.refreshLoopMode = function() {
    vid.stats.loop = vid.stats.loop == true ? false : true; // 환경변수 바꿈
    const el = vid.el.btn_loop_input;
    const chkStat = vid.stats.loop;

    // 현재 체크박스의 체크 값이 timeout 없이는 안 바뀌는 에러가 있으므로 주의한다.
    setTimeout(function() {
        vid.el.btn_loop_input.setAttribute("checked", chkStat);
        vid.el.btn_loop_input.checked = chkStat;
        vid.el.screen.setAttribute("loop", chkStat);
        vid.el.screen.loop = chkStat;
        animate_heartbeat(vid.el.btn_loop_label);
    }, 0);
};

// 풀스크린 토글
vid.func.toggleFullscreen = function() {
    $$.classToggle(vid.el.container, "fullScreen");
    console.log("풀스크린 토글");
};

// 특정 시점으로 이동
vid.func.jumpTo = function(timeTo) {
    const duration = vid.el.screen.duration;
    const newTime = timeTo;
    vid.el.screen.currentTime
        = newTime < 0 ? 0
        : newTime > duration ? duration
        : newTime;
    vid.func.refreshHandlr();
};

// 뒤로 점프
vid.func.backward = function() {
    const amount = vid.stats.amountbackward;
    animate_pop_run(vid.el.icon_backward);
    vid.func.jumpTo(vid.el.screen.currentTime - amount);
};

// 앞으로 점프
vid.func.forward = function() {
    const amount = vid.stats.amountforward;
    animate_pop_run(vid.el.icon_forward);
    vid.func.jumpTo(vid.el.screen.currentTime + amount);
};

// 초를 입력하면 분:초 형태로 되돌려주는 함수
vid.func.convertToMinAndSecStr = function(sec) {
    return Math.floor(sec / 60) + ":" + $$.numberPad(Math.floor((sec - Math.floor(sec / 60) * 60)), 2);
};

// (게이지에 클릭 이벤트 발생 시) 클릭한 시점으로 점프함
vid.func.jumpByClk = function(e) {
    // 버블링 방지 3단콤보
    e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;
    // 클릭한 위치와 전체 바 길이를 이용, 재생위치를 알아냄
    const currPoint = e.offsetX;
    const fullWidth = vid.el.guage_full.offsetWidth;
    const perc = currPoint / fullWidth;
    const newTime = vid.el.screen.duration * perc;
    console.log("currPoint / full = ", currPoint + " / " + fullWidth, "\n=> perc = " + perc + " (newtime = " + newTime);
    // 계산된 해당 재생위치로 이동
    vid.func.jumpTo(newTime);
};

// (게이지에 클릭 이벤트 발생 시) 클릭한 크기의 음량으로 음량 변경
vid.func.volumeByClk = function(e) {
    // 버블링 방지 3단콤보
    e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;
    console.log(e);
    // 클릭한 위치와 전체 바 길이를 이용, 볼륨 크기를 알아냄
    const currPoint = e.offsetX;
    const fullWidth = vid.el.volume_full.offsetWidth;
    const perc = currPoint / fullWidth;
    console.log("currPoint / full = ", currPoint + " / " + fullWidth, "\n=> perc = " + perc);
    // 계산된 해당 크기의 볼륨으로 볼륨 변경
    vid.func.volumeTo(perc);
};

// 배속창 강제 닫기
vid.func.closeSpeedMenu = function() {
    vid.el.checkbox_speed.checked = false;
};

// 특정 스피드 버튼 클릭 시, 해당 버튼의 속도 속성을 읽어 셋팅값에 반영 후 스피드 변경함수 호출
vid.func.speedClickHandler = function(e) {
    const speed = e.target.getAttribute("data-speed");
    vid.func.changeSpeedTo(speed);
};

// 스피드 변경
vid.func.changeSpeedTo = function(speed) {
    vid.stats.playbackSpeed = speed; // 셋팅값 변경
    vid.func.refreshSpeed();
};

// 스피드 한 단계 업
vid.func.speedUp = function() {
    const list = vid.stats.speedList;
    const currVal = vid.stats.playbackSpeed;
    const currIdx = list.indexOf(currVal);
    var text = "스피드 업: " + currVal + "(" + currIdx + ")";
    if(currIdx == list.length - 1) return;
    vid.stats.playbackSpeed = array_rollToNext(list, currIdx);
    text += " → " + vid.stats.playbackSpeed;
    console.log(text);
    vid.func.refreshSpeed();
};

// 스피드 한 단계 다운
vid.func.speedDown = function() {
    const list = vid.stats.speedList;
    const currVal = vid.stats.playbackSpeed;
    const currIdx = list.indexOf(currVal);
    if(currIdx == 0) return;
    vid.stats.playbackSpeed = array_rollToPrev(list, currIdx);
    vid.func.refreshSpeed();
};

// 스피드 반영 (첫 재생 시 스피드 변경값 반영 안 되는 현상 방지)
vid.func.refreshSpeed = function() {
    const speed = vid.stats.playbackSpeed;
    const speedText = speed + "x";
    vid.el.screen.playbackRate = speed; // 엘리먼트 속성 변경
    vid.el.label_speed.innerText = speedText; // 스피드 표시값 변경
    vid.func.closeSpeedMenu();
};

// 재생위치 갱신 주기를 스로틀링으로 통제함. (0.2초)
vid.func.refreshHandlr = function() {
    // 리프레시 1회 후 0.2초 안에 호출 시 예약타이머 초기화.
    if(vid.stats.refreshThrottler) {
        clearTimeout(vid.stats.refreshThrottler);
        vid.stats.refreshThrottler = setTimeout(function() {
            vid.stats.refreshThrottler = null;
        }, 200);
        vid.func.refresh();
        return;
    }
};

// 컨트롤러를 숨기는 디바운싱을 새로 설정하는 함수. (2초)
vid.func.controlHideDebouncerSet = function() {
    // 최초 마우스 진입 시, 디바운서 끔.
    // 마우스아웃 시마다 디바운서 타이머 초기화
    if(vid.stats.controlHideDebouncer) clearTimeout(vid.stats.controlHideDebouncer); // 기존 디바운싱 치움
    vid.stats.controlHideDebouncer = setTimeout(vid.func.controlHide, 1000); // 새 디바운싱 설정
};

// 실제로 컨트롤러를 숨기는 하이딩 처리
vid.func.controlHide = function() {
    vid.el.controlsLayer.style.animation = "fadeout 0.6s linear forwards";
};

// 현재 재생위치 관련 정보를 회신해 주는 함수
vid.func.getCurrVidPos = function() {
    const currPosRaw = Math.floor(vid.el.screen.currentTime); // 초
    const fullPosRaw = Math.floor(vid.el.screen.duration); // 초
    const currPosTimeStr = vid.func.convertToMinAndSecStr(currPosRaw); // 분:초
    const fullPosTimeStr = vid.func.convertToMinAndSecStr(fullPosRaw); // 분:초
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

// 현재 재생위치 연관 정보를 전부 갱신하는 함수
vid.func.refresh = function() {
    const info = vid.func.getCurrVidPos();
    vid.el.span_currPos.innerText = info.playedTimeStr;
    vid.el.guage_curr.style.width = info.playedPercStr + "%";
};

// 해당 크기의 볼륨으로 볼륨 변경해주는 함수
vid.func.volumeTo = function(perc) {
    vid.el.screen.volume = perc; // 엘리먼트의 수치 변경
    vid.el.volume_curr.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
};

// 로딩율을 넣으면, 로딩바를 해당 크기로 변경해주는 함수
vid.func.loadedPosTo = function(perc) {
    vid.el.guage_loaded.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
};

// 마우스 절대위치를 받아, 그에 해당하는 재생위치를 계산하여 퍼센티지(0 ~ 1)로 회신해 주는 함수
vid.func.getCurrHoveredPerc = function(currClientX) {
    const rectObj = vid.el.guage_full.getBoundingClientRect(); // px
    const width = rectObj.width;
    const x = currClientX - rectObj.left;
    let perc = x / width;
    return perc > 1 ? 1
            : perc < 0 ? 0
            : perc;
};

// 마우스가 재생위치 바에 진입하면 툴팁을 표시시켜 주는 함수
vid.func.hoverShow = function() {
    vid.el.guage_hover.style.display = "block";
};

// 마우스가 재생위치 바로부터 벗어나면 툴팁을 숨겨주는 함수
vid.func.hoverHideHandlr = function() {
    if(vid.stats.tooltipHideTimer) return; // 1초 스로틀링
    vid.stats.tooltipHideTimer = setTimeout(vid.func.hoverHide, 1000); // 1초 지나면 실행
};

vid.func.hoverHide = function() {
    vid.el.guage_hover.style.display = "none";
    vid.stats.tooltipHideTimer = null;
};

// 재생위치 툴팁에 표시되는 해당 플레이타임을 갱신시켜주는 함수
vid.func.hoverRefreshPos = function(e) {
    const perc = vid.func.getCurrHoveredPerc(e.clientX);
    const el = vid.el.guage_hover;
    el.style.width = perc * 100 + "%";
    let hoveredTimeStr = vid.func.convertToMinAndSecStr(vid.el.screen.duration * perc);
    el.setAttribute("data-content", hoveredTimeStr);
}