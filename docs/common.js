/******************** 공용 라이브러리 ********************/
let $$ = {};
// 엘리먼트 획득
$$.el   = function(id)    { return document.getElementById(id); }
$$.q    = function(query) { return document.querySelector(query); }
$$.qAll = function(query) { return document.querySelectorAll(query); }
// 특정 클래스 토글 (엘리먼트 객체, 클래스명 - 개별도 배열도 다 됨)
$$.classToggle = function(el, nameInfo) {

    // 한 개의 클래스를 토글시켜 줌
    function toggleOne(el, className) {
        const classNameExists = el.classList.contains(className);
        if(!classNameExists) el.classList.add(className);
        else el.classList.remove(className);
    }

    // 문자열 한 개냐 아니면 배열이냐에 따라 토글 반복수행 결정
    if(Array.isArray(nameInfo.class)) for(let oneClassName in nameInfo) toggleOne(el, oneClassName);
    else toggleOne(el, nameInfo);

};
// 1차원 배열 내 특정 val 존재유무 회신
$$.in_array = function(needle, haystack) {
    var len = haystack.length;
    for(var i=0; i<len; i++) if(haystack[i] == needle) return true;
    return false;
};
// 이벤트를 검사하여, 단축키 입력이 가능한 곳인지를 T/F로 회신해 줌
// ex) input 등의 태그에서는 단축키 입력이 불가능하므로 false가 회신됨
$$.isKeyInputAvailable = function(e) {

    // 기본 변수 설정
    const tagName = e.target.tagName.toUpperCase();
    
    // 검사 1. INPUT, TEXTAREA, SELECT 태그 내에서는 아무런 발동 불가
    if($$.in_array(tagName, ["INPUT", "TEXTAREA", "SELECT"])) return false;

    // 모든 검사를 통과했다면 true를 회신
    else return true;

};
// IE 11 Foreach Enabler
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}
// 지정된 폭만큼 빈 자리에 0 채워주는 함수
$$.numberPad = function(n, width) {
    n *= 1;
    if(typeof n !== 'number') return n;
    n += '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

// el 엘리먼트에 spell의 애니메이션 실행
// spell은 'fadeout 1s linear forwards' 이런 식으로 쓰면 된다.
function animate(el, spell) {
    el.style.animation = spell;
    el.addEventListener("animationend", function(ani) { ani.target.style.animation = ''; });
}

// 배열과 원소'번호' i를 넘기면 i번째의 다음 원소를 구해서 돌려줌 (마지막일 시 첫번째 거)
function array_rollToNext(arr, i) {
    return i + 1 == arr.length ? arr[0] : arr[i + 1];
}

// 배열과 원소'번호' i를 넘기면 i번째의 직전 원소를 구해서 돌려줌 (처음일 시 마지막 거)
function array_rollToPrev(arr, i) {
    return i == 0 ? arr[arr.length - 1] : arr[i - 1];
}

// 마우스가 특정 엘리먼트 안에 있을 때 이벤트가 발생한 것인지 true/false 판정하여 회신
// 이때 elList에 단일 엘리먼트를 넣어도 된다.
function isMouseInElement(e, elList) {

    // 변수선언
    let elementPointer = e.target;

    // el이 배열로 들어오지 않았을 경우 배열화
    if(!Array.isArray(elList)) elList = [elList];

    // 모든 el요소들에 대해 아래 실행
    for(let i = 0, el = elList[0]; i < elList.length; el = elList[++i]) {
        // document까지 타고 올라가는 동안 el과 같은 이벤트가 있는지 확인
        while(elementPointer !== document) {
            if(elementPointer == el) return true;
            elementPointer = elementPointer.parentNode;
        }
    }

    // 여기까지 왔으면 못 찾았다. false 회신
    return false;

}

// 모바일 환경에서 더블탭하면 확대가 되는 불편한 현상을 막기 위한 최신 솔루션 (특히 iOS)
let lastTouchedTime = 0;
window.addEventListener('touchend', function (e) {
    const now = (new Date()).getTime();
    if (now - lastTouchedTime <= 300){
    // 버블링 방지 3단콤보
    e.preventDefault(); e.stopPropagation(); e.cancelBubble = true;
    }
    lastTouchedTime = now;
}, false);

// 특정 엘리먼트를 풀스크린 시킴. (CSS CLASS FULLSCREEN 先정의 필요함)
function fullscreenOn(el) {
         if(el.requestFullscreen      ) el.requestFullscreen      ();
    else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if(el.mozRequestFullScreen   ) el.mozRequestFullScreen   ();
    else if(el.msRequestFullscreen    ) el.msRequestFullscreen    ();
    el.classList.add("fullScreen");
}

// 풀스크린으로부터 탈출 (CSS CLASS FULLSCREEN 先정의 필요함)
function fullscreenOff() {
         if(document.exitFullscreen        ) document.exitFullscreen        ();
    else if(document.webkitCancelFullscreen) document.webkitCancelFullscreen();
    else if(document.mozCancelFullScreen   ) document.mozCancelFullScreen   ();
    else if(document.msExitFullscreen      ) document.msExitFullscreen      ();
    el.classList.remove("fullScreen");
}
