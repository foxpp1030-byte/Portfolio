import { initGnb, set_active } from './gnb.js';
import { initFooter } from './footer.js';


// ==================== GNB Auto Hide/Show ====================
const header = document.querySelector('header');
let lastScrollY = 0;

// Lenis 스크롤 이벤트나 window scroll 이벤트를 사용
// 여기서는 GSAP ScrollTrigger를 활용하는 것이 가장 부드럽습니다.
ScrollTrigger.create({
    start: 'top top',
    end: 99999,
    onUpdate: (self) => {
        const direction = self.direction; // 1: Down, -1: Up

        // 스크롤을 내리는 중이고, 최상단이 아니라면 -> 숨김
        if (direction === 1 && self.scroll() > 50) {
            header.classList.add('hide');
            header.classList.remove('menu-open'); // 혹시 열려있으면 닫기 처리 등
        }
        // 스크롤을 올리는 중이면 -> 보임
        else if (direction === -1) {
            header.classList.remove('hide');
        }
    }
});
// ==================== 새로고침 시 맨 위로 ====================
if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable);

// ==================== Lenis Scroll Setup ====================
const lenis = new Lenis({
    duration: 0.8,
    easing: (t) => t,
    smooth: true,
    smoothTouch: true,
});



function raf(t) {
    lenis.raf(t);
    ScrollTrigger.update();
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
        if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: innerWidth, height: innerHeight };
    }
});
// ==================== [모듈 실행] GNB & Footer ====================
// GNB에 lenis를 넘겨줘서 오버레이 때 멈출 수 있게 함
initGnb(lenis);
initFooter(lenis);


// ==================== [NEW] Hero Section Logic (Intro & Drag) ====================

// 1. 초기 애니메이션 (양 옆에서 쾅 나타나기)
const heroSection = document.querySelector("#hero");
const portfolioChars = document.querySelectorAll('#title_portfolio .text_split');
const uxuiChars = document.querySelectorAll('#role_uxui .text_split');
const designerChars = document.querySelectorAll('#role_designer .text_split');

if (heroSection) {
    // 초기 위치 설정 (화면 밖)
    gsap.set(portfolioChars, { x: "-100vw", opacity: 0 });
    gsap.set(uxuiChars, { x: "100vw", opacity: 0 });
    gsap.set(designerChars, { x: "100vw", opacity: 0 });
    gsap.set('.hero_year, .hero_menu_list', { opacity: 0 });

    const introTl = gsap.timeline({
        delay: 0.5,
        defaults: { duration: 1, ease: "power3.out" }
    });

    introTl
        // PORTFOLIO (왼쪽에서)
        .to(portfolioChars, {
            x: 0,
            opacity: 1,
            stagger: 0.03, // 글자별 시간차
            duration: 0.8
        }, 0) // 타임라인 시작점

        // UXUI (오른쪽에서)
        .to(uxuiChars, {
            x: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.9
        }, 0.2) // PORTFOLIO보다 살짝 늦게 시작

        // DESIGNER (오른쪽에서)
        .to(designerChars, {
            x: 0,
            opacity: 1,
            stagger: 0.02,
            duration: 1
        }, 0.3) // UXUI보다 살짝 늦게 시작

        // 나머지 요소 등장
        .to('.hero_year, .hero_menu_list', {
            opacity: 1,
            duration: 0.8,
            ease: "none"
        }, 0.8);

    // 2. [NEW] 마우스 드래그 탄성 효과 (Draggable)
    // [수정] 모든 글자 요소에 Draggable 적용
    const allChars = [...portfolioChars, ...uxuiChars, ...designerChars];

    allChars.forEach(char => {
        // 드래그가 가능한 객체 생성
        Draggable.create(char, {
            type: "x,y",
            // inertia: true, // 관성 효과 추가 (더 탄성 있는 느낌)
            onDragStart: function () {
                // 드래그 시작 시 글자 크기 약간 확대 및 색상 변경
                gsap.to(this.target, { scale: 1.2, duration: 0.1, color: "var(--color-uxui)" });
            },
            onDragEnd: function () {
                // 드래그 종료 시 원위치로 부드럽게 복귀 (탄성 효과)
                const originalColor = this.target.closest('#title_portfolio, #role_uxui, #role_designer').style.color || this.target.parentElement.style.color;

                gsap.to(this.target, {
                    x: 0,
                    y: 0,
                    scale: 1,
                    // [수정] 부모 요소의 원래 색상으로 돌아가도록 설정
                    color: originalColor || "var(--color-designer)",
                    duration: 0.7,
                    ease: "elastic.out(1, 0.3)" // 탄성 이징 적용
                });
            }
        });
    });
}

