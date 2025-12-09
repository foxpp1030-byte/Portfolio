let scrollTween;
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ==================== Lenis Scroll Locking Logic ====================
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => t,
        smooth: true,
        smoothTouch: true,
    });

    // 1. [핵심] 사이트 로드 시 스크롤 잠금 (인트로에서 못 벗어나게)
    lenis.stop();
    document.body.style.overflow = "hidden"; // 네이티브 스크롤바도 잠금

    function raf(t) {
        lenis.raf(t);
        ScrollTrigger.update();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // ==================== Intro Arrow Click Logic ====================
    const enterBtn = document.querySelector("#enter-btn");

    if (enterBtn) {
        enterBtn.addEventListener("click", () => {

            // 2. [핵심] 클릭 시 스크롤 잠금 해제
            document.body.style.overflow = "auto";
            lenis.start();

            // 3. 다음 섹션(#skills 또는 #About 등 원하는 곳)으로 부드럽게 이동
            // 영수증이 올라오는 곳이 #skills라면 아래와 같이 설정
            gsap.to(window, {
                scrollTo: "#About", // 혹은 "#About" (About Me)
                duration: 1.5,
                ease: "power4.inOut"
            });
        });
    }

    // ==================== Horizontal gallery helper ====================
    const total_width = () => {
        const wrap = document.querySelector("#projects");
        const track = document.querySelector(".track");
        return track.scrollWidth - wrap.clientWidth;
    };

    /* ================== Navigation Active ================== */
    const navLinks = document.querySelectorAll(".gnb_tit li");
    // 섹션 맵 정의
    const sub_map = [
        "#About",
        "#Skills",
        "#Projects",
        "#Visual",
    ];

    function set_active(target) {
        // target is expected to be an href like "#skills" or an element
        navLinks.forEach((li) => {
            const a = li.querySelector('a');
            if (!a) return;
            if (typeof target === 'string') {
                // compare href strings
                if (a.getAttribute('href') === target) {
                    li.classList.add('on');
                    console.log(a);
                } else {
                    li.classList.remove('on');
                }
            } else if (target instanceof Element) {
                // if an element was passed, compare by href vs its id or selector
                const href = a.getAttribute('href');
                if (href && (href === `#${target.id}` || target.matches(href))) {
                    li.classList.add('on');
                } else {
                    li.classList.remove('on');
                }
            }
        });
    }



    /*     sub_map.forEach((id) => {
            const section = document.querySelector(id);
            const linkEl = document.querySelectorAll(`.gnb li a[href="${id}"]`);
            if (!section || !linkEl.length) return;
    
    
            console.log(linkEl)
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                onEnter: () => set_active(id),
                onEnterBack: () => set_active(id),
            });
        }); */


    /* ================== Overlay Control ================== */
    let overlayActivatedOnce = false;
    const hamMenu = document.querySelector(".ham_menu");
    const hamIcon = document.querySelector(".ham_menu i");
    const main = document.querySelector('main');
    main.dataset.prevHeight = main.offsetHeight;

    hamMenu.addEventListener("click", () => {
        if (overlayActivatedOnce) {
            removeOverlay();
        } else {
            addOverlay();
        }
    });


    /*     const scrollMap = [
            { selector: ".obj_key", target: "#about" },
            { selector: ".obj_dessert", target: "#projects" },
            { selector: ".obj_earphone", target: "#visual" },
            { selector: ".obj_skillset", target: "#skills" },
        ]; */

    /*     scrollMap.forEach(item => {
            const el = document.querySelector(item.selector);
            const target = document.querySelector(item.target);
    
            if (el && target) {
                el.addEventListener("click", () => {
                    set_active(item.target);
                    // removeOverlay(target);
                });
            }
        }); */
    // 🔥 overlay 강제 제어 함수
    function addOverlay() {
        lenis.stop();
        document.body.style.overflow = "hidden";
        hamIcon.classList.remove("fa-bars");
        hamIcon.classList.add("fa-xmark");
        document.querySelector('.object_page').classList.add('on');
        overlayActivatedOnce = true;
    }

    function removeOverlay() {
        hamIcon.classList.add("fa-bars");
        hamIcon.classList.remove("fa-xmark");
        document.querySelector('.object_page').classList.remove('on');
        overlayActivatedOnce = false;
    }
    // ================== OVERLAY NAVIGATION CLICK FIX ==================
    document.querySelectorAll('.object_inner a').forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            // 1) 이동할 타겟 id 추출
            const target = item.getAttribute("href"); // "#About" 같은 문자열

            // 2) overlay 닫기
            removeOverlay();
            document.body.style.overflow = "auto";
            lenis.start();
            console.log(target)
            // 3) 부드럽게 스크롤 이동
            if (target) {
                gsap.to(window, {
                    scrollTo: target,
                    duration: 1.2,
                    ease: "power4.inOut",
                    onComplete: () => {
                        set_active(target);
                    }
                });
            }
        });
    });


    /* ================== Section Scroll Active ================== */
    /*     ["about", "projects", "visual", "skills", "About"].forEach((id) => {
            ScrollTrigger.create({
                trigger: "#" + id,
                start: "top top",
                end: "bottom bottom",
                onEnter: () => set_active("#" + id),
                onEnterBack: () => set_active("#" + id),
            });
        }); */



    window.addEventListener("load", () => {
        setTimeout(() => ScrollTrigger.refresh(), 100);
        requestAnimationFrame(() => {
            ScrollTrigger.refresh();

            // Lenis 두 번째 raf 후 다시 refresh
            requestAnimationFrame(() => {
                ScrollTrigger.refresh();
            });
        });
        setTimeout(() => {
            // scrollTween이 존재할 때만 실행하도록 보호
            if (typeof scrollTween !== "undefined" && scrollTween) {
                scrollTween.vars.x = () => -total_width();
            }
            ScrollTrigger.refresh();
        }, 100);


    });



    // ================== About Me  Horizontal Slide & Flip ==================
    const AboutSection = document.querySelector(".About");

    // GSAP Context를 사용하여 안전하게 애니메이션 적용
    if (AboutSection) {

        let AboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".About",
                start: "top top",      // 섹션 상단이 화면 상단에 닿으면 시작
                end: "+=2500",         // 스크롤 길이 (천천히 움직이게 하려면 이 값을 늘리세요)
                pin: true,             // 섹션 고정
                scrub: 1,              // 부드러운 스크롤 연동
                anticipatePin: 1,
                onEnter: () => set_active('#About'),
                onEnterBack: () => set_active('#About'),
            }
        });

        // 1. 초기 상태 설정: 카드를 화면 오른쪽 밖으로 보냄
        // (CSS에서 transform을 건드리지 않고 GSAP from으로 처리)

        // 2. 애니메이션: 오른쪽에서 중앙으로 슬라이드 (Move In)
        AboutTl.fromTo(".card_frame",
            { x: "120%" },  // 시작: 화면 오른쪽 밖
            {
                x: "0%",    // 끝: 중앙 정렬 위치
                duration: 5, // 이동하는 시간을 길게 배정 (비중 5)
                ease: "power2.out"
            }
        );

        // 3. 애니메이션: 카드 순차적으로 뒤집기 (Flip)
        const cards = gsap.utils.toArray(".About .card");
        cards.forEach((card, i) => {
            AboutTl.to(card, {
                rotationY: 180,    // 뒤집기
                duration: 1.8,       // 회전 시간
                ease: "back.out(1.7)" // 살짝 튕기는 느낌
            }, "+=0.2"); // 앞 동작 끝나고 0.2초 뒤 혹은 겹쳐서 실행
        });
    }


    // ================== Skillset (영수증 올라오는 효과 - 최종 깊이감 수정) ==================
    const skillReceipt = document.querySelector('.skillset_img');

    if (skillReceipt) {
        gsap.to(skillReceipt, {
            y: 0,              // 400px 아래에서 0으로 올라옴 (이동 거리 큼)
            opacity: 1,        // 투명도 0 -> 1
            duration: 2.0,     // 2초 동안 묵직하게 이동
            ease: "power3.out", // power2보다 끝부분 감속이 더 자연스럽고 고급스러움
            scrollTrigger: {
                trigger: "#Skills",
                start: "top 60%",
                toggleActions: "play none none reverse",
                onEnter: () => set_active('#Skills'),
                onEnterBack: () => set_active('#Skills'),
            }
        });
    }

    // [추가] 프로젝트 "표지" 화면에 왔을 때 메뉴 활성화
    ScrollTrigger.create({
        trigger: "#Projects", // 대문자 P (표지 섹션 ID)
        start: "top center",
        end: "bottom center",
        onEnter: () => set_active("#Projects"),
        onEnterBack: () => set_active("#Projects")
    });

    ScrollTrigger.create({
        trigger: "#projects",
        start: "top center",
        end: "bottom center",
    });


    // ================== Horizontal Scroll (Averi Style - Modified) ==================

    // [수정] 표지가 아닌, 실제 가로 스크롤이 일어날 '새로운 섹션 ID'를 선택
    const projectSection = document.querySelector("#projects_scroll_view");
    const track = document.querySelector(".horizontal_track");

    if (projectSection && track) {
        // 1. 가로로 이동할 거리 계산
        let getScrollAmount = () => {
            let trackWidth = track.scrollWidth;
            return -(trackWidth - window.innerWidth) - 200;
        };

        // 2. 가로 스크롤 애니메이션 정의
        const tween = gsap.to(track, {
            x: getScrollAmount,
            ease: "none",
            duration: 1,
        });

        // 3. ScrollTrigger 연결
        ScrollTrigger.create({
            trigger: "#projects_scroll_view", // [수정] 트리거 대상 변경
            start: "top top",
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true,

            // [중요] 네비게이션 활성화 로직
            // 표지(#Projects)와 가로영역(#projects_scroll_view) 둘 다 'Projects' 메뉴에 해당하므로
            // 여기서도 #Projects를 활성화하도록 설정
            onEnter: () => set_active("#Projects"),
            onEnterBack: () => set_active("#Projects"),
        });

        ScrollTrigger.refresh();
    }


    window.addEventListener("resize", () => ScrollTrigger.refresh());
    // Reduced Motion 설정이 바뀌면 새로고침 (선택 사항)
    window.matchMedia('(prefers-reduced-motion: reduce)')
        .addEventListener('change', () => location.reload());

    ScrollTrigger.create({
        trigger: "#Visual", // 대문자 V
        start: "top center",
        end: "bottom center",
        onEnter: () => set_active("#Visual"), // 메뉴 활성화
        onEnterBack: () => set_active("#Visual")
    });

    // ================== Visual Archive Hover Effect ==================
    const jnRows = document.querySelectorAll(".jn_row");
    const jnCursorWrap = document.querySelector(".jn_cursor_img");
    const jnPreviewImg = document.querySelector("#jn_preview_target");

    if (jnCursorWrap) { // 요소가 있을 때만 실행
        let jnXTo = gsap.quickTo(jnCursorWrap, "x", { duration: 0.4, ease: "power3" });
        let jnYTo = gsap.quickTo(jnCursorWrap, "y", { duration: 0.4, ease: "power3" });

        window.addEventListener("mousemove", (e) => {
            if (jnCursorWrap.style.opacity > 0) {
                jnXTo(e.clientX);
                jnYTo(e.clientY);
            }
        });

        if (jnRows.length > 0) {
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
    }
    /* ==========================================================
       RAINBOW TEXT EFFECT CLASS
       (소스: 제공해주신 script.js 기반)
       ========================================================== */
    const ASCII_CHARS = "abcdefghijklmnñopqrstuvwxyz0123456789!#$%&/?'_-";
    const RB_COLORS = ["#ff6188", "#fc9867", "#ffd866", "#a9dc76", "#78dce8", "#ab9df2"];

    class RainbowButton {
        constructor(_btn) {
            if (!_btn) return; // 요소가 없으면 실행 중지
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

                // 공백이 아닐 때만 애니메이션 실행
                if (letter != " ") {
                    let idx = ASCII_CHARS.indexOf(letter.toLowerCase());
                    // 문자가 ASCII 목록에 없으면(예: 공백 등) 기본 처리
                    let initChar = (idx !== -1 && idx > 10) ? ASCII_CHARS[idx - 9] : ASCII_CHARS[0];
                    setTimeout(() => this.letterTo(span, initChar, letter), 60 * i);
                }
            }
        }

        onMouseLeave() {
            this.over_active = false;
            this.el.innerHTML = this.txt;
            this.el.style.color = ""; // 원래 색상으로 복구
        }

        letterTo(span, from, to) {
            let char = to;
            let color = this.overColor; // 기본 색상

            // 마우스가 올라가 있고, 글자가 아직 목표 글자가 아닐 때 스크램블
            if (from != to.toLowerCase() && this.over_active) {
                const idx = ASCII_CHARS.indexOf(from.toLowerCase());
                // 랜덤 색상 적용
                color = RB_COLORS[~~(Math.random() * RB_COLORS.length)];
                // 대소문자 섞기
                char = Math.random() > .5 ? from : from.toUpperCase();

                // 다음 프레임 호출
                setTimeout(() => {
                    let nextChar = (idx !== -1) ? ASCII_CHARS[idx + 1] : to;
                    this.letterTo(span, nextChar, to);
                }, 1000 / this.fps);
            }

            span.style.color = color;
            span.innerText = char;
        }
    }

    // DOM이 로드된 후 실행 (이미 main.js 상단에 DOMContentLoaded가 있다면 그 안의 맨 끝에 넣으셔도 됩니다)
    // 만약 이 코드를 파일 맨 끝에 붙인다면 아래와 같이 작성하세요.
    window.addEventListener('load', () => {
        const rainbowTarget = document.querySelector("#rainbow-text");
        if (rainbowTarget) {
            new RainbowButton(rainbowTarget);
        }
    });


    const tagWrap = document.querySelector(".hanging_tag_wrap");

    if (tagWrap) {
        gsap.to(tagWrap, {
            y: 0,              // 원래 위치(top:0)로 내려옴
            duration: 1.5,     // 1.5초 동안 천천히
            ease: "bounce.out", // 끝에서 살짝 튕기는 느낌 (줄이 툭 떨어지는 느낌)
            // 부드럽게 멈추려면 "power3.out"으로 변경하세요.
            scrollTrigger: {
                trigger: "#philosophy", // 이 섹션이 보이면
                start: "top 60%",       // 화면의 60% 지점에 도달했을 때 시작
                toggleActions: "play none none reverse" // 스크롤 올리면 다시 올라감
            }
        });
    }
    // ================== Philosophy Section Pin & Auto Effect (Final Fix) ==================
    // (RainbowButton 클래스 코드는 위쪽에 그대로 있어야 합니다)

    window.addEventListener('load', () => {
        setTimeout(() => {
            // scrollTween 에러 방지용 안전 장치
            if (typeof scrollTween !== "undefined" && scrollTween) {
                scrollTween.vars.x = () => -total_width();
            }
            ScrollTrigger.refresh();
        }, 100);

        const philoSection = document.querySelector("#philosophy");
        const rainbowTarget = document.querySelector("#rainbow-text");
        const tagWrap = document.querySelector(".hanging_tag_wrap");

        if (philoSection && rainbowTarget) {
            // 1. 레인보우 효과 인스턴스 생성
            const rbBtn = new RainbowButton(rainbowTarget);

            ScrollTrigger.create({
                trigger: "#philosophy",
                start: "top top",       // 섹션이 화면 맨 위에 닿으면
                end: "+=1000",          // 1000px 스크롤 할 동안 고정
                pin: true,              // 화면 고정
                // 🚨 [핵심 수정] scrub을 삭제했습니다! 
                // 이제 스크롤을 내리지 않아도 시간이 지나면 애니메이션이 실행됩니다.

                // 섹션 진입 시 실행될 동작들
                onEnter: () => {
                    // [1] 태그: 핀 걸리자마자 '알아서' 툭 떨어짐 (스크롤 무관)
                    if (tagWrap) {
                        gsap.fromTo(tagWrap,
                            {
                                y: "-100%",
                                autoAlpha: 0 // 시작할 땐 안 보임
                            },
                            {
                                y: "0%",
                                autoAlpha: 1,       // [핵심] 보이게 만듦 (opacity: 1, visibility: visible)
                                duration: 1.5,
                                ease: "bounce.out",
                                overwrite: true
                            }
                        );
                    }

                    // [2] 텍스트: 사라지지 않고 효과 즉시 실행
                    // 기존 텍스트가 사라지는 것을 방지하기 위해 스타일 강제 적용
                    rainbowTarget.style.opacity = "1";
                    rainbowTarget.classList.add("active");

                    // Rainbow 효과 실행 (글자 스크램블)
                    rbBtn.onMouseEnter();
                },

                // 다시 위로 올라가면 초기화
                onLeaveBack: () => {
                    if (tagWrap) {
                        // 다시 위로 숨기면서 투명하게 만듦
                        gsap.to(tagWrap, {
                            y: "-100%",
                            autoAlpha: 0, // [핵심] 다시 숨김
                            duration: 0.5
                        });
                    }
                    rbBtn.onMouseLeave();
                    rainbowTarget.classList.remove("active");
                }
            });
        }
    });


    // ==========================================================
    // ICON CLOUD (Matter.js) - 빵 크기 축소 & 겹침 방지 (Padding)
    // ==========================================================
    const cloudSection = document.querySelector("#icon_cloud_section");

    if (cloudSection) {
        // 1. Matter.js 모듈
        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

        // 2. 엔진 생성
        const engine = Engine.create();
        const world = engine.world;

        // 3. 렌더러 생성
        const render = Render.create({
            element: cloudSection,
            engine: engine,
            options: {
                width: cloudSection.clientWidth,
                height: cloudSection.clientHeight,
                background: 'transparent',
                wireframes: false, // 충돌 박스 안 보이기 (확인용이면 true)
                pixelRatio: window.devicePixelRatio
            }
        });

        // 4. 벽 생성 함수
        let ground, leftWall, rightWall;
        const wallOptions = { isStatic: true, render: { visible: false } };

        function createWalls() {
            const width = cloudSection.clientWidth;
            const height = cloudSection.clientHeight;
            const wallThick = 100;
            const groundOffset = 60; // 바닥 높이 보정

            if (ground) Composite.remove(world, [ground, leftWall, rightWall]);

            ground = Bodies.rectangle(width / 2, height - groundOffset + (wallThick / 2), width, wallThick, wallOptions);
            leftWall = Bodies.rectangle(0 - wallThick / 2, -height * 4, wallThick, height * 10, wallOptions);
            rightWall = Bodies.rectangle(width + wallThick / 2, -height * 4, wallThick, height * 10, wallOptions);

            Composite.add(world, [ground, leftWall, rightWall]);
        }
        createWalls();

        // =========================================
        // 5. 오브젝트 생성 설정 (개별 크기 조절 기능 추가)
        // =========================================

        function addObjects() {
            // [수정] scaleMod: 1.0이 기준, 작게 하려면 0.x 입력
            const spawnList = [
                { src: './img/vector7.png', count: 3, scaleMod: 0.9 }, // 핑크 X
                { src: './img/vector1.png', count: 1, scaleMod: 1.0 }, // 리본
                { src: './img/vector2.png', count: 1, scaleMod: 0.9 }, // 타르트
                { src: './img/vector3.png', count: 1, scaleMod: 0.9 }, // 이어폰
                { src: './img/vector4.png', count: 1, scaleMod: 0.9 }, // 프레첼
                { src: './img/vector5.png', count: 1, scaleMod: 0.9 }, // 아이스크림
                { src: './img/vector6.png', count: 1, scaleMod: 0.9 }, // 영수증
                // [핵심 수정] 빵 크기를 0.6배로 대폭 줄임
                { src: './img/bread01.png', count: 1, scaleMod: 0.6 }
            ];

            spawnList.forEach(item => {
                for (let i = 0; i < item.count; i++) {
                    createSingleObject(item.src, item.scaleMod);
                }
            });
        }

        // 개별 오브젝트 생성 함수 (scaleMultiplier 파라미터 추가)
        function createSingleObject(imgSrc, scaleMultiplier) {
            // 가로 전체 범위 활용 (겹침 방지 위해 넓게 분포)
            const xPos = Math.random() * (cloudSection.clientWidth - 150) + 75;
            // 떨어지는 높이차를 더 둠 (한 번에 뭉치지 않게)
            const yPos = -Math.random() * 1500 - 200;

            // 기본 랜덤 크기 (0.8~1.1) * 개별 스케일(빵은 작게)
            const baseScale = 0.8 + Math.random() * 0.3;
            const finalScale = baseScale * scaleMultiplier;

            // [핵심 수정] 충돌 박스 크기(bodySize)를 이미지보다 약간 크게 설정 (105%)
            // 이렇게 하면 이미지끼리 닿기 전에 '투명 보호막'이 부딪혀서 시각적으로 겹치지 않음
            const bodySize = 100 * finalScale * 1.05;

            const obj = Bodies.rectangle(xPos, yPos, bodySize, bodySize, {
                restitution: 0.6, // 약간 더 잘 튀기게 (뭉침 해소)
                friction: 0.1,
                frictionAir: 0.01 + Math.random() * 0.03,
                angle: Math.random() * Math.PI,
                render: {
                    sprite: {
                        texture: imgSrc,
                        xScale: finalScale,
                        yScale: finalScale
                    }
                }
            });
            Composite.add(world, obj);
        }

        // =========================================
        // 6. 실행 제어
        // =========================================
        Render.run(render);
        const runner = Runner.create();

        ScrollTrigger.create({
            trigger: "#icon_cloud_section",
            start: "top 20%",
            once: true,
            onEnter: () => {
                addObjects();
                Runner.run(runner, engine);
            }
        });

        // 7. 마우스 컨트롤
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });

        mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
        mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);
        Composite.add(world, mouseConstraint);

        // 8. 리사이즈 대응
        window.addEventListener('resize', () => {
            render.canvas.width = cloudSection.clientWidth;
            render.canvas.height = cloudSection.clientHeight;
            createWalls();
        });
    }

    // ==========================================================
    // CUSTOM CURSOR LOGIC (Visual Section으로 변경됨)
    // ==========================================================
    // 1. 타겟을 #projects가 아닌 #Visual로 변경
    const targetSection = document.querySelector("#Visual");
    const cursorIcon = document.querySelector(".project_cursor");

    if (targetSection && cursorIcon) {

        // 2. 커서 중심점 잡기 (마우스 끝이 이미지 중앙에 오도록)
        gsap.set(cursorIcon, { xPercent: -50, yPercent: -50 });

        // 3. GSAP QuickTo 설정
        let cursorX = gsap.quickTo(cursorIcon, "x", { duration: 0.2, ease: "power3" });
        let cursorY = gsap.quickTo(cursorIcon, "y", { duration: 0.2, ease: "power3" });

        // 4. 마우스 움직임 감지
        window.addEventListener("mousemove", (e) => {
            cursorX(e.clientX);
            cursorY(e.clientY);
        });

        // 5. Visual 섹션 진입 시: 커서 보이기
        targetSection.addEventListener("mouseenter", () => {
            gsap.to(cursorIcon, {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        // 6. Visual 섹션 이탈 시: 커서 숨기기
        targetSection.addEventListener("mouseleave", () => {
            gsap.to(cursorIcon, {
                opacity: 0,
                scale: 0.5,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    }



    // ==================== GNB Click Scroll Logic (추가된 코드) ====================
    // 상단 메뉴(About, Skillset...)를 눌렀을 때 부드럽게 이동시키는 코드입니다.

    const gnbLinks = document.querySelectorAll(".gnb_tit li a");

    gnbLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // 1. 덜컥거리는 기본 점프 기능 막기

            const targetId = link.getAttribute("href"); // 2. 클릭한 곳의 주소 가져오기 (#About 등)
            const targetSection = document.querySelector(targetId); // 3. 실제 섹션 찾기

            if (targetSection) {
                // 4. GSAP를 이용해 해당 위치로 부드럽게 이동
                gsap.to(window, {
                    scrollTo: {
                        y: targetId,
                        autoKill: false // 사용자가 스크롤해도 멈추지 않게
                    },
                    duration: 1.2,
                    ease: "power4.inOut"
                });
            }
        });
    });
}); // DOMContentLoaded 끝


