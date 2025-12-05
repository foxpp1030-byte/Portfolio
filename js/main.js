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
        if (id === "#skills" || id === "#projects") return;

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

        const path = document.querySelector(".hero_path");
        const length = path.getTotalLength();

        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length; // ← 출발점: 전체 숨김(왼→오 준비)

        gsap.to('.hero_path', {
            strokeDashoffset: 0,            // ← 도착점: 0 (왼→오로 드로잉됨)
            duration: 2,
            ease: "power1.out",
            scrollTrigger: {
                trigger: ".hero",
                start: "top 100px",
                end: "bottom top",
                scrub: true,
                pin: true,
                anticipatePin: 1,
                // ⭐ 아래로 내려가서 hero를 벗어나는 순간
                /*            onLeave: () => {
                               if (overlayActivatedOnce) return;
                               overlayActivatedOnce = true;
           
                               gsap.to(window, {
                                   scrollTo: "#about",
                                   duration: 1.2,
                                   ease: "power2.out",
                                   onComplete: () => {
                                       
                                   }
                               });
                           },
            */
                // ⭐ 다시 위로 올라와 hero에 재진입했을 때
                onEnterBack: () => {
                    // overlay 갑자기 꺼지지 않게 → 부드럽게 제거

                }
            }
        });
    });

    const keyImg = document.querySelector(".vision_key_obj");

    if (keyImg) { // 에러 방지용 안전 장치
        gsap.fromTo(keyImg,
            {
                y: -200,    // 시작: 위쪽 -200px
                opacity: 0  // 시작: 투명
            },
            {
                y: 0,       // 끝: 원래 위치
                opacity: 1, // 끝: 불투명
                duration: 1.5,
                ease: "power3.out", // 부드러운 감속
                scrollTrigger: {
                    trigger: ".vision",
                    start: "top 60%", // 섹션이 화면의 60% 지점에 오면 시작
                    // markers: true, // 🚧 테스트용: 안 되면 주석 풀고 확인해보세요
                }
            }
        );
    }

    // ================== about ==================
    const visionCards = gsap.utils.toArray(".vision .card");

    visionCards.forEach((card, i) => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: visionCards,
                start: `top  center`,   // ⭐ 시작 늦춰짐
                end: `top+=${(i + 1) * 800} center`,
                scrub: 2,                     // ⭐ 천천히 따라감
            }
        });

        tl.fromTo(card, { rotationY: 0 }, {
            rotationY: 180,
            transformOrigin: "center center",
            ease: "power2.out"
        });
    });



    // ================== Skillset (영수증 올라오는 효과) ==================
    const skillReceipt = document.querySelector('.skillset_img');

    // 1. 요소가 진짜로 잡혔는지 콘솔에 출력 (F12 눌러서 Console 탭 확인 가능)
    if (skillReceipt) {
        console.log("✅ Skillset 요소 찾음! 애니메이션 준비 완료.");

        gsap.fromTo(skillReceipt,
            {
                y: 300,       // 시작: 300px 아래
                opacity: 0    // 시작: 투명
            },
            {
                y: 0,         // 끝: 제자리
                opacity: 1,   // 끝: 선명함
                duration: 1.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "#skills", // 트리거 기준: Skills 섹션 전체
                    start: "top 60%",   // 화면 위에서 60% 지점에 섹션이 닿으면 시작
                    end: "top 30%",
                    toggleActions: "play none none reverse",
                    markers: true,      // 🔥 [중요] 화면에 'start', 'end' 선이 표시됩니다! (확인 후 지우세요)
                    id: "skill-ani"     // 마커 이름
                }
            }
        );
    } else {
        console.error("skillset_img");
    }



    // ==================== projects Horizontal gallery ====================
    scrollTween = gsap.to(".track", {
        x: () => -total_width(),
        ease: "none",
        scrollTrigger: {
            trigger: "#projects",
            start: "top top",
            end: () => "+=" + total_width(),   // 가로 이동 거리만큼만 사용
            scrub: true,
            pin: true,
            pinSpacing: true,                  // 다시 true (기본값)
            anticipatePin: 1,
            onEnter: () => set_active("#projects"),
            onEnterBack: () => {
                set_active("#projects");
                const last = document.querySelector("#con4_7");
                if (last) last.classList.remove("hide-after-pin");
            },
            onLeave: () => {
                // pin 끝난 뒤에는 마지막 패널 안 보이게
                const last = document.querySelector("#con4_7");
                if (last) last.classList.add("hide-after-pin");
            },
            onLeaveBack: () => {
                // 다시 위로 올라가면 다시 보이게
                const last = document.querySelector("#con4_7");
                if (last) last.classList.remove("hide-after-pin");
            },
            // markers: true,
        },
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



    // ================== Visual Archive – 스크롤에 맞춰 포스터 바꾸기 ==================

    // ================== Visual Archive – 스크롤에 맞춰 포스터 바꾸기 ==================

    const visualItems = Array.from(document.querySelectorAll(".visual_item"));
    const visualPosterImg = document.querySelector(".visual_poster_img");

    // 요소 없으면 종료
    if (!visualItems.length || !visualPosterImg) return;

    // 글 + 포스터 바꾸는 함수
    function activateVisual(item) {
        if (!item) return;

        // 글자 하이라이트
        visualItems.forEach((el) => el.classList.remove("is_active"));
        item.classList.add("is_active");

        // 포스터 이미지 교체
        const src = item.dataset.poster;
        if (src) {
            visualPosterImg.src = src;

            const titleEl = item.querySelector(".visual_item_title");
            visualPosterImg.alt = titleEl ? titleEl.innerText.trim() : "Visual poster";
        }
    }

    // 스크롤 시 화면 중앙에 있는 아이템 탐색
    function updateByScroll() {
        const centerY = window.innerHeight * 0.5;
        let current = visualItems[0];

        visualItems.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (rect.top <= centerY && rect.bottom >= centerY) {
                current = item;
            }
        });

        if (!current.classList.contains("is_active")) {
            activateVisual(current);
        }
    }

    // 초기 상태
    activateVisual(visualItems[0]);
    updateByScroll();

    // 스크롤 업데이트
    window.addEventListener("scroll", updateByScroll);

    // 마우스 오버 시 즉시 변경
    visualItems.forEach((item) => {
        item.addEventListener("mouseenter", () => activateVisual(item));
    });

    gsap.to(".visual_poster_frame", {
        y: 300,
        scrollTrigger: {
            trigger: ".visual_section",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            pin: true,
            markers: true,
        }
    });
    /*     visualItems.forEach((item, i) => {
            gsap.to(".visual_poster_frame", {
                y: i * 80,
                scrollTrigger: {
                    trigger: item,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 1,
                }
            });
        }); */
    /*     gsap.to(".visual_poster_frame", {
            y: (visualItems.length - 1) * 80,
            scrollTrigger: {
                trigger: ".visual_poster_frame",
                start: "top top",
                end: "+=" + (visualItems.length * window.innerHeight),
                scrub: 1,
                pin: true,
            }
        }); */


});