// 2. Skills Section (Perfect Fit)
const skillSection = document.querySelector("#Skills");
const txtLeft = document.querySelector(".text_left");
const txtRight = document.querySelector(".text_right");
const centerLine = document.querySelector(".center_line");
const receiptImg = document.querySelector(".skillset_img");

if (skillSection && txtLeft && txtRight && centerLine && receiptImg) {

    // 초기화
    gsap.set(centerLine, { width: 0 });

    const skillTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#Skills",
            start: "top top",
            end: "+=2000",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onEnter: () => set_active('#Skills'),
            onEnterBack: () => set_active('#Skills'),
        }
    });

    skillTl
        // [1단계] 텍스트 벌어짐 + 선 생기기
        .to(txtLeft, { x: -250, duration: 1, ease: "power2.out" }, "start") // 텍스트 간격도 살짝 더 벌림
        .to(txtRight, { x: 250, duration: 1, ease: "power2.out" }, "start")

        // [문제 2 해결] 선 길이를 영수증(400px)보다 긴 450px로 설정
        .to(centerLine, { width: 450, duration: 1, ease: "power2.out" }, "start")

        // [2단계] 영수증 내려옴
        .fromTo(receiptImg,
            { yPercent: -100 },
            { yPercent: 0, duration: 2.5, ease: "none" }
        );
}
// ==============================================
// ==============================================
// 4. [Final] Projects Logic (가로 스크롤로 변경)
// ==============================================
gsap.registerPlugin(Draggable, ScrollTrigger);

const projectsSection = document.querySelector("#Projects");
// const scatterItems = document.querySelectorAll(".scatter_item"); // 기존 흩뿌려진 아이템
const projectCards = document.querySelectorAll(".project_card"); // 새로 추가된 카드 아이템
const horizontalTrack = document.querySelector(".horizontal_track");


// 모달 요소들 (기존과 동일하게 유지)
const expandModal = document.querySelector(".project_expand_modal");
const modalBackdrop = document.querySelector(".modal_backdrop");
const modalCloseBtn = document.querySelector(".modal_close_btn"); // 닫기 버튼
// ... (나머지 모달 변수 선언은 기존과 동일)
const expandImgBox = document.querySelector(".expand_img_box");
const expandInfo = document.querySelector(".expand_info");
const expandImg = document.querySelector(".expand_main_img");
const expandTitle = document.querySelector(".expand_title");
const expandCate = document.querySelector(".expand_cate");
const expandWebBtn = document.querySelector(".web_btn");
const expandLandBtn = document.querySelector(".land_btn");

let currentProjectIndex = 0;
let isModalOpen = false;
let isAnimating = false;

