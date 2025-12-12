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


// 1. 초기 애니메이션 (양 옆에서 쾅 나타나기)
const heroSection = document.querySelector("#hero");
const portfolioChars = document.querySelectorAll('#title_portfolio .text_split');
const uxuiChars = document.querySelectorAll('#role_uxui .text_split');
const designerChars = document.querySelectorAll('#role_designer .text_split');

if (heroSection) {
    // ... (기존 초기 애니메이션 로직 유지) ...
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
        }, 0)

        // UXUI (오른쪽에서)
        .to(uxuiChars, {
            x: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.9
        }, 0.2)

        // DESIGNER (오른쪽에서)
        .to(designerChars, {
            x: 0,
            opacity: 1,
            stagger: 0.02,
            duration: 1
        }, 0.3)

        // 나머지 요소 등장
        .to('.hero_year, .hero_menu_list', {
            opacity: 1,
            duration: 0.8,
            ease: "none"
        }, 0.8);


    // 2. [최종 수정] 마우스 호버 탄성 스트레칭 효과 로직
    const allChars = [...portfolioChars, ...uxuiChars, ...designerChars];

    let originalColors = new Map();

    // 모든 글자에 원래 색상 저장 및 이벤트 리스너 추가
    allChars.forEach(char => {
        const getOriginalColor = () => {
            const parentId = char.parentElement.id;
            switch (parentId) {
                case 'title_portfolio': return 'var(--color-portfolio)';
                case 'role_uxui': return 'var(--color-uxui)';
                case 'role_designer': return 'var(--color-designer)';
                default: return 'var(--color-designer)';
            }
        };
        originalColors.set(char, getOriginalColor());
    });

    // Hero Section에 마우스 무브 이벤트 바인딩
    heroSection.addEventListener('mousemove', (e) => {
        allChars.forEach(char => {
            const rect = char.getBoundingClientRect();
            const charCenterX = rect.left + rect.width / 2;
            const charCenterY = rect.top + rect.height / 2;

            const dx = e.clientX - charCenterX;
            const dy = e.clientY - charCenterY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            const influenceRadius = 100; // 효과가 미치는 반경 (픽셀)

            if (distance < influenceRadius) {
                const strength = 1 - distance / influenceRadius; // 0 (멀리) ~ 1 (가까이)

                // 1. 미세한 위치 변화 (글자를 당기는 느낌)
                const maxTranslate = 10;
                const targetX = dx * 0.1 * strength;
                const targetY = dy * 0.1 * strength;

                // 2. [핵심] 늘어남 (ScaleX/ScaleY) 구현
                // 마우스가 글자 중심으로부터 어느 방향으로 당기는가 (Normalized vector)
                const normalizedDX = dx / distance || 0;
                const normalizedDY = dy / distance || 0;

                // 늘어나는 정도 (최대 5% 늘어남, 3% 압축)
                const maxStretch = 0.05;
                const maxCompress = -0.03;

                // 마우스가 가로축으로 당기면 -> 가로 늘어남 (scaleX), 세로 압축 (scaleY)
                // 마우스가 세로축으로 당기면 -> 세로 늘어남 (scaleY), 가로 압축 (scaleX)

                const stretchX = 1 + normalizedDX * maxStretch * strength;
                const compressY = 1 + normalizedDX * maxCompress * strength;

                const stretchY = 1 + normalizedDY * maxStretch * strength;
                const compressX = 1 + normalizedDY * maxCompress * strength;

                // 최종 ScaleX, ScaleY는 두 효과를 합성 (가로/세로축의 늘어남/압축 효과)
                const finalScaleX = (stretchX + compressX) / 2;
                const finalScaleY = (stretchY + compressY) / 2;


                gsap.to(char, {
                    x: targetX,
                    y: targetY,
                    scaleX: finalScaleX,
                    scaleY: finalScaleY,
                    color: "var(--color-uxui)", // 효과 발생 시 포인트 색상으로
                    duration: 0.1, // 반응 속도 빠르게
                    ease: "power2.out"
                });

            } else {
                // 영향 범위 밖, 제자리와 원래 색상으로 돌아오기 (탄성 이징 적용)
                gsap.to(char, {
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    color: originalColors.get(char),
                    duration: 0.7,
                    ease: "elastic.out(1, 0.4)" // 탄성 효과
                });
            }
        });
    });

    // 마우스가 Hero Section을 떠났을 때 모든 글자를 원래 상태로 복귀
    heroSection.addEventListener('mouseleave', () => {
        allChars.forEach(char => {
            gsap.to(char, {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                color: originalColors.get(char),
                duration: 0.7,
                ease: "elastic.out(1, 0.4)"
            });
        });
    });

}
// ==================== Section Animations ====================
const AboutSection = document.querySelector(".About");
if (AboutSection) {
    // [초기 설정]
    // 열쇠: 위로 숨김
    gsap.set(".about_key_wrap", { y: "-120%" });

    // 카드: 개별적으로 오른쪽 화면 밖으로 보냄 (컨테이너 이동 X)
    gsap.set(".card", { x: "100vw", opacity: 1 });

    let AboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".About",
            start: "top top",
            end: "+=3000",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onEnter: () => {
                set_active('#About');
                document.querySelector('header').classList.remove('on');
            },
            onLeave: () => document.querySelector('header').classList.remove('on'),
            onEnterBack: () => {
                set_active('#About');
                document.querySelector('header').classList.remove('on');
            }
        }
    });

    AboutTl
        // [Step 1] 열쇠 내려오기
        .to(".about_key_wrap", {
            y: "0%",
            duration: 2,
            ease: "power2.out"
        })

        // [Step 2] 열쇠 올라가기
        .to(".about_key_wrap", {
            y: "-120%",
            duration: 2,
            ease: "power2.in"
        }, "+=0.2")

        // [Step 3] 카드들이 하나씩 순차적으로 들어오기 (Stagger)
        // 뭉텅이가 아니라 따발총처럼 하나씩 착착착 들어옵니다.
        .to(".card", {
            x: "0%",         // 제자리로
            duration: 3,     // 들어오는 속도
            stagger: 0.2,    // 0.2초 간격으로 출발
            ease: "power2.out"
        }, "-=1.5") // 열쇠가 올라가는 도중에 첫 카드가 출발

        // [Step 4] 카드 뒤집기 (역시 순차적으로)
        .to(".card", {
            rotationY: 180,
            duration: 2,
            stagger: 0.3,    // 뒤집히는 것도 시차를 둠
            ease: "power1.inOut"
        }, "+=0.5"); // 카드가 다 도착하고 조금 뒤에 뒤집기 시작
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
// 4. [Final] Projects Logic
// ==============================================
gsap.registerPlugin(Draggable, ScrollTrigger);

