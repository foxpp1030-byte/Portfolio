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

// ==================== [NEW] ABOUT Section Animation (Revised) ====================
const aboutSection = document.querySelector("#About");
const mainTextElement = document.querySelector(".about_main_text");

// [기능] 텍스트를 한 글자씩 쪼개서 span으로 감싸는 함수 (유지)
function splitTextToSpans(element) {
    if (!element) return;
    const text = element.innerText;
    element.innerHTML = '';
    const lines = text.split('\n');

    lines.forEach((line, lineIndex) => {
        const chars = line.split('');
        chars.forEach(char => {
            const span = document.createElement('span');
            span.classList.add('char-effect');
            span.textContent = char === ' ' ? '\u00A0' : char;
            element.appendChild(span);
        });
        if (lineIndex < lines.length - 1) {
            const br = document.createElement('br');
            element.appendChild(br);
        }
    });
}

if (aboutSection) {
    // 1. 텍스트 쪼개기 실행
    if (mainTextElement) splitTextToSpans(mainTextElement);

    // [핵심 변경] scrub 대신 toggleActions 사용으로 "자동 재생" 느낌 강화
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#About",
            start: "top 60%",     // 화면 60% 진입 시 시작
            end: "bottom bottom",
            toggleActions: "play none none reverse", // 스크롤 내리면 재생, 다시 올리면 역재생
            onEnter: () => set_active('#About'),
            onEnterBack: () => set_active('#About'),
        }
    });

    aboutTl
        // 1. 타이틀 등장
        .from(".about_title", {
            y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
        })

        // 2. 라인 긋기 (왼쪽 -> 오른쪽)
        .to(".about_deco_line", {
            scaleX: 1,
            duration: 1.2,
            ease: "expo.out"
        }, "-=0.4")

        // 3. 메인 텍스트 한 글자씩 등장 (Stagger 효과 극대화)
        .to(".char-effect", {
            opacity: 1,
            y: 0,
            rotation: 0,
            stagger: 0.03,
            duration: 0.6,
            ease: "back.out(1.7)"
        }, "-=0.8")

        // 4. 서브 텍스트 등장
        .from(".about_sub_text", {
            y: 30, opacity: 0, duration: 1, ease: "power3.out"
        }, "-=0.4")

        // 5. 키워드 태그 등장 (문제 해결: 투명도 0 -> 1로 확실하게 변경)
        .to(".about_keywords span", {
            y: 0,
            opacity: 1, // 확실하게 보이도록 설정
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)"
        }, "-=0.4");

    // 초기 상태 설정 (JS 로드 시점에 깜빡임 방지)
    gsap.set(".about_keywords span", { y: 20, opacity: 0 });
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
// ==================== Projects Section (가로 스크롤 + 애니메이션) ====================

const projectsSection = document.querySelector("#Projects");
const horizontalTrack = document.querySelector(".horizontal_track");
const projectCards = document.querySelectorAll(".project_card");
const listRows = document.querySelectorAll(".list_row");

let currentProjectIndex = -1; // 초기값을 -1로 설정 (아무것도 활성화 안됨)

if (projectsSection && horizontalTrack && projectCards.length > 0) {

    // 1. 가로 스크롤 애니메이션 설정
    const trackWidth = horizontalTrack.scrollWidth;
    const scrollEnd = trackWidth - window.innerWidth;

    const projectScrollTrigger = gsap.to(horizontalTrack, {
        x: -scrollEnd,
        ease: "none",
        scrollTrigger: {
            id: 'project-horizontal-scroll',
            trigger: projectsSection,
            start: "top top",
            end: () => `+=${trackWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
                if (self.isActive) {
                    set_active('#Projects');
                }

                // 현재 보이는 카드 인덱스 계산
                const progress = self.progress;

                const START_THRESHOLD = 0.05; // 스크롤 시작 5% 지점부터 카드 활성화 시작
                const ACTIVE_RANGE = 1 - START_THRESHOLD; // 카드가 활성화될 전체 스크롤 범위 (0.95)

                // 목차 화면(progress 0~0.2): 아무 카드도 활성화 안함
                // 각 프로젝트 카드: 0.2, 0.4, 0.6, 0.8~1.0
                let newIndex = -1;

                if (progress < START_THRESHOLD) {
                    newIndex = -1; // 목차 화면
                } else {
                    // 프로젝트 카드 인덱스 계산
                    newIndex = Math.floor((progress - START_THRESHOLD) / (ACTIVE_RANGE / projectCards.length));
                    newIndex = Math.min(newIndex, projectCards.length - 1);
                }

                // 인덱스가 변경되었을 때만 클래스 업데이트
                if (newIndex !== currentProjectIndex) {
                    projectCards.forEach((card, i) => {
                        if (i === newIndex) {
                            card.classList.add('active');
                        } else {
                            card.classList.remove('active');
                        }
                    });
                    currentProjectIndex = newIndex;
                }
            },
            onLeaveBack: () => {
                // 섹션을 완전히 벗어날 때 모든 카드 비활성화
                projectCards.forEach(card => card.classList.remove('active'));
                currentProjectIndex = -1;
            }
        }
    });

    // 2. 목차에서 프로젝트로 이동하는 기능
    listRows.forEach((row, index) => {
        row.addEventListener("click", () => {
            const targetCard = projectCards[index];
            if (!targetCard) return;

            const projectsScrollTrigger = ScrollTrigger.getById('project-horizontal-scroll');
            if (projectsScrollTrigger) {
                // 목표 카드까지의 거리 계산
                const offset = targetCard.offsetLeft;
                const targetTranslateX = -(offset - 100);
                const progress = Math.max(0, Math.min(1, targetTranslateX / (-scrollEnd)));

                // 해당 위치로 스크롤 이동
                const targetScroll = projectsScrollTrigger.start +
                    (projectsScrollTrigger.end - projectsScrollTrigger.start) * progress;

                gsap.to(window, {
                    scrollTo: targetScroll,
                    duration: 1.5,
                    ease: "power2.inOut"
                });
            }
        });
    });
}

// ==================== 페이지 로드 시 ScrollTrigger 새로고침 ====================
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    setTimeout(() => ScrollTrigger.refresh(), 300);
});

window.addEventListener("resize", () => ScrollTrigger.refresh());

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
const RB_COLORS = ["#ffffffff", "#f77f06ff", "#672817ff", "#2b381fff", "#78dce8", "#ab9df2"];

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