if (projectsSection && projectCards.length > 0 && horizontalTrack) {

    // [1] 기존 Draggable 로직 제거

    // [2] 핵심: 가로 스크롤 애니메이션 구현
    const trackWidth = horizontalTrack.scrollWidth;
    const scrollEnd = trackWidth - window.innerWidth; // 스크롤을 끝까지 당겼을 때 translateX 값

    gsap.to(horizontalTrack, {
        x: -scrollEnd, // 가로 트랙을 왼쪽으로 이동
        ease: "none", // 스크럽이므로 ease 없음
        scrollTrigger: {
            trigger: projectsSection,
            start: "top top",
            end: () => `+=${trackWidth}`, // 트랙 너비만큼 스크롤 영역 확보
            pin: true,
            scrub: 1,
            // [추가] GNB 활성화 로직
            onUpdate: (self) => {
                // 스크롤 위치에 따라 GNB 'Projects' 활성화
                if (self.isActive) {
                    set_active('#Projects');
                }
            }
        }
    });

    // ==============================================
    // [NEW] 모달 로직 (클릭 대상 변경)
    // ==============================================

    // 1. 클릭 시 모달 열기 (대상: projectCards로 변경)
    projectCards.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            // if (item.classList.contains("is-dragging")) return; // Draggable 제거로 이 코드 불필요
            currentProjectIndex = index;
            openExpandModal(index);
        });
    });

    // 2. 모달 열기, 3. 모달 닫기, 4. 데이터 세팅 함수는 기존 로직과 동일하게 유지합니다.
    function openExpandModal(index) {
        if (isModalOpen) return;
        isModalOpen = true;
        expandModal.classList.add("active");

        // 내용 채우기 (기존 로직)
        setModalData(index);

        // 초기 등장 애니메이션
        gsap.fromTo([expandImgBox, expandInfo],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 }
        );

        // 스크롤 잠금
        if (typeof lenis !== 'undefined') lenis.stop();
        document.body.style.overflow = "hidden";
    }

    function closeExpandModal() {
        if (!isModalOpen) return;

        // 퇴장 애니메이션
        gsap.to([expandImgBox, expandInfo], {
            y: 50, opacity: 0, duration: 0.4, ease: "power2.in",
            onComplete: () => {
                expandModal.classList.remove("active");
                isModalOpen = false;
                if (typeof lenis !== 'undefined') lenis.start();
                document.body.style.overflow = "auto";
            }
        });
    }

    function setModalData(index) {
        // 클릭 대상이 projectCards로 변경
        const item = projectCards[index];
        expandImg.src = item.querySelector("img").src;
        expandTitle.textContent = item.getAttribute("data-title");
        expandCate.textContent = item.getAttribute("data-cate");
        expandWebBtn.href = item.getAttribute("data-web");
        expandLandBtn.href = item.getAttribute("data-landing");
    }

    // 5. 슬라이드 전환 애니메이션 (기존 로직 동일하게 유지)
    function changeProject(direction) {
        if (isAnimating) return;
        isAnimating = true;

        // direction: 1 (Next, 아래로), -1 (Prev, 위로)
        const outY = direction === 1 ? -100 : 100;
        const inY = direction === 1 ? 100 : -100;

        // 1. 현재 내용 나가기
        gsap.to([expandImgBox, expandInfo], {
            y: outY, opacity: 0, duration: 0.4, ease: "power2.in",
            onComplete: () => {
                // 2. 데이터 교체 (대상: projectCards로 변경)
                if (direction === 1) {
                    currentProjectIndex++;
                    if (currentProjectIndex >= projectCards.length) currentProjectIndex = 0;
                } else {
                    currentProjectIndex--;
                    if (currentProjectIndex < 0) currentProjectIndex = projectCards.length - 1;
                }
                setModalData(currentProjectIndex);

                // 3. 새 내용 들어오기 준비
                gsap.set([expandImgBox, expandInfo], { y: inY, opacity: 0 });

                // 4. 새 내용 들어오기
                gsap.to([expandImgBox, expandInfo], {
                    y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.05,
                    onComplete: () => { isAnimating = false; }
                });
            }
        });
    }

    // 6. 이벤트 리스너 연결 (기존 로직 동일하게 유지)
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeExpandModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeExpandModal);

    // 휠 이벤트 (스크롤 방향 감지)
    window.addEventListener("wheel", (e) => {
        if (!isModalOpen || isAnimating) return;
        const direction = e.deltaY > 0 ? 1 : -1;
        changeProject(direction);
    });
}
const listRows = document.querySelectorAll(".list_row");

