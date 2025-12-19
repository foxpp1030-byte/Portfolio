import { initGnb, set_active } from './gnb.js';
import { initFooter } from './footer.js';

// ==================== 1. Scroll Restoration (가장 먼저 실행) ====================
// 브라우저의 자동 스크롤 복원 기능을 끄고 수동으로 제어
if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
}

// 페이지 로드 즉시 최상단으로 이동 (깜빡임 방지)
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, Draggable);

// ==================== 2. Lenis Scroll Setup ====================
const lenis = new Lenis({
    duration: 0.8,
    easing: (t) => t,
    smooth: true,
    smoothTouch: true,
});

// Lenis 내부 상태도 0으로 강제 초기화
lenis.scrollTo(0, { immediate: true });

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

// ==================== 3. Module Execution ====================
initGnb(lenis);
initFooter(lenis);

// ==================== 4. GNB Hide/Show Logic ====================
const header = document.querySelector('header');
ScrollTrigger.create({
    start: 'top top',
    end: 99999,
    onUpdate: (self) => {
        const direction = self.direction;
        if (direction === 1 && self.scroll() > 50) {
            header.classList.add('hide');
            header.classList.remove('menu-open');
        } else if (direction === -1) {
            header.classList.remove('hide');
        }
    }
});

// ==================== 5. Hero Section Logic ====================
const heroSection = document.querySelector("#hero");
const portfolioChars = document.querySelectorAll('#title_portfolio .text_split');
const uxuiChars = document.querySelectorAll('#role_uxui .text_split');
const designerChars = document.querySelectorAll('#role_designer .text_split');

if (heroSection) {
    gsap.set(portfolioChars, { x: "-100vw", opacity: 0 });
    gsap.set(uxuiChars, { x: "100vw", opacity: 0 });
    gsap.set(designerChars, { x: "100vw", opacity: 0 });
    gsap.set('.hero_year, .hero_menu_list', { opacity: 0 });

    const introTl = gsap.timeline({
        delay: 0.5,
        defaults: { duration: 1, ease: "power3.out" }
    });

    introTl
        .to(portfolioChars, { x: 0, opacity: 1, stagger: 0.03, duration: 0.8 }, 0)
        .to(uxuiChars, { x: 0, opacity: 1, stagger: 0.05, duration: 0.9 }, 0.2)
        .to(designerChars, { x: 0, opacity: 1, stagger: 0.02, duration: 1 }, 0.3)
        .to('.hero_year, .hero_menu_list', { opacity: 1, duration: 0.8, ease: "none" }, 0.8);

    const allChars = [...portfolioChars, ...uxuiChars, ...designerChars];
    allChars.forEach(char => {
        Draggable.create(char, {
            type: "x,y",
            onDragStart: function () {
                gsap.to(this.target, { scale: 1.2, duration: 0.1, color: "var(--color-uxui)" });
            },
            onDragEnd: function () {
                const originalColor = this.target.closest('#title_portfolio, #role_uxui, #role_designer').style.color || this.target.parentElement.style.color;
                gsap.to(this.target, {
                    x: 0, y: 0, scale: 1,
                    color: originalColor || "var(--color-designer)",
                    duration: 0.7, ease: "elastic.out(1, 0.3)"
                });
            }
        });
    });
}


// ==================== 6. Skills Section (Modified for Speed) ====================
const skillSection = document.querySelector("#Skills");
const txtLeft = document.querySelector(".text_left");
const txtRight = document.querySelector(".text_right");
const centerLine = document.querySelector(".center_line");
const receiptImg = document.querySelector(".skillset_img");

if (skillSection && txtLeft && txtRight && centerLine && receiptImg) {
    // 초기값 설정
    gsap.set(centerLine, { width: 0 });
    gsap.set(receiptImg, { yPercent: -100 });

    const skillTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#Skills",
            start: "top top",
            // [수정] 스크롤 길이 단축 (2500 -> 1500) : 더 빨리 끝남
            end: "+=1500",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onEnter: () => set_active('#Skills'),
            onEnterBack: () => set_active('#Skills'),
            invalidateOnRefresh: true
        }
    });

    skillTl
        .to(txtLeft, { x: -250, duration: 1, ease: "power2.out" }, "start")
        .to(txtRight, { x: 250, duration: 1, ease: "power2.out" }, "start")
        .to(centerLine, { width: 450, duration: 1, ease: "power2.out" }, "start")
        .to(receiptImg, { yPercent: 0, duration: 2.5, ease: "none" }, "-=0.5");
}

// ==================== 7. Projects Section ====================
const projectsSection = document.querySelector("#Projects");
const horizontalTrack = document.querySelector(".horizontal_track");
const projectCards = document.querySelectorAll(".project_card");
const listRows = document.querySelectorAll(".list_row");
let currentProjectIndex = -1;

