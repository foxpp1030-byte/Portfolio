import { initGnb, set_active } from './gnb.js';
import { initFooter } from './footer.js';

// ==================== 새로고침 시 맨 위로 ====================
if (history.scrollRestoration) {
    history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);


gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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

// ==================== [최종 수정] Hero Scroll Animation ====================
const heroSection = document.querySelector("#hero");

if (heroSection) {
    // 0. 초기 상태 강제 설정 (GSAP로 확실하게 잡기)
    // 접시는 정중앙, 회전된 상태, 투명하게 시작
    gsap.set("#hero_plate_wrap", {
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        rotation: -180, // 회전된 상태로 대기
        scale: 1,
        opacity: 0      // 숨김
    });

    // 주변 아이템들 숨김
    gsap.set("#hero_synced_objects .obj_link:not(#hero_plate_wrap)", { autoAlpha: 0 });
    // 접시 안의 프로젝트 글씨 숨김
    gsap.set("#hero_plate_wrap .type_projects", { opacity: 0 });


    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "+=3000", // 스크롤 길이 확보
            pin: true,
            scrub: 1,
            anticipatePin: 1
        }
    });

    heroTl
        // -------------------------------------------------------
        // [STEP 1] 스크롤 시작하면: 접시가 제자리에서 '뿅' 하고 나타남 (이동 X)
        // -------------------------------------------------------
        .to("#hero_plate_wrap", {
            opacity: 1,     // 투명도 0 -> 1
            duration: 1,    // 스크롤 초반 구간 사용
            ease: "none"
        })

        .addLabel("move_start") // 라벨: 이동 시작점

        // -------------------------------------------------------
        // [STEP 2] 접시가 회전하며 제자리를 찾아감 + 글씨 위로 사라짐
        // -------------------------------------------------------
        // 2-1. 접시 이동 (중앙 -> 우측 하단 지정 위치)
        .to("#hero_plate_wrap", {
            top: "40%",     // 목표 CSS top 값
            left: "52%",    // 목표 CSS left 값
            xPercent: -50,
            yPercent: -50,
            rotation: 0,    // -180도에서 0도로 회전
            duration: 3,    // 이동은 천천히 우아하게
            ease: "power2.inOut"
        }, "move_start")

        // 2-2. 배경 큰 글씨(PORTFOLIO) 위로 사라짐
        .to(".hero_text_group", {
            y: "-100vh",    // 위로 쭉 올림
            opacity: 0,
            duration: 3,
            ease: "power2.inOut"
        }, "move_start") // 접시 이동과 동시에 실행

        // -------------------------------------------------------
        // [STEP 3] 안착 후: 나머지 메뉴 & 프로젝트 글씨 등장
        // -------------------------------------------------------
        .to("#hero_synced_objects .obj_link:not(#hero_plate_wrap)", {
            autoAlpha: 1,   // 주변 아이콘들 등장
            duration: 1,
            stagger: 0.1
        })
        .to("#hero_plate_wrap .type_projects", {
            opacity: 1,     // PROJECTS 글씨 등장
            duration: 1
        }, "<") // 아이콘 등장과 동시에 시작

        // 4. 로고 사라짐 (필요하다면)
        .to(".rotate_logo", {
            opacity: 0,
            duration: 0.5
        }, "-=1");
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

gsap.registerPlugin(Draggable);

const scatterItems = document.querySelectorAll(".scatter_item");
const hoverOverlay = document.querySelector(".jam_hover_overlay");
const hoverTitle = document.querySelector(".hover_proj_title");
const hoverCate = document.querySelector(".hover_proj_cate");
const btnWeb = document.querySelector(".btn_website");
const btnLand = document.querySelector(".btn_landing");
const projectsSection = document.querySelector("#Projects");

let activeItem = null;