if (listRows.length > 0 && lenis && horizontalTrack) {
    listRows.forEach((row, index) => {
        // 첫 번째 슬라이드에는 프로젝트 카드 갯수만큼 가상의 인덱스 부여
        // index 0 -> 첫 번째 카드 (projectCards[0])와 연결됨
        row.addEventListener("click", () => {

            // GSAP으로 가로 트랙 이동 거리를 계산하여 스크롤 위치를 설정

            // 1. 목표 프로젝트 카드 요소 가져오기
            // 목차 순서(0, 1, 2, 3...)는 projectCards의 순서와 동일함
            const targetCard = projectCards[index];

            if (!targetCard) {
                console.error(`Project card at index ${index} not found.`);
                return;
            }

            // 2. 가로 스크롤 트랙의 현재 위치에서 목표 카드까지의 거리를 계산
            // 목표 카드의 왼쪽 경계까지 스크롤되어야 함
            const offset = targetCard.offsetLeft;

            // 3. ScrollTrigger 애니메이션을 강제로 이동시킴
            // ScrollTrigger.getById('프로젝트-스크롤-트리거-ID')를 사용하거나,
            // 간단하게 GSAP의 `ScrollToPlugin`을 이용해 Lenis 스크롤을 이동시킵니다.

            // 프로젝트 섹션 시작 위치 + offset 만큼 스크롤 이동
            const projectsStart = projectsSection.offsetTop;

            // 목표 스크롤 위치 (프로젝트 섹션 시작 위치 + 목표 카드까지의 스크롤 거리)
            // 가로 스크롤의 start 위치 (top top)를 기준으로 
            // x: 0% -> 스크롤 시작
            // x: -scrollEnd -> 스크롤 끝
            // 목표 카드로 이동하기 위한 스크롤 영역 내의 비율을 계산하고, 이를 전체 스크롤 길이에 곱해야 합니다.

            const projectsScrollTrigger = ScrollTrigger.getById('project-horizontal-scroll');
            if (projectsScrollTrigger) {

                // 목표 카드가 트랙 시작점으로부터 떨어진 거리 (offset)
                const distanceToTarget = offset;

                // 전체 스크롤 길이 (horizontalTrack의 총 너비)
                const totalTrackWidth = horizontalTrack.scrollWidth;
                const totalScrollRange = totalTrackWidth - window.innerWidth;

                // 해당 카드가 화면 중앙에 올 때까지의 스크롤 위치 비율 계산
                // 카드 너비의 절반 + 간격 등을 고려할 수 있지만, 여기서는 간단히 offset을 기준으로 합니다.

                // horizontalTrack이 x: -scrollEnd 만큼 움직이므로, 
                // offset에 해당하는 x 이동을 발생시키는 ScrollTrigger 진행률(Progress)을 찾아야 함.
                // ScrollTrigger의 진행률(Progress)은 0부터 1까지입니다.

                // 목표 translateX 값: -(targetCard.offsetLeft - window.innerWidth / 2)
                const targetTranslateX = -(targetCard.offsetLeft - 100); // 100px 여백 

                // targetTranslateX가 전체 움직임(-scrollEnd)에서 차지하는 비율
                const progress = Math.max(0, Math.min(1, targetTranslateX / (-scrollEnd)));

                // 계산된 진행률(Progress)로 ScrollTrigger를 이동시킵니다.
                // 이 방법은 Lenis와 ScrollTrigger가 연결되어 있기 때문에 Lenis의 세로 스크롤 위치를 변경합니다.
                projectsScrollTrigger.scroll(projectsScrollTrigger.start + (projectsScrollTrigger.end - projectsScrollTrigger.start) * progress);

            } else {
                // 비상 fallback: Lenis.scrollTo를 사용해 Projects 섹션 시작 위치로 강제 이동
                lenis.scrollTo('#Projects', { offset: 0, duration: 1.2 });
            }
        });
    });
}

