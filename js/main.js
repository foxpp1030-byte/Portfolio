let scrollTween;
document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ==================== Lenis ====================
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


    // ==================== Horizontal gallery helper ====================
    const total_width = () => {
        const wrap = document.querySelector("#projects");
        const track = document.querySelector(".track");
        return track.scrollWidth - wrap.clientWidth;
    };

    /* ================== Navigation Active ================== */
    const navLinks = document.querySelectorAll(".gnb_tit li");

    function set_active(target) {
        // target is expected to be an href like "#skills" or an element
        navLinks.forEach((li) => {
            const a = li.querySelector('a');
            if (!a) return;
            if (typeof target === 'string') {
                // compare href strings
                if (a.getAttribute('href') === target) {
                    li.classList.add('on');
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
    // 섹션 맵 정의
    const sub_map = [
        "#vision",
        "#skills",
        "#projects",
        "#visual",
    ];



    sub_map.forEach((id) => {
        const section = document.querySelector(id);
        const linkEl = document.querySelectorAll(`.gnb li a[href="${id}"]`);
        if (!section || !linkEl.length) return;

        // skills, projects 제외
        // if (id === "#skills" || id === "#projects") return;

        // 일반 섹션만
        ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            onEnter: () => set_active(id),
            onEnterBack: () => set_active(id),
        });
    });


    /* ================== Overlay Control ================== */
    /*     let overlayActivatedOnce = false;
        const hamMenu = document.querySelector(".ham_menu");
        const hamIcon = document.querySelector(".ham_menu i");
        const main = document.querySelector('main');
        main.dataset.prevHeight = main.offsetHeight;
    
        hamMenu.addEventListener("click", () => {
            if (main.classList.contains("overlay")) {
                removeOverlay();
            } else {
                addOverlay();
            }
        }); */


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
    /*     function addOverlay() {
            main.dataset.prevHeight = main.offsetHeight;
    
            main.classList.add("overlay");
    
            main.style.height = window.innerHeight + "px";
            main.style.overflow = "hidden";
    
            hamIcon.classList.remove("fa-bars");
            hamIcon.classList.add("fa-xmark");
        }
    
        function removeOverlay(target) {
            main.classList.remove("overlay");
            hamIcon.classList.add("fa-bars");
            hamIcon.classList.remove("fa-xmark");
            overlayActivatedOnce = true;
    
            if (main.dataset.prevHeight) {
                main.style.height = main.dataset.prevHeight + "px";
            } else {
                main.style.height = "auto";
            }
            main.style.overflow = "";
    
            if (target) {
                gsap.to(window, {
                    duration: 0.5,
                    scrollTo: target,
                    ease: "power2.out",
                    onComplete: () => {
                        ScrollTrigger.refresh();
    
                    },
                    onEnter: () => set_active(target),
                    onEnterBack: () => set_active(target),
                });
            } else {
                console.log(target)
            }
    
        }
     */

    /* ================== Section Scroll Active ================== */
    /*     ["about", "projects", "visual", "skills", "vision"].forEach((id) => {
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
            scrollTween.vars.x = () => -total_width();
            ScrollTrigger.refresh();
        }, 100);


    });



    // ================== About Me (Vision) Card Flip ==================
    const visionSection = document.querySelector(".vision");
    const cards = gsap.utils.toArray(".vision .card");

    if (visionSection && cards.length > 0) {
        // 1. 타임라인 생성 (섹션 고정 + 카드 뒤집기)
        const visionTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".vision",
                start: "top top",      // 섹션이 화면 맨 위에 닿으면 시작
                end: "+=2000",         // 스크롤 2000px 동안 고정 (속도 조절은 이 값을 변경)
                pin: true,             // 섹션 고정
                scrub: 1,              // 부드러운 스크롤 연동
                anticipatePin: 1
            }
        });

        // 2. 카드 뒤집기 애니메이션 (순차적)
        cards.forEach((card, i) => {
            visionTl.to(card, {
                rotationY: 180,    // 180도 회전 (뒤집기)
                duration: 1,
                ease: "power2.out"
            }, i * 0.8); // 0.8초 간격으로 시작 (겹쳐서 진행됨)
        });
    }



    // ================== Skillset (영수증 올라오는 효과) 
    gsap.timeline({
        scrollTrigger: {
            trigger: ".vid",
            start: "top top",
            end: "bottom center",
            scrub: true,
            // markers: true,
            toggleClass: { targets: ".vid", className: "on" },
        }
    }).fromTo(".vid_box",
        { scale: 0.45, opacity: 0.45, },
        { scale: 1, opacity: 1, ease: "power2.out", duration: 2, immediateRender: false }
    );


    // ==================== projects Horizontal gallery ====================
    // const track = document.querySelector(".track");
    // const projectSection = document.querySelector("#projects");

    // // 가로 스크롤 길이 계산 함수
    // function getScrollAmount() {
    //     if (!track) return 0;
    //     let trackWidth = track.scrollWidth;
    //     return -(trackWidth - window.innerWidth);
    // }

    // if (track && projectSection) {
    //     scrollTween = gsap.to(track, {
    //         x: getScrollAmount, // 함수 참조를 전달하여 리사이즈 시 자동 재계산
    //         ease: "none",
    //         scrollTrigger: {
    //             trigger: "#projects",
    //             start: "top top",
    //             end: () => `+=${track.scrollWidth - window.innerWidth}`, // 스크롤 길이만큼 확보
    //             pin: true,
    //             scrub: 1,
    //             invalidateOnRefresh: true, // 리사이즈 시 값 재계산
    //             anticipatePin: 1,
    //             onEnter: () => set_active("#projects"),
    //             onEnterBack: () => set_active("#projects"),
    //         }
    //     });
    // }

    ScrollTrigger.create({
        trigger: "#projects",
        start: "top center",
        end: "bottom center",
        onEnter: () => set_active("#projects"),
        onEnterBack: () => set_active("#projects"),
    });


    // ================== 선 그리기 (조선미녀 / heAi / 예술의 전당 공통) ================== 
    const linePanels = gsap.utils.toArray(".line_panel");

    linePanels.forEach((panel) => {
        // 해당 패널 안에 있는 모든 라인(path)들 잡기
        const paths = panel.querySelectorAll(
            ".bjo_line path, .verra_line_end path"
        );
        if (!paths.length) return;

        paths.forEach((path) => {
            const len = path.getTotalLength();
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = len;

            gsap.to(path, {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                    trigger: panel,              // 이 패널이 화면 가운데 올 때
                    containerAnimation: scrollTween, // 가로 스크롤이랑 싱크
                    start: "left center",
                    end: "right center",
                    scrub: true,
                    // markers: true,
                }
            });
        });
    });

    window.addEventListener("resize", () => ScrollTrigger.refresh());
    // Reduced Motion 설정이 바뀌면 새로고침 (선택 사항)
    window.matchMedia('(prefers-reduced-motion: reduce)')
        .addEventListener('change', () => location.reload());



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


    // ==========================================================
    // ICON CLOUD (Matter.js) - 최종 수정 (개수/크기/타이밍 조정)
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
                wireframes: false,
                pixelRatio: window.devicePixelRatio
            }
        });

        // 4. 벽 생성 함수
        const wallOptions = { isStatic: true, render: { visible: false } };
        let ground, leftWall, rightWall;

        function createWalls() {
            const width = cloudSection.clientWidth;
            const height = cloudSection.clientHeight;
            const wallThick = 100;

            if (ground) Composite.remove(world, [ground, leftWall, rightWall]);

            ground = Bodies.rectangle(width / 2, height + wallThick / 2 - 40, width, wallThick, wallOptions);
            leftWall = Bodies.rectangle(0 - wallThick / 2, -height * 2, wallThick, height * 10, wallOptions);
            rightWall = Bodies.rectangle(width + wallThick / 2, -height * 2, wallThick, height * 10, wallOptions);

            Composite.add(world, [ground, leftWall, rightWall]);
        }
        createWalls();

        // =========================================
        // 5. 오브젝트 생성 설정 (빵 1개 + 벡터 여러개 분리)
        // =========================================

        // [A] 빵 생성 함수 (딱 1개만)
        function addBread() {
            const xPos = cloudSection.clientWidth / 2; // 화면 중앙
            const yPos = -200; // 화면 바로 위

            // 빵 크기 줄이기 (scale 0.5)
            const scaleSize = 0.5;

            const bread = Bodies.rectangle(xPos, yPos, 120 * scaleSize, 80 * scaleSize, {
                restitution: 0.5,
                friction: 0.1,
                angle: Math.random() * Math.PI,
                render: {
                    sprite: {
                        texture: './img/bread01.png',
                        xScale: scaleSize, // 이미지 크기 줄임
                        yScale: scaleSize
                    }
                }
            });
            Composite.add(world, bread);
        }

        // [B] 벡터 이미지들 생성 함수 (여러개)
        const vectorImages = [
            './img/Vector1.png',
            './img/Vector2.png',
            './img/Vector3.png',
            './img/Vector4.png'
        ];

        function addVectors() {
            // 개수 조절 (기존 40개 -> 20개로 줄임)
            const objCount = 10;

            for (let i = 0; i < objCount; i++) {
                const randomImg = vectorImages[Math.floor(Math.random() * vectorImages.length)];

                const xPos = Math.random() * cloudSection.clientWidth;
                const yPos = -Math.random() * 3000 - 500;

                // 🔥 크기 수정: 1.2배 ~ 1.8배로 훨씬 크게 설정
                const scaleSize = 1.2 + Math.random() * 0.6;

                const obj = Bodies.rectangle(xPos, yPos, 80 * scaleSize, 80 * scaleSize, {
                    restitution: 0.6,
                    friction: 0.1,
                    frictionAir: 0.01 + Math.random() * 0.04,
                    angle: Math.random() * Math.PI,
                    render: {
                        sprite: {
                            texture: randomImg,
                            xScale: scaleSize,
                            yScale: scaleSize
                        }
                    }
                });
                Composite.add(world, obj);
            }
        }

        // =========================================
        // 6. 실행 제어 (ScrollTrigger로 화면에 보일 때 떨어뜨리기)
        // =========================================
        Render.run(render);
        const runner = Runner.create();

        // 스크롤 트리거 (화면 보이면 떨어뜨리기)
        ScrollTrigger.create({
            trigger: "#icon_cloud_section",
            start: "top 60%",
            once: true,
            onEnter: () => {
                addBread();
                addVectors();
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
    // 1. 타겟을 #projects가 아닌 #visual로 변경
    const targetSection = document.querySelector("#visual");
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

}); // DOMContentLoaded 끝