const projectsSection = document.querySelector("#Projects");
const scatterItems = document.querySelectorAll(".scatter_item");

// 모달 요소들
const expandModal = document.querySelector(".project_expand_modal");
const modalBackdrop = document.querySelector(".modal_backdrop");
const modalCloseBtn = document.querySelector(".modal_close_btn"); // 닫기 버튼

// 모달 내부 컨텐츠
const expandImgBox = document.querySelector(".expand_img_box");
const expandInfo = document.querySelector(".expand_info");

const expandImg = document.querySelector(".expand_main_img");
const expandTitle = document.querySelector(".expand_title");
const expandCate = document.querySelector(".expand_cate");
const expandWebBtn = document.querySelector(".web_btn");
const expandLandBtn = document.querySelector(".land_btn");

let currentProjectIndex = 0;
let isModalOpen = false;
let isAnimating = false; // 애니메이션 중복 실행 방지

if (projectsSection && scatterItems.length > 0) {

    // [1] 기존 기능 유지: Draggable
    Draggable.create(".scatter_item", {
        type: "x,y",
        bounds: "#Projects",
        inertia: true,
        onDragStart: function () { this.target.classList.add("is-dragging"); },
        onDragEnd: function () { setTimeout(() => this.target.classList.remove("is-dragging"), 100); }
    });

    // [2] 기존 기능 유지: ScrollTrigger
    const projTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#Projects", start: "top top", end: "+=4000", pin: true, scrub: 1, anticipatePin: 1
        }
    });
    projTl
        .fromTo(".bg_left", { x: "-100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 5 })
        .fromTo(".bg_right", { x: "100%", opacity: 0 }, { x: "0%", opacity: 1, duration: 5 }, "<")
        .fromTo(".scatter_item", { y: "150vh", scale: 0.2, rotation: 30 }, { y: 0, scale: 1, rotation: 0, duration: 10, stagger: 1, ease: "back.out(1.2)" }, "-=2");


    // ==============================================
    // [NEW] 모달 로직 (부드러운 슬라이드)
    // ==============================================

    // 1. 클릭 시 모달 열기
    scatterItems.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (item.classList.contains("is-dragging")) return;
            currentProjectIndex = index;
            openExpandModal(index);
        });
    });

    // 2. 모달 열기 (초기 진입)
    function openExpandModal(index) {
        if (isModalOpen) return;
        isModalOpen = true;
        expandModal.classList.add("active");

        // 내용 채우기
        setModalData(index);

        // 초기 등장 애니메이션 (아래에서 위로 스윽)
        gsap.fromTo([expandImgBox, expandInfo],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.1 }
        );

        // 스크롤 잠금
        if (typeof lenis !== 'undefined') lenis.stop();
        document.body.style.overflow = "hidden";
    }

    // 3. 모달 닫기
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

    // 4. 데이터 세팅 함수
    function setModalData(index) {
        const item = scatterItems[index];
        expandImg.src = item.querySelector("img").src;
        expandTitle.textContent = item.getAttribute("data-title");
        expandCate.textContent = item.getAttribute("data-cate");
        expandWebBtn.href = item.getAttribute("data-web");
        expandLandBtn.href = item.getAttribute("data-landing");
    }

    // 5. [핵심] 슬라이드 전환 애니메이션 (방향성 적용)
    function changeProject(direction) {
        if (isAnimating) return;
        isAnimating = true;

        // direction: 1 (Next, 아래로), -1 (Prev, 위로)
        // 나가는 방향 설정
        const outY = direction === 1 ? -100 : 100; // 다음 거 볼 땐 현재 거가 위로 올라감
        const inY = direction === 1 ? 100 : -100;  // 다음 거는 아래에서 올라옴

        // 1. 현재 내용 나가기
        gsap.to([expandImgBox, expandInfo], {
            y: outY, opacity: 0, duration: 0.4, ease: "power2.in",
            onComplete: () => {
                // 2. 데이터 교체
                if (direction === 1) {
                    currentProjectIndex++;
                    if (currentProjectIndex >= scatterItems.length) currentProjectIndex = 0;
                } else {
                    currentProjectIndex--;
                    if (currentProjectIndex < 0) currentProjectIndex = scatterItems.length - 1;
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

    // 6. 이벤트 리스너 연결
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeExpandModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeExpandModal);

    // 휠 이벤트 (스크롤 방향 감지)
    window.addEventListener("wheel", (e) => {
        if (!isModalOpen || isAnimating) return;
        // 휠을 아래로(양수) -> 다음 프로젝트(1)
        // 휠을 위로(음수) -> 이전 프로젝트(-1)
        const direction = e.deltaY > 0 ? 1 : -1;
        changeProject(direction);
    });
}
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
