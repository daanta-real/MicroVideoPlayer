
// init 계열 함수 준비
vid.initialize = null;
vid.init = {};

// 1. 비디오 컨트롤용 객체 초기화 함수
vid.initialize = function(src) {
    vid.el = { screen: $$.q("#vidContainer .screenLayer") };
    vid.el.screen.src = src; // 일단 비디오 로드
    vid.el.screen.addEventListener('canplay', vid.init.trigger); // 비디오 재생 가능해야 다음 단계로 진행
};

// 2. 초기화 실행 감지 시 실행 (초기화 실행 함수로 이행)
vid.init.trigger = function() {
    vid.el.screen.removeEventListener('canplay', vid.init.trigger);
    vid.init.run();
};

// 3. 초기화 실행 함수
vid.init.run = function() {

    // 각종 엘리먼트 할당
    vid.el.container      = $$.el("vidContainer");
    vid.el.tapLayer       = $$.q("#vidContainer .tapBox");
    vid.el.tap_backward   = $$.q("#vidContainer .tapBox > div:first-child");
    vid.el.tap_forward    = $$.q("#vidContainer .tapBox > div:last-child");
    vid.el.controlsLayer  = $$.q("#vidContainer .controlsLayer");
    vid.el.btn_play       = $$.q("#vidContainer .bottomBox .xi-play");
    vid.el.btn_backward   = $$.q("#vidContainer .bottomBox .xi-backward");
    vid.el.btn_forward    = $$.q("#vidContainer .bottomBox .xi-forward");
    vid.el.btn_loop_input = $$.el("videoPlayer_repeatChkBox");
    vid.el.btn_loop_label = $$.q("#vidContainer .midBlock .repeatLabel");
    vid.el.btn_fullScreen = $$.q("#vidContainer .bottomBox .fullScreenBtn");
    vid.el.span_currPos   = $$.q("#vidContainer .bottomBox .posInfo");
    vid.el.label_speed    = $$.q("#vidContainer .bottomBox .speedMenuBtn");
    vid.el.checkbox_speed = $$.el("videoPlayer_spdChkBox");
    vid.el.box_speeds     = $$.q("#vidContainer .bottomBox .speedMenuOptions");
    vid.el.guage_box      = $$.q("#vidContainer .guageBox");
    vid.el.guage_full     = $$.q("#vidContainer .guageBox .bg");
    vid.el.guage_curr     =  $$.q("#vidContainer .guageBox .fg");
    vid.el.guage_loaded   = $$.q("#vidContainer .guageBox .loaded");
    vid.el.guage_hover    = $$.q("#vidContainer .guageBox .hover");
    vid.el.volume_full    = $$.q("#vidContainer .volumeBox .bg");
    vid.el.volume_curr    = $$.q("#vidContainer .volumeBox .fg");
    vid.el.icon_play      = $$.q("#vidContainer .tapBox .xi-play");
    vid.el.icon_backward  = $$.q("#vidContainer .tapBox .xi-backward");
    vid.el.icon_forward   = $$.q("#vidContainer .tapBox .xi-forward");

    // 배속레이어 로드
    const list = vid.stats.speedList;
    for(let i = 0; i < list.length; i++) {
        const spd = list[i];
        const span = document.createElement("span");
        span.setAttribute("data-speed", spd);
        span.innerHTML = spd == 1.0 ? "일반" : spd;
        vid.el.box_speeds.append(span);
    }
    
    // 1. 일반 리스너 (키 리스너와 클릭 리스너가 완전히 동일) 바인딩
    vid.handlrList = [ // 각 키별 실행할 이벤트 정보 - [클릭한 엘리먼트 객체, 키보드 단축키, 실행할 함수] 순
        [vid.el.btn_play       , 32 , vid.func.togglePlay      ], // Space(32)
        [vid.el.btn_backward   , 37 , vid.func.backward        ], // ArrowLeft(37)
        [vid.el.btn_forward    , 39 , vid.func.forward         ], // ArrowRight(39)
        [vid.el.btn_fullScreen , 70 , vid.func.toggleFullscreen], // Fkey(70)
        [null                  , 27 , vid.func.escKeyHandlr    ], // Escape(27)
        [null                  , 219, vid.func.speedDown       ], // BracketLeft(219)
        [null                  , 221, vid.func.speedUp         ], // BracketRight(221)
        [vid.el.btn_loop_label , 76 , vid.func.refreshLoopMode ]  // KeyL(76)
    ];
    // 일반 클릭 리스너 할당 실시
    for(let i = 0; i < vid.handlrList.length; i++) {
        const info = vid.handlrList[i];
        if(!info[0]) continue; // 클릭 대상 객체가 없는 경우이므로 클릭리스너 등록하지 않고 넘김
        const tagName = info[0].tagName;
        const eventType = tagName === "select" ? "change" : "click";
        info[0].addEventListener(eventType, info[2]); // 클릭 이벤트 리스너 등록
    }
    // 일반 키 입력 리스너 할당 실시
    window.addEventListener("keydown", vid.func.keyHandlr);
    
    // 2. 배속 변경 버튼 클릭 관련
    // 비디오 재생 시 사전 배속값을 속도에 강제 반영
    vid.el.screen.addEventListener('play', vid.func.refreshSpeed);
    // 배속 변경버튼 클릭 리스너 할당 실시
    vid.el.box_speeds.childNodes.forEach(function(el) { el.addEventListener("click", vid.func.speedClickHandler)});

    // 3. 탭 영역 관련
    // [마우스]
    // 1-ㄱ. 아무데나 클릭시 > 재생/정지
    // 1-ㄴ. 좌/우 클릭시 > (정해진 동작 없음)
    // 1-ㄷ. 아무데나 더블클릭시 > 풀스크린 전환
    // 1-ㄹ. 좌/우 더블클릭시 > (정해진 동작 없음)
    // [터치]
    // 2-ㄱ. 아무데나 터치시 > 컨트롤 레이어 표시/해제
    // 2-ㄴ. 좌/우 터치시 > (정해진 동작 없음)
    // 2-ㄷ. 아무데나 더블터치시 > (정해진 동작 없음)
    // 2-ㄹ. 좌/우 더블터치시 > 되감기/빨리감기
    vid.el.tapLayer.addEventListener("pointerdown", function(e) {
        // 버블링 방지 3단콤보
        e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;

        const type = e.pointerType;
        console.log("탭레이어 입력. 입력 타입:", e.pointerType);

        // 탭리스너 모드 off 시, 탭리스너 모드를 켜고 0.3초 후에 싱글탭 리스너 실행시키게 함
        if(!vid.stats.doubleTapListenerMode) {
            vid.stats.doubleTapListenerMode = setTimeout(function() {
                // 0.3초 안에 두 번 누르지 않은 경우. 즉, 싱글(ㄱ or ㄴ)
                // ㄴ은 동작이 없으므로 ㄱ만 실행.
                console.log("★ 탭리스너 > 싱글 실행");
                vid.stats.doubleTapListenerMode = null;

                // 1-ㄱ. 재생/정지
                if(type == "mouse") vid.func.togglePlay();
                // 2-ㄱ. 컨트롤 레이어 표시/해제
                else if(type == "touch" || type == "pen") {
                    console.log("★★ 컨트롤 레이어 표시/해제 (현재 미구현");
                }
            }, 300);
        }
        // 탭리스너 모드 on 시, 켜져 있는 탭리스너 모드 끄고 더블탭 리스너를 실행시키게 함
        else {
            // 0.3초 안에 두 번 누른 경우. 즉, 더블(ㄷ or ㄹ)
            console.log("★ 탭리스너 > 더블 실행");
            clearTimeout(vid.stats.doubleTapListenerMode);
            vid.stats.doubleTapListenerMode = null;
            
            // 1-ㄷ. 아무데나 더블클릭시 > 풀스크린 전환
            if(type == "mouse") vid.func.toggleFullscreen();
            // 2-ㄹ. 좌/우 더블터치시 > 되감기/빨리감기 (터치 영역 판정에 따라)
            else if(type == "touch" || type == "pen") {
                const areaName = e.target.getAttribute("data-area");
                    if(areaName == "left") vid.func.backward();
                else if(areaName == "right") vid.func.forward();
            }
        }

    });

    // 4. 각종 게이지 관련
    // 1) 재생 게이지
    // 재생위치가 조금이라도 변경되면, 리프레셔 실행
    vid.el.screen.addEventListener("timeupdate", vid.func.refreshHandlr);
    // 비디오가 로딩되었을 직후에는 메타데이터를 불러오기 전이므로, 위의 리프레시가 실행되어도 길이가 NaN으로 측정됨
    // 따라서 메타데이터가 입수되기자마자 리프레시를 추가로 실행하여 NaN이 표시되는 에러를 막아준다.
    // 이때, 핸들러 거쳤다가 스로틀링 때문에 막히면 사용자가 다음 조작하기 전까지 재실행이 안되므로,
    // 핸들러를 거치지 않고 바로 리프레시해 준다.
    vid.el.screen.addEventListener("loadedmetadata", vid.func.refresh);
    // 게이지 내부 클릭 시 해당 재생 시점으로 이동
    vid.el.guage_curr.addEventListener("click", vid.func.jumpByClk);
    vid.el.guage_full.addEventListener("click", vid.func.jumpByClk);
    vid.el.guage_curr.addEventListener("click", vid.func.jumpByClk);
//  vid.el.guage_hover.addEventListener("click", vid.func.jumpByClk);
    // 2) 볼륨 게이지
    // 게이지 내부 클릭 시 해당 재생 볼륨으로 이동
    vid.el.volume_curr.addEventListener("click", vid.func.volumeByClk);
    vid.el.volume_full.addEventListener("click", vid.func.volumeByClk);

    // 애니메이션 자동 청소 리스너 예약
    // 화면 중앙부 재생/뒤로가기/빨리감기 세 개의 아이콘은 애니메이션 재생 종료 시마다 애니메이션 상태 해제가 필요하다.
    vid.el.icon_play.addEventListener("animationend", animate_pop_clr_handlr);
    vid.el.icon_backward.addEventListener("animationend", animate_pop_clr_handlr);
    vid.el.icon_forward.addEventListener("animationend", animate_pop_clr_handlr);

    // 5. 마우스오버 관련
    // 1) 재생바 마우스오버 시 현재 재생위치 표시
    vid.el.guage_box.addEventListener("mouseenter", vid.func.hoverShow);
    vid.el.guage_box.addEventListener("mousemove", vid.func.hoverRefreshPos);
    vid.el.guage_box.addEventListener("mouseleave", vid.func.hoverHide);



    console.log("비디오 플레이어 초기화 완료.");

};