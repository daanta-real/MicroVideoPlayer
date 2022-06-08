
// 비디오 컨트롤 함수 모음
vid.func = {};


/*
1. 키보드 부분
2. 재생 컨트롤 부분
3. 반복기능 부분
4. 풀스크린 부분
5. 재생 제어 부분
6. 볼륨 부분
7. 재생위치 반영 부분
8. 배속 기능 부분
9. 컨트롤러 숨김처리 부분
*/


// ★★★★★★★★★★★★★★★ 키보드 부분 ★★★★★★★★★★★★★★★



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



// ★★★★★★★★★★★★★★★ 재생 컨트롤 부분 ★★★★★★★★★★★★★★★



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
        vid.func.finished();
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
        vid.func.started();
        animate_heartbeat(btnEl);
        // 중앙 아이콘
        iconEl.classList.remove("xi-pause");
        iconEl.classList.add("xi-play");
        animate_pop_run(vid.el.icon_play);
    }

    console.log("재생/정지 토글");

};

// 재생 시작 시 실행되어 멈춤버튼을 재생버튼으로 바꿈
vid.func.started = function() {
    vid.el.btn_play.classList.remove("xi-play");
    vid.el.btn_play.classList.add("xi-pause");
};

// 재생 종료 시 실행되어 재생버튼을 멈춤버튼으로 바꿈
vid.func.finished = function() {
    vid.el.btn_play.classList.remove("xi-pause");
    vid.el.btn_play.classList.add("xi-play");
};

// ★★★★★★★★★★★★★★★ 반복기능 부분 ★★★★★★★★★★★★★★★



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



// ★★★★★★★★★★★★★★★ 풀스크린 부분 ★★★★★★★★★★★★★★★



// 풀스크린 토글
vid.func.toggleFullscreen = function() {
    if(!document.fullscreenElement) fullscreenOn(vid.el.container);
    else fullscreenOff();
};



// ★★★★★★★★★★★★★★★ 재생 제어 부분 ★★★★★★★★★★★★★★★



// 1) 공통 처리부

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

// 재생위치를 마우스가 있는 시간대의 시점으로 점프함
vid.func.jumpEvent = function(e) {
    // 마우스 위치에 해당하는 새로운 재생위치를 구함
    console.log("마우스 움직임 이벤트:", e);
    var newTime = vid.calc.getTimeByPerc(e);
    console.log("jumpEvent에서 계산된 newTime:", newTime);
    // 계산된 해당 재생위치로 이동
    vid.func.jumpTo(newTime);
};

// 특정 지정된 시간의 시점으로 이동
vid.func.jumpTo = function(timeTo) {
    const duration = vid.el.screen.duration;
    const newTime = timeTo;
    console.log("jumpTo 실행됨. duration=", duration, " / newTime=", newTime);
    vid.el.screen.currentTime
        = newTime < 0 ? 0
        : newTime > duration ? duration
        : newTime;
    vid.func.refreshHandlr();
};

// 재생위치 툴팁에 표시되는 해당 플레이타임을 갱신시켜주는 함수
vid.func.hoverRefreshPos = function(e) {
    const perc = vid.calc.guagePercentByMouse(e);
    const el = vid.el.guage_hover;
    el.style.width = perc * 100 + "%";
    let hoveredTimeStr = vid.calc.convertToMinAndSecStr(vid.el.screen.duration * perc);
    el.setAttribute("data-content", hoveredTimeStr);
}

// 참고: 재생 게이지를 마우스 드래그할 때 재생 위치를 변경
// - 재생 게이지 위에서 마우스 버튼을 누르는 순간, 점프모드가 ON됨.
// - 점프모드가 ON된 상태에서 마우스를 움직이면, vid.func.mouseMoveHandlr에서 마우스이동을 감지,
//   해당 마우스 X위치로 재생위치 이동 처리를 하게 되며,
// - 점프모드가 ON된 상태에서 마우스를 떼면, vid.func.mouseMoveHandlr에서 마우스이동을 감지,
//   점프모드를 끄게 된다.
// - 드래그하다가 마우스가 게이지 밖으로 넘어갈 수도 있기 때문에, 관련 이벤트를 게이지 엘리먼트단에서 처리해서는 안 된다.
//   이에 따라 마우스 관련된 모든 처리는 객체단인 vid.mouseHandlr에서 처리한다.



// ★★★★★★★★★★★★★★★ 볼륨 부분 ★★★★★★★★★★★★★★★



// 해당 크기의 볼륨으로 볼륨 변경해주는 함수
vid.func.volumeEvent = function(e) {
    const perc = vid.calc.volumePercentByMouse(e);
    vid.el.screen.volume = perc; // 엘리먼트의 수치 변경
    vid.el.volume_curr.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
};



// ★★★★★★★★★★★★★★★ 재생위치 반영 부분 ★★★★★★★★★★★★★★★



// 재생위치 갱신 주기를 스로틀링으로 통제함. (0.1밀리초)
vid.func.refreshHandlr = function() {
    if(vid.stats.refreshThrottler) return; // 0.1밀리초 안에 다시 부르면 리턴
    vid.stats.refreshThrottler = setTimeout(function() { // 0.1밀리초 되면
        clearTimeout(vid.stats.refreshThrottler); // timeout 없애준 뒤
        vid.stats.refreshThrottler = null; // null로 만듦
        vid.func.refresh(); // 리프레시 실행
    }, 0.1);
};

// 현재 재생위치 연관 정보를 전부 갱신하는 함수
vid.func.refresh = function() {
    const info = vid.calc.getCurrVidPos();
    vid.el.span_currPos.innerText = info.playedTimeStr;
    vid.el.guage_curr.style.width = info.playedPercStr + "%";
};

// 로딩율을 넣으면, 로딩바를 해당 크기로 변경해주는 함수
vid.func.loadedPosTo = function(perc) {
    vid.el.guage_loaded.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
};



// ★★★★★★★★★★★★★★★ 배속 기능 부분 ★★★★★★★★★★★★★★★



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



// ★★★★★★★★★★★★★★★ 컨트롤러 숨김처리 부분 ★★★★★★★★★★★★★★★



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

// 마우스가 재생위치 바로부터 벗어나면 툴팁을 숨겨주는 함수 (쓰로틀링)
vid.func.hoverHideHandlr = function() {
    if(vid.stats.tooltipHideTimer) return; // 0.5초 안에 재실행되면 return
    // 마지막 실행 0.5초 지난 후에만 아래 실행
    vid.stats.tooltipHideTimer = setTimeout(function() {
        clearTimeout(vid.stats.tooltipHideTimer);
        vid.stats.tooltipHideTimer = null;
    }, 500);
};