// 기존 ScrollTrigger 로직 (main.js)을 수정하여 ID를 부여합니다.
/*
    const projTl = gsap.timeline({
        scrollTrigger: {
            id: 'project-horizontal-scroll', // ID 추가
            trigger: projectsSection,
            start: "top top",
            end: () => `+=${trackWidth}`,
            pin: true,
            scrub: 1,
            // ... (나머지 옵션)
        }
    });
*/
// ... (나머지 섹션 로직은 기존과 동일하게 유지)
// 5. Visual Archive
ScrollTrigger.create({
    trigger: "#Visual",
    start: "top center", end: "bottom center",
    onEnter: () => set_active("#Visual"),
    onEnterBack: () => set_active("#Visual")
});

// Visual Archive Hover Effect
const jnRows = document.querySelectorAll(".jn_row");
const jnCursorWrap = document.querySelector(".jn_cursor_img");
const jnPreviewImg = document.querySelector("#jn_preview_target");

if (jnCursorWrap) {
    let jnXTo = gsap.quickTo(jnCursorWrap, "x", { duration: 0.4, ease: "power3" });
    let jnYTo = gsap.quickTo(jnCursorWrap, "y", { duration: 0.4, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
        if (jnCursorWrap.style.opacity > 0) {
            jnXTo(e.clientX);
            jnYTo(e.clientY);
        }
    });

    jnRows.forEach((row) => {
        row.addEventListener("mouseenter", () => {
            const imgSrc = row.getAttribute("data-img");
            if (imgSrc && jnPreviewImg) {
                jnPreviewImg.src = imgSrc;
                gsap.to(jnCursorWrap, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
            }
        });
        row.addEventListener("mouseleave", () => {
            gsap.to(jnCursorWrap, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.out" });
        });
    });
}

// Custom Cursor for Visual Section
const visualSection = document.querySelector("#Visual");
const cursorIcon = document.querySelector(".project_cursor");

if (visualSection && cursorIcon) {
    gsap.set(cursorIcon, { xPercent: -50, yPercent: -50 });
    let cursorX = gsap.quickTo(cursorIcon, "x", { duration: 0.2, ease: "power3" });
    let cursorY = gsap.quickTo(cursorIcon, "y", { duration: 0.2, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
    });

    visualSection.addEventListener("mouseenter", () => {
        gsap.to(cursorIcon, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
    });
    visualSection.addEventListener("mouseleave", () => {
        gsap.to(cursorIcon, { opacity: 0, scale: 0.5, duration: 0.3, ease: "power2.out" });
    });
}
const modal = document.querySelector("#img_modal");
const modalImg = document.querySelector(".modal_img");
const modalClose = document.querySelector(".modal_close");

jnRows.forEach((row) => {
    const imgSrc = row.getAttribute("data-img");

    // 1. 마우스 호버 (기존 유지 - 데스크탑용)
    row.addEventListener("mouseenter", () => {
        if (imgSrc && jnPreviewImg) {
            jnPreviewImg.src = imgSrc;
            gsap.to(jnCursorWrap, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
        }
    });
    row.addEventListener("mouseleave", () => {
        gsap.to(jnCursorWrap, { opacity: 0, scale: 0.8, duration: 0.3, ease: "power2.out" });
    });

    // 2. [추가] 클릭 시 모달 오픈 (모바일/데스크탑 공용)
    row.addEventListener("click", () => {
        if (imgSrc && modal) {
            modalImg.src = imgSrc;
            modal.classList.add("active");
            if (lenis) lenis.stop(); // 스크롤 막기
        }
    });
});

// 모달 닫기 기능
if (modalClose && modal) {
    const closeModal = () => {
        modal.classList.remove("active");
        if (lenis) lenis.start(); // 스크롤 재개
    };
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(); // 배경 클릭 시 닫기
    });
}

// 6. Rainbow Text Logic (Class)
const ASCII_CHARS = "abcdefghijklmnñopqrstuvwxyz0123456789!#$%&/?'_-";
const RB_COLORS = ["#ee637aff", "#fc9867", "#ffd866", "#a9dc76", "#78dce8", "#ab9df2"];

class RainbowButton {
    constructor(_btn) {
        if (!_btn) return;
        this.el = _btn;
        this.txt = this.el.innerText;
        this.overColor = RB_COLORS[0];
        this.fps = 24;
        this.over_active = false;
        this.events();
    }
    events() {
        this.el.addEventListener("mouseenter", () => this.onMouseEnter(), false);
        this.el.addEventListener("mouseleave", () => this.onMouseLeave(), false);
    }
    onMouseEnter() {
        this.over_active = true;
        this.el.innerHTML = "";
        this.rainbow();
    }
    rainbow() {
        let letters = this.txt.split("");
        for (let i = 0; i < letters.length; i++) {
            const span = document.createElement("span");
            this.el.appendChild(span);
            const letter = letters[i];
            span.innerText = letter;
            if (letter != " ") {
                let idx = ASCII_CHARS.indexOf(letter.toLowerCase());
                let initChar = (idx !== -1 && idx > 10) ? ASCII_CHARS[idx - 9] : ASCII_CHARS[0];
                setTimeout(() => this.letterTo(span, initChar, letter), 60 * i);
            }
        }
    }
    onMouseLeave() {
        this.over_active = false;
        this.el.innerHTML = this.txt;
        this.el.style.color = "";
    }
    letterTo(span, from, to) {
        let char = to;
        let color = this.overColor;
        if (from != to.toLowerCase() && this.over_active) {
            const idx = ASCII_CHARS.indexOf(from.toLowerCase());
            color = RB_COLORS[~~(Math.random() * RB_COLORS.length)];
            char = Math.random() > .5 ? from : from.toUpperCase();
            setTimeout(() => {
                let nextChar = (idx !== -1) ? ASCII_CHARS[idx + 1] : to;
                this.letterTo(span, nextChar, to);
            }, 1000 / this.fps);
        }
        span.style.color = color;
        span.innerText = char;
    }
}

// 7. Philosophy Section
const philoSection = document.querySelector("#philosophy");
const rainbowTarget = document.querySelector("#rainbow-text");
const tagWrap = document.querySelector(".hanging_tag_wrap");

if (philoSection && rainbowTarget) {
    const rbBtn = new RainbowButton(rainbowTarget);

    ScrollTrigger.create({
        trigger: "#philosophy",
        start: "top top",
        end: "+=1000",
        pin: true,
        onEnter: () => {
            // ... (기존 코드)
            rainbowTarget.style.opacity = "1";
            rainbowTarget.classList.add("active");
            rbBtn.onMouseEnter();
            document.querySelector('header').classList.add('on'); // 진입 시 어둡게
            if (tagWrap) {
                gsap.to(tagWrap, {
                    y: "0%",          // 원래 위치로 내려옴
                    autoAlpha: 1,     // opacity:1, visibility:visible
                    duration: 1.5,    // 내려오는 시간
                    ease: "bounce.out" // 텅! 하고 떨어지는 탄성 효과
                });
            }
        },
        onLeaveBack: () => {
            if (tagWrap) {
                gsap.to(tagWrap, { y: "-100%", autoAlpha: 0, duration: 0.5 });
            }
            rbBtn.onMouseLeave();
            rainbowTarget.classList.remove("active");

            // [추가] 위로 올라갈 때 헤더 클래스 제거
            document.querySelector('header').classList.remove('on');
        },
        onLeave: () => {
            document.querySelector('header').classList.remove('on'); // 아래로 벗어날 때 밝게
        },
        onEnterBack: () => {
            document.querySelector('header').classList.add('on'); // 아래에서 다시 올라올 때 어둡게
        },
    });
}

// Refresh Triggers on Load/Resize
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 100);
});
window.addEventListener("resize", () => ScrollTrigger.refresh());

window.addEventListener("load", () => {
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 300);
});
