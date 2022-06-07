
// 전역 레벨에서 마우스의 움직임 이벤트를 핸들링하는 함수 모음
vid.mouseHandlr = {};

vid.mouseHandlr.debugMoveDebouncing = null;



// 마우스 다운 시
vid.mouseHandlr.down = function(e) {

    // 재생게이지 영역 안에서 마우스다운 시 점프모드 시작
    if(isMouseInElement(e, vid.el.guage_box)) {
        vid.stats.jumpMode = true;
        vid.func.jumpEvent(e); // 최초 클릭 시 한 번은 재생위치 변경시켜줌.
    }

    // 볼륨게이지 영역 안에서 마우스다운 시 볼륨조절 모드 시작
    if(isMouseInElement(e, vid.el.volume_box)) {
        vid.stats.volumeMode = true;
        vid.func.volumeEvent(e); // 최초 클릭 시 한 번은 볼륨 변경시켜줌.
    }

    // 스크린 내에서 마우스다운한 상황이므로, true로 만들어 준다.
    vid.stats.mousedownOnTheInside = true;

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

    // 마우스다운이 스크린 안에서 시작되었을 때에는 버블링 방지를 실행한다.
    // 마우스다운 중 스크린 밖으로 나가더라도 스크린 이벤트를 우선시하기 위해서 실행하는 사항임.
    if(vid.stats.mousedownOnTheInside) {
        e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;
    }

}



// 마우스 업 시
vid.mouseHandlr.up = function() {

    vid.stats.jumpMode = false; // 점프모드 OFF
    vid.stats.volumeMode = false; // 볼륨모드 OFF
    vid.stats.mousedownOnTheInside = false; // 마우스다운 중의 버블링 방지를 해제함.

}
