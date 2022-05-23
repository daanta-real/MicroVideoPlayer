/* 애니메이션 라이브러리 */

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