if (scatterItems.length > 0 && hoverOverlay) {

    Draggable.create(".scatter_item", {
        type: "x,y",
        bounds: "#Projects",
        inertia: true,
        onDragStart: function () {
            this.target.style.zIndex = 100;
            this.target.classList.add("is-dragging");
        },
        onDragEnd: function () {
            if (!this.target.classList.contains('selected')) {
                this.target.style.zIndex = "";
            }
            this.target.classList.remove("is-dragging");
        }
    });

    // [핵심] 핀이 걸리는 등장 애니메이션
    const projTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#Projects",
            start: "top top",
            end: "+=4000",
            pin: true,
            scrub: 1,
            anticipatePin: 1,

            // ▼▼▼ [추가된 코드] 섹션을 벗어나면 무조건 팝업 닫기 ▼▼▼
            onLeave: () => deselectAll(),      // 아래로 스크롤해서 벗어날 때
            onLeaveBack: () => deselectAll(),  // 위로 스크롤해서 벗어날 때
            // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
        }
    });

    projTl
        // [1단계] 배경 글씨가 양옆에서 '쾅' 하고 닫힘
        .fromTo(".bg_left",
            { x: "-100%", opacity: 0 },
            { x: "0%", opacity: 1, duration: 5, ease: "power3.inOut" }
        )
        .fromTo(".bg_right",
            { x: "100%", opacity: 0 },
            { x: "0%", opacity: 1, duration: 5, ease: "power3.inOut" }, "<" // 동시에 시작
        )

        // [2단계] 이미지가 화면 아래에서 튀어 올라옴 (임팩트!)
        .fromTo(".scatter_item",
            {
                y: "150vh",   // 화면 저 아래에서 시작
                scale: 0.2,   // 아주 작은 상태
                rotation: 30, // 회전된 상태
                autoAlpha: 1  // 보이게 설정
            },
            {
                y: 0,         // 제자리로
                scale: 1,     // 원래 크기
                rotation: 0,  // 회전 복구
                duration: 10, // 천천히 묵직하게
                stagger: 1,   // 하나씩 순차적으로 (다다닥!)
                ease: "back.out(1.2)" // [중요] 쾅! 하고 박히는 탄성 효과
            }, "-=2" // 글씨가 다 닫히기 조금 전부터 튀어나오기 시작
        );
    // 2. 클릭 이벤트
    scatterItems.forEach((item) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (activeItem === item) return;
            selectItem(item);
        });
    });

    // 3. 배경 클릭 시 닫기
    projectsSection.addEventListener("click", () => {
        deselectAll();
    });

    // --- 기능 함수 ---
    function selectItem(item) {
        if (activeItem) activeItem.classList.remove("selected");

        activeItem = item;
        item.classList.add("selected");

        // 데이터 가져오기
        const title = item.getAttribute("data-title");
        const cate = item.getAttribute("data-cate");
        const color = item.getAttribute("data_color"); // [추가] 색상 가져오기
        const webLink = item.getAttribute("data-web");
        const landLink = item.getAttribute("data-landing");

        // 텍스트 적용
        hoverTitle.innerText = title;
        hoverCate.innerText = cate;

        // [추가] 제목 색상 변경
        if (color) {
            hoverTitle.style.color = color;
        } else {
            hoverTitle.style.color = "#000"; // 색상 없으면 기본 검정
        }

        // 버튼 링크 적용
        if (btnWeb) btnWeb.setAttribute("href", webLink);
        if (btnLand) btnLand.setAttribute("href", landLink);

        hoverOverlay.classList.add("active");
    }

    function deselectAll() {
        if (activeItem) {
            activeItem.classList.remove("selected");
            activeItem = null;
        }
        hoverOverlay.classList.remove("active");

        // 닫을 때 제목 색상 검정으로 초기화 (선택사항)
        setTimeout(() => {
            hoverTitle.style.color = "#000";
        }, 300);
    }
}
const projTl = gsap.timeline({
    scrollTrigger: {
        trigger: "#Projects",
        start: "top 60%", // 화면의 60% 지점에 왔을 때 시작 (조금 일찍)
        toggleActions: "play none none reverse" // 다시 올라가면 사라졌다가 내려오면 다시 실행
    }
});


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
