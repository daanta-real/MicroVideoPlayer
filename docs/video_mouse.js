
// 전역 레벨에서 마우스의 움직임 이벤트를 핸들링하는 함수 모음
vid.el.mouseHandlr = {};



// 마우스 이동 시
vid.el.mouseHandlr.move = function() {

    if(vid.stats.jumpMode) vid.func.jumpEvent(); // 점프모드 중일 때에는 점프 실행

}



// 마우스 업 시
vid.el.mouseHandlr.up = function() {

    vid.stats.jumpMode = false; // 점프모드 OFF

}
