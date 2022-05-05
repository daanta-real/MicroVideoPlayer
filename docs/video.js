/* 기타 라이브러리 */

// 해당 엘리먼트에 일반 심장박동 애니메이션 수행
function animate_heartbeat(el) {
    animate(el, "heartbeat 0.15s linear forwards");
}


// 잠깐 나타나서 heartbeat 후 숨는 애니메이션 실행시킴
// 대상 애니메이션을 클리어하고 숨김
function animate_pop_clr_handlr(e) {
    console.log("애니메이션 정상 종료");
    animate_pop_clr(e.target);
}
function animate_pop_clr(el) {
    el.style.visibility = "hidden";
    el.style.animation = '';
    el.classList.remove("___");
    void el.offsetWidth;
    el.classList.add("___");
}
// 애니메이션 실행
function animate_pop_run(el) {

    // 기존 애니메이션 상태 초기화 (이벤트도 발동시킴)
    animate_pop_clr(el);

    // 애니메이션 실행
    el.style.animation = "heartbeatFadeout 0.6s linear forwards";
    el.style.visibility = "visible";

}

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
    loop: false
};

// 비디오 컨트롤용 객체 초기화 함수
vid.init = function(src) {
    
    // 각종 엘리먼트 할당
    this.el = {
        container     : $$.el("vidContainer"),
        screen        : $$.q("#vidContainer .screenLayer"),
        tapLayer      : $$.q("#vidContainer .tapBox"),
        tap_backward  : $$.q("#vidContainer .tapBox > div:first-child"),
        tap_forward   : $$.q("#vidContainer .tapBox > div:last-child"),
        controlsLayer : $$.q("#vidContainer .controlsLayer"),
        btn_play      : $$.q("#vidContainer .bottomBox .xi-play"),
        btn_backward  : $$.q("#vidContainer .bottomBox .xi-backward"),
        btn_forward   : $$.q("#vidContainer .bottomBox .xi-forward"),
        btn_loop_input: $$.el("videoPlayer_repeatChkBox"),
        btn_loop_label: $$.q("#vidContainer .midBlock .repeatLabel"),
        btn_fullScreen: $$.q("#vidContainer .bottomBox .fullScreenBtn"),
        span_currPos  : $$.q("#vidContainer .bottomBox .posInfo"),
        label_speed   : $$.q("#vidContainer .bottomBox .speedMenuBtn"),
        checkbox_speed: $$.el("videoPlayer_spdChkBox"),
        box_speeds    : $$.q("#vidContainer .bottomBox .speedMenuOptions"),
        guage_box     : $$.q("#vidContainer .guageBox"),
        guage_full    : $$.q("#vidContainer .guageBox .bg"),
        guage_curr    : $$.q("#vidContainer .guageBox .fg"),
        guage_loaded  : $$.q("#vidContainer .guageBox .loaded"),
        guage_hover   : $$.q("#vidContainer .guageBox .hover"),
        volume_full   : $$.q("#vidContainer .volumeBox .bg"),
        volume_curr   : $$.q("#vidContainer .volumeBox .fg"),
        icon_play     : $$.q("#vidContainer .tapBox .xi-play"),
        icon_backward : $$.q("#vidContainer .tapBox .xi-backward"),
        icon_forward  : $$.q("#vidContainer .tapBox .xi-forward")
    };

    // 배속레이어 로드
    const list = vid.stats.speedList;
    for(let i = 0; i < list.length; i++) {
        const spd = list[i];
        const span = document.createElement("span");
        span.setAttribute("data-speed", spd);
        span.innerHTML = spd == 1.0 ? "일반" : spd;
        vid.el.box_speeds.append(span);
    }
    
    // 일단 비디오 로드
    this.el.screen.src = src;
    
    // 1. 일반 리스너 (키 리스너와 클릭 리스너가 완전히 동일) 바인딩
    this.handlrList = [ // 각 키별 실행할 이벤트 정보 - [클릭한 엘리먼트 객체, 키보드 단축키, 실행할 함수] 순
        [this.el.btn_play       , 32 , this.func.togglePlay      ], // Space(32)
        [this.el.btn_backward   , 37 , this.func.backward        ], // ArrowLeft(37)
        [this.el.btn_forward    , 39 , this.func.forward         ], // ArrowRight(39)
        [this.el.btn_fullScreen , 70 , this.func.toggleFullscreen], // Fkey(70)
        [null                   , 27 , this.func.escKeyHandlr    ], // Escape(27)
        [null                   , 219, this.func.speedDown       ], // BracketLeft(219)
        [null                   , 221, this.func.speedUp         ], // BracketRight(221)
        [this.el.btn_loop_label , 76 , this.func.refreshLoopMode ]  // KeyL(76)
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
    window.addEventListener("keydown", this.func.keyHandlr);
    
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
    vid.el.guage_box.addEventListener("mousemove", vid.func.refreshHoverPos);



    console.log("비디오 플레이어 초기화 완료.");

};

// 비디오 컨트롤 함수 모음
vid.func = {

    // 키보드 입력에 따라 이벤트 실행
    // IE에서는 e.code를 지원하지 않으므로, 이벤트에 들어간 키보드 키를 크로스브라우징 이슈 없이 검출하려면 e.keyCode의 숫자로 해야 한다.
    keyHandlr: function(e) {

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

    },

    // ESC키를 눌렀을 때 동작. 풀스크린 모드를 해제하고, 배속 창을 닫는다.
    escKeyHandlr: function() {
        console.log("ESC");
        vid.el.container.classList.remove("fullScreen");
        vid.func.closeSpeedMenu();
    },

    // 재생 토글
    togglePlay: function() {

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

    },

    // 반복기능 갱신. 실상 토글기능이지만, input태그 체크상태 보고 그대로 반영하는 식으로 토글하므로 갱신이란 표현을 썼음
    refreshLoopMode: function() {
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
    },

    // 풀스크린 토글
    toggleFullscreen: function() {
        $$.classToggle(vid.el.container, "fullScreen");
        console.log("풀스크린 토글");
    },

    // 특정 시점으로 이동
    jumpTo: function(timeTo) {
        const duration = vid.el.screen.duration;
        const newTime = timeTo;
        vid.el.screen.currentTime
            = newTime < 0 ? 0
            : newTime > duration ? duration
            : newTime;
        vid.func.refreshHandlr();
    },

    // 뒤로 점프
    backward: function() {
        const amount = vid.stats.amountbackward;
        animate_pop_run(vid.el.icon_backward);
        vid.func.jumpTo(vid.el.screen.currentTime - amount);
    },

    // 앞으로 점프
    forward: function() {
        const amount = vid.stats.amountforward;
        animate_pop_run(vid.el.icon_forward);
        vid.func.jumpTo(vid.el.screen.currentTime + amount);
    },

    // (게이지에 클릭 이벤트 발생 시) 클릭한 시점으로 점프함
    jumpByClk: function(e) {
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
    },

    // (게이지에 클릭 이벤트 발생 시) 클릭한 크기의 음량으로 음량 변경
    volumeByClk: function(e) {
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
    },

    // 배속창 강제 닫기
    closeSpeedMenu: function() {
        vid.el.checkbox_speed.checked = false;
    },

    // 특정 스피드 버튼 클릭 시, 해당 버튼의 속도 속성을 읽어 셋팅값에 반영 후 스피드 변경함수 호출
    speedClickHandler: function(e) {
        const speed = e.target.getAttribute("data-speed");
        vid.func.changeSpeedTo(speed);
    },

    // 스피드 변경
    changeSpeedTo: function(speed) {
        vid.stats.playbackSpeed = speed; // 셋팅값 변경
        vid.func.refreshSpeed();
    },

    // 스피드 한 단계 업
    speedUp: function() {
        const list = vid.stats.speedList;
        const currVal = vid.stats.playbackSpeed;
        const currIdx = list.indexOf(currVal);
        var text = "스피드 업: " + currVal + "(" + currIdx + ")";
        if(currIdx == list.length - 1) return;
        vid.stats.playbackSpeed = array_rollToNext(list, currIdx);
        text += " → " + vid.stats.playbackSpeed;
        console.log(text);
        vid.func.refreshSpeed();
    },

    // 스피드 한 단계 다운
    speedDown: function() {
        const list = vid.stats.speedList;
        const currVal = vid.stats.playbackSpeed;
        const currIdx = list.indexOf(currVal);
        if(currIdx == 0) return;
        vid.stats.playbackSpeed = array_rollToPrev(list, currIdx);
        vid.func.refreshSpeed();
    },

    // 스피드 반영 (첫 재생 시 스피드 변경값 반영 안 되는 현상 방지)
    refreshSpeed: function() {
        const speed = vid.stats.playbackSpeed;
        const speedText = speed + "x";
        vid.el.screen.playbackRate = speed; // 엘리먼트 속성 변경
        vid.el.label_speed.innerText = speedText; // 스피드 표시값 변경
        vid.func.closeSpeedMenu();
    },

    // 재생위치 갱신 주기를 스로틀링으로 통제함. (0.2초)
    refreshHandlr: function() {
        // 리프레시 1회 후 0.2초 동안은 리프레시 금지, 이후 다시 리프레시
        if(vid.stats.refreshThrottler) return;
        vid.func.refresh();
        vid.stats.refreshThrottler = setTimeout(function() {
            vid.stats.refreshThrottler = null;
        }, 200);
    },

    // 컨트롤러를 숨기는 디바운싱을 새로 설정하는 함수. (2초)
    controlHideDebouncerSet: function() {
        // 최초 마우스 진입 시, 디바운서 끔.
        // 마우스아웃 시마다 디바운서 타이머 초기화
        if(vid.stats.controlHideDebouncer) clearTimeout(vid.stats.controlHideDebouncer); // 기존 디바운싱 치움
        vid.stats.controlHideDebouncer = setTimeout(vid.func.controlHide, 1000); // 새 디바운싱 설정
    },

    // 실제로 컨트롤러를 숨기는 하이딩 처리
    controlHide: function() {
        vid.el.controlsLayer.style.animation = "fadeout 0.6s linear forwards";
    },
    
    // 현재 재생위치 연관 정보를 전부 갱신하는 함수
    refresh: function() {
        const currPosRaw = Math.floor(vid.el.screen.currentTime); // 초
        const fullPosRaw = Math.floor(vid.el.screen.duration); // 초
        console.log(currPosRaw);
        currPos = Math.floor(currPosRaw / 60) + ":" + $$.numberPad((currPosRaw - Math.floor(currPosRaw / 60) * 60), 2);
        fullPos = Math.floor(fullPosRaw / 60) + ":" + $$.numberPad((fullPosRaw - Math.floor(fullPosRaw / 60) * 60), 2);
        vid.el.span_currPos.innerText = currPos + " / " + fullPos;
        const playedPerc = currPosRaw / fullPosRaw * 100;
        vid.el.guage_curr.style.width = playedPerc + "%";
    },

    // 해당 크기의 볼륨으로 볼륨 변경해주는 함수
    volumeTo: function(perc) {
        vid.el.screen.volume = perc; // 엘리먼트의 수치 변경
        vid.el.volume_curr.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
    },

    // 로딩율을 넣으면, 로딩바를 해당 크기로 변경해주는 함수
    loadedPosTo: function(perc) {
        vid.el.guage_loaded.style.width = (perc * 100) + "%"; // 엘리먼트의 너비 변경
    },

    // 마우스 절대위치를 받아, 그에 해당하는 재생위치를 계산하여 퍼센티지(0 ~ 1)로 회신해 주는 함수
    getCurrHoveredPerc: function(currClientX) {
        const rectObj = vid.el.guage_full.getBoundingClientRect(); // px
        const width = rectObj.width;
        const x = currClientX - rectObj.left;
        const perc = x / width;
        return perc;
    },

    // 마우스 위치에 맞게 hover의 너비를 변경시켜 주는 함수
    refreshHoverPos: function(e) {
        const perc = vid.func.getCurrHoveredPerc(e.clientX);
        const newDuration = Math.floor(perc * vid.el.screen.duration); // 초
        vid.el.guage_bg.style.background
            = "linear-gradient(90deg, red 0 " + perc + "%, transparent 0 " + (perc + 0.00000000000000000001) + "%)";
        console.log("마우스오버된 재생 위치:", newDuration);
    }

};
