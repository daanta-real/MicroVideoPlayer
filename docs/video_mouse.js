
// 전역 레벨에서 마우스의 움직임 이벤트를 핸들링하는 함수 모음
vid.mouseHandlr = {};



// 마우스 이동 시
vid.mouseHandlr.move = function(e) {

    console.log("무브이벤트 발생");
    if(vid.stats.jumpMode) vid.func.jumpEvent(e); // 점프모드 중일 때에는 점프 실행

}



// 마우스 업 시
vid.mouseHandlr.up = function() {

    vid.stats.jumpMode = false; // 점프모드 OFF
    console.log("점프모드 종료");

}
