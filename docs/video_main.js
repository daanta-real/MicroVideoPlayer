
/******************** 비디오 라이브러리 ********************/

// 비디오 컨트롤용 객체 선언
let vid = {};

// 비디오 셋팅 관련 각종 환경변수
vid.stats = {
    speedList: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0],
    amountbackward: 5,
    amountforward: 5,
    playbackSpeed: 1,
    doubleTapListenerMode: false, // 셋팅값은 아니지만 상태관리용 환경변수이므로 여기에 넣었음.
    refreshThrottler: null, // 재생상태 리프레시 스로틀링 객체 자리
    controlHideDebouncer: null, // 컨트롤 숨기는 디바운싱 객체 자리
    loop: false,
    jumpMode: false, // 마우스 드래그 시 재생위치 점프를 실행할 것인지 여부
    volumeMode: false // 마우스 드래그 시 볼륨 변경을 실행할 것인지 여부
};
