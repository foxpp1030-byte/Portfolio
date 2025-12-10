import { initGnb, set_active } from './gnb.js';
import { initFooter } from './footer.js';

// ==================== 새로고침 시 맨 위로 ====================
if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ==================== Lenis Scroll Setup ====================
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => t,
        smooth: true,
        smoothTouch: true,
    });

    lenis.stop();
    document.body.style.overflow = "hidden";

    function raf(t) {
        lenis.raf(t);
        ScrollTrigger.update();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ==================== [모듈 실행] GNB & Footer ====================
    // GNB에 lenis를 넘겨줘서 오버레이 때 멈출 수 있게 함
    initGnb(lenis);
    initFooter();

    // ==================== Intro Logic ====================
    const enterBtn = document.querySelector("#enter-btn");
    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            document.body.style.overflow = "auto";
            lenis.start();
            gsap.to(window, {
                scrollTo: "#About",
                duration: 1.5,
                ease: "power4.inOut"
            });
        });
    }

    // ==================== Section Animations ====================

    // 1. About Section (Horizontal & Flip)
    const AboutSection = document.querySelector(".About");
    if (AboutSection) {
        let AboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".About",
                start: "top top",
                end: "+=2500",
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onEnter: () => {
                    set_active('#About');
                    document.querySelector('header').classList.add('on'); // 진입 시 어둡게
                },
                onLeave: () => {
                    document.querySelector('header').classList.remove('on'); // 아래로 벗어날 때 밝게
                },
                onEnterBack: () => {
                    set_active('#About');
                    document.querySelector('header').classList.add('on'); // 아래에서 다시 올라올 때 어둡게
                },
                // [추가] 위로 벗어날 때(Hero로 갈 때) 밝게 원복
                onLeaveBack: () => {
                    set_active('#About'); // 혹은 set_active(null) 취향껏
                    document.querySelector('header').classList.remove('on');
                }
            }
        });

        AboutTl.fromTo(".card_frame",
            { x: "120%" },
            { x: "0%", duration: 5, ease: "power2.out" }
        );

        const cards = gsap.utils.toArray(".About .card");
        cards.forEach((card) => {
            AboutTl.to(card, {
                rotationY: 180,
                duration: 1.8,
                ease: "back.out(1.7)"
            }, "+=0.2");
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

    // 3. Projects Scroll Active
    ScrollTrigger.create({
        trigger: "#Projects",
        start: "top center", end: "bottom center",
        onEnter: () => set_active("#Projects"),
        onEnterBack: () => set_active("#Projects")
    });

    // 4. Projects Layered Reveal & Horizontal Scroll (Plus X Style)
    const projectSection = document.querySelector("#projects_scroll_view");
    const track = document.querySelector(".horizontal_track");
    const coverSection = document.querySelector("#Projects");

    if (projectSection && track && coverSection) {

        // 1. Calculate the movement distance
        // We want to scroll horizontally: (Track Width - Screen Width)
        const scrollAmount = track.scrollWidth - window.innerWidth;

        // 2. Create a Timeline attached to the ScrollTrigger
        const projTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#projects_scroll_view",
                start: "top top", // Starts immediately because of the negative margin
                // Total Scroll Duration = Reveal Height (Cover) + Horizontal Scroll Length
                end: () => `+=${window.innerHeight + scrollAmount}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true, // Recalculate on resize
                onEnter: () => set_active("#Projects"),
                onEnterBack: () => set_active("#Projects"),
            }
        });

        // 3. Define the Animation Sequence
        // Phase A: The Reveal (Wait). 
        // We add a dummy tween for the duration of the viewport height. 
        // During this scroll distance, the Cover (#Projects) scrolls up naturally, 
        // revealing the pinned #projects_scroll_view behind it.
        projTl.to(track, {
            x: 0,
            duration: window.innerHeight,
            ease: "none"
        });

        // Phase B: The Horizontal Scroll
        // After the cover is gone, we start moving the track.
        projTl.to(track, {
            x: -scrollAmount,
            duration: scrollAmount,
            ease: "none"
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


});
// ==================== Intro Logic (수정됨) ====================
const enterBtn = document.querySelector("#enter-btn");

// 입장 동작 함수 분리
const enterSite = () => {
    document.body.style.overflow = "auto";
    lenis.start();
    gsap.to(window, {
        scrollTo: "#About",
        duration: 1.5,
        ease: "power4.inOut"
    });
    // 자동 입장 타이머가 있다면 해제 (중복 실행 방지)
    if (autoEnterTimer) clearTimeout(autoEnterTimer);
};

// 5초 뒤 자동 입장 (사용자가 아무것도 안 하면)
let autoEnterTimer = setTimeout(() => {
    // 이미 스크롤이 되어있거나 다른 섹션이면 실행 X
    if (window.scrollY < 100) {
        enterSite();
    }
}, 5000); // 5초 설정

if (enterBtn) {
    enterBtn.addEventListener("click", enterSite);
}