if (projectsSection && horizontalTrack && projectCards.length > 0) {
    const trackWidth = horizontalTrack.scrollWidth;
    const scrollEnd = trackWidth - window.innerWidth + 200;

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
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                if (self.isActive) set_active('#Projects');
                const progress = self.progress;
                const START_THRESHOLD = 0.05;
                const ACTIVE_RANGE = 1 - START_THRESHOLD;
                let newIndex = -1;

                if (progress < START_THRESHOLD) {
                    newIndex = -1;
                } else {
                    newIndex = Math.floor((progress - START_THRESHOLD) / (ACTIVE_RANGE / projectCards.length));
                    newIndex = Math.min(newIndex, projectCards.length - 1);
                }

                if (newIndex !== currentProjectIndex) {
                    projectCards.forEach((card, i) => {
                        // [수정됨] 한번 활성화된 카드는 active 클래스를 제거하지 않음
                        if (i === newIndex) {
                            card.classList.add('active');
                        }
                        // else { card.classList.remove('active'); } // 제거 로직 주석 처리
                    });
                    currentProjectIndex = newIndex;
                }
            },
            onLeaveBack: () => {
                // 스크롤을 완전히 다시 올려서 프로젝트 섹션을 벗어났을 때만 초기화할지 결정
                // "한번 나타나면 안사라지게" 요청에 따라 이 부분도 주석 처리하거나, 
                // 완전히 섹션을 벗어나면 리셋하고 싶다면 유지.
                // 일단 사용자가 '프로젝트 부분'을 보고 있을 때를 의미한다고 판단하여,
                // 섹션을 완전히 떠났다 돌아올 때는 리셋되도록 유지합니다. (원치 않으면 아래 줄 주석 처리)
                projectCards.forEach(card => card.classList.remove('active'));
                currentProjectIndex = -1;
            }
        }
    });

    listRows.forEach((row, index) => {
        row.addEventListener("click", () => {
            const targetCard = projectCards[index];
            if (!targetCard) return;
            const projectsScrollTrigger = ScrollTrigger.getById('project-horizontal-scroll');
            if (projectsScrollTrigger) {
                const offset = targetCard.offsetLeft;
                const targetTranslateX = -(offset - 100);
                const progress = Math.max(0, Math.min(1, Math.abs(targetTranslateX) / scrollEnd));
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

// ==================== 8. Project Cursor & Interaction ====================
const cursorFollower = document.querySelector('.cursor_follower');
const cursorTextSpan = cursorFollower?.querySelector('span');
const projectImages = document.querySelectorAll('.project_card .img_wrapper');

if (cursorFollower && projectImages.length > 0) {
    gsap.set(cursorFollower, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });

    let xTo = gsap.quickTo(cursorFollower, "x", { duration: 0.4, ease: "power3" });
    let yTo = gsap.quickTo(cursorFollower, "y", { duration: 0.4, ease: "power3" });

    projectsSection.addEventListener("mousemove", (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
    });

    projectImages.forEach(link => {
        link.addEventListener('mouseenter', () => {
            const text = link.getAttribute('data-cursor-text') || "VIEW";
            if (cursorTextSpan) cursorTextSpan.textContent = text;

            gsap.to(cursorFollower, {
                scale: 1,
                opacity: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
            document.body.style.cursor = 'none';
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(cursorFollower, {
                scale: 0,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            });
            document.body.style.cursor = 'auto';
        });
    });

    projectsSection.addEventListener('mouseleave', () => {
        gsap.to(cursorFollower, { scale: 0, opacity: 0 });
        document.body.style.cursor = 'auto';
    });
}


// ==================== 9. Visual Archive ====================
ScrollTrigger.create({
    trigger: "#Visual",
    start: "top center", end: "bottom center",
    onEnter: () => set_active("#Visual"),
    onEnterBack: () => set_active("#Visual")
});

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
    row.addEventListener("click", () => {
        if (imgSrc && modal) {
            modalImg.src = imgSrc;
            modal.classList.add("active");
            if (lenis) lenis.stop();
        }
    });
});

if (modalClose && modal) {
    const closeModal = () => {
        modal.classList.remove("active");
        if (lenis) lenis.start();
    };
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}

// ==================== 10. Philosophy Section ====================
const philoSection = document.querySelector("#philosophy");
const rainbowTarget = document.querySelector("#rainbow-text");
const tagWrap = document.querySelector(".hanging_tag_wrap");
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

if (philoSection && rainbowTarget) {
    const rbBtn = new RainbowButton(rainbowTarget);

    ScrollTrigger.create({
        trigger: "#philosophy",
        start: "top top",
        end: "+=1000",
        pin: true,
        onEnter: () => {
            rainbowTarget.style.opacity = "1";
            rainbowTarget.classList.add("active");
            rbBtn.onMouseEnter();
            document.querySelector('header').classList.add('on');
            if (tagWrap) {
                gsap.to(tagWrap, {
                    y: "0%",
                    autoAlpha: 1,
                    duration: 1.5,
                    ease: "bounce.out"
                });
            }
        },
        onLeaveBack: () => {
            if (tagWrap) {
                gsap.to(tagWrap, { y: "-100%", autoAlpha: 0, duration: 0.5 });
            }
            rbBtn.onMouseLeave();
            rainbowTarget.classList.remove("active");
            document.querySelector('header').classList.remove('on');
        },
        onLeave: () => {
            document.querySelector('header').classList.remove('on');
        },
        onEnterBack: () => {
            document.querySelector('header').classList.add('on');
        },
    });
}

// ==================== 11. Final Refresh & Scroll to Top Logic ====================
// 페이지가 완전히 로드된 후 스크롤을 최상단으로 강제 이동하고 ScrollTrigger를 갱신합니다.
window.addEventListener("load", () => {
    // 1. Lenis로 즉시 상단 이동 (강제)
    if (lenis) lenis.scrollTo(0, { immediate: true });

    // 2. 브라우저 기본 스크롤도 상단 이동
    window.scrollTo(0, 0);

    // 3. ScrollTrigger 계산 갱신
    ScrollTrigger.refresh();

    // 4. 혹시 모를 로딩 지연을 대비해 약간 뒤에 한 번 더 갱신
    setTimeout(() => {
        if (lenis) lenis.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();
    }, 100);
});

// 리사이즈 시 갱신
window.addEventListener("resize", () => ScrollTrigger.refresh());