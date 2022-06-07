
// 전역 레벨에서 마우스의 움직임 이벤트를 핸들링하는 함수 모음
vid.mouseHandlr = {};

vid.mouseHandlr.debugMoveDebouncing = null;



// 마우스 다운 시
vid.mouseHandlr.down = function(e) {

    // 재생게이지 영역 안에서 마우스다운 시 점프모드 시작
    if(isMouseInElement(e, vid.el.guage_box)) {
        console.log("점프모드 시작");
        vid.stats.jumpMode = true;
        vid.func.jumpEvent(e); // 최초 클릭 시 한 번은 재생위치 변경시켜줌.
    }

    // 볼륨게이지 영역 안에서 마우스다운 시 볼륨조절 모드 시작
    if(isMouseInElement(e, vid.el.volume_box)) {
        console.log("볼륨모드 시작");
        vid.stats.volumeMode = true;
        vid.func.volumeEvent(e); // 최초 클릭 시 한 번은 볼륨 변경시켜줌.
    }

}



// 마우스 이동 시
vid.mouseHandlr.move = function(e) {

    // debug
    console.log("무브이벤트 발생");
    document.getElementById("debug").style.borderColor="red";
    if(!vid.mouseHandlr.debugMoveDebouncing) {
        vid.mouseHandlr.debugMoveDebouncing = setTimeout(function() {
            clearTimeout(vid.mouseHandlr.debugMoveDebouncing);
            vid.mouseHandlr.debugMoveDebouncing = null;
            document.getElementById("debug").style.borderColor="transparent";
        }, 100);
    }

    // 점프모드 중일 때에는 점프 실행
    if(vid.stats.jumpMode) vid.func.jumpEvent(e);

    // 볼륨모드 중일 때에는 점프 실행
    if(vid.stats.volumeMode) vid.func.volumeEvent(e);

    // 이벤트가 플레이어 영역 안에서 발생 시 버블링 방지
    if(isMouseInElement(e, vid.el.container)) {
        e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;
    }

}



// 마우스 업 시
vid.mouseHandlr.up = function() {

    vid.stats.jumpMode = false; // 점프모드 OFF
    vid.stats.volumeMode = false; // 볼륨모드 OFF
    console.log("점프모드 종료, 볼륨모드 종료");

}