// ==============================
// ICON CLOUD (Matter.js Physics)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#icon_cloud_section");
    if (!section) return;

    // 1. Matter.js 모듈 별칭 설정
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint,
        Events = Matter.Events;

    // 2. 엔진 생성
    const engine = Engine.create();
    const world = engine.world;

    // 3. 렌더러 생성 (캔버스에 그림)
    const render = Render.create({
        element: section,
        engine: engine,
        options: {
            width: section.clientWidth,
            height: section.clientHeight,
            background: 'transparent', // 배경 투명 (CSS 배경색 사용)
            wireframes: false, // 와이어프레임 끄고 이미지 보여주기
            pixelRatio: window.devicePixelRatio // 고해상도 대응
        }
    });

    // 4. 벽과 바닥 생성 (화면 밖으로 나가지 않게)
    const wallOptions = {
        isStatic: true, // 고정된 물체
        render: { visible: false } // 투명하게
    };

    let ground, leftWall, rightWall;

    function createWalls() {
        const width = section.clientWidth;
        const height = section.clientHeight;
        const wallThick = 100;

        // 기존 벽 제거 (리사이즈 대응)
        if (ground) Composite.remove(world, [ground, leftWall, rightWall]);

        // ✅ 바닥을 화면 85% 지점에 배치 (더 자연스러운 위치)
        ground = Bodies.rectangle(width / 2, height * 0.85, width, wallThick, wallOptions);
        leftWall = Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 2, wallOptions);
        rightWall = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 2, wallOptions);

        Composite.add(world, [ground, leftWall, rightWall]);
    }
    createWalls();

    // 5. 아이콘(오브젝트) 생성
    const iconScale = 0.5; // 이미지 크기 조절 (필요시 0.5 ~ 1.0 사이 조절)

    // X 아이콘들
    for (let i = 0; i < 12; i++) { // 개수 12개
        const xPos = Math.random() * section.clientWidth;
        const yPos = Math.random() * -500 - 100; // 화면 위쪽에서 랜덤하게 시작

        const icon = Bodies.rectangle(xPos, yPos, 80, 80, { // 80x80은 충돌 박스 크기
            restitution: 0.5, // 탄성 (0~1)
            friction: 0.1,    // 마찰력
            angle: Math.random() * Math.PI, // 랜덤 회전
            render: {
                sprite: {
                    texture: './img/icon.png', // 이미지 경로 확인!
                    xScale: iconScale,
                    yScale: iconScale
                }
            }
        });
        Composite.add(world, icon);
    }

    // 크루아상 (하나만)
    const bread = Bodies.rectangle(section.clientWidth / 2, -200, 120, 80, {
        restitution: 0.6,
        render: {
            sprite: {
                texture: './img/bread01.png', // 이미지 경로 확인!
                xScale: 0.6, // 크루아상은 조금 더 크게
                yScale: 0.6
            }
        }
    });
    Composite.add(world, bread);


    // 6. 마우스 컨트롤 (드래그 기능)
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(world, mouseConstraint);

    // 스크롤과 마우스 휠 간섭 방지 (선택사항)
    // mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
    // mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

    // 7. 실행
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 8. 화면 크기 변경 시 대응
    window.addEventListener('resize', () => {
        render.canvas.width = section.clientWidth;
        render.canvas.height = section.clientHeight;
        createWalls(); // 벽 위치 재조정
    });
});