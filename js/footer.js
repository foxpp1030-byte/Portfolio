// js/footer.js

export function initFooter() {
    // [중요] 모듈 파일에서는 외부 라이브러리를 window 객체에서 확실하게 가져와야 안전합니다.
    const Matter = window.Matter;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    // 라이브러리가 로드되지 않았을 경우 에러 방지
    if (!Matter || !gsap || !ScrollTrigger) {
        console.error("GSAP 또는 Matter.js가 로드되지 않았습니다.");
        return;
    }

    // 1. 실시간 시간 업데이트
    function updateTime() {
        const timeElement = document.getElementById('local-time');
        if (!timeElement) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Seoul'
        });
        timeElement.textContent = `Seoul, Korea ${timeString}`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    // 2. 푸터 등장 애니메이션 (GSAP)
    gsap.from(".footer_link", {
        scrollTrigger: { trigger: "#footer", start: "top 80%" },
        y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out"
    });

    gsap.from(".footer_info > div", {
        scrollTrigger: { trigger: "#footer", start: "top 80%" },
        y: 30, opacity: 0, duration: 1, delay: 0.3, stagger: 0.1, ease: "power3.out"
    });

    gsap.from(".big_typo", {
        scrollTrigger: { trigger: "#footer", start: "top 90%" },
        y: 100, opacity: 0, duration: 1.2, ease: "power2.out"
    });

    // 3. Matter.js 물리 엔진 로직
    const footerContainer = document.querySelector("#footer_matter_container");
    const footerSection = document.querySelector(".footer_top_area");

    if (footerContainer && footerSection) {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

        const engine = Engine.create();
        const world = engine.world;

        // [체크 포인트] wireframes: false -> 이미지가 안 보일 때 true로 바꾸면 박스가 떨어지는지 확인 가능
        const render = Render.create({
            element: footerContainer,
            engine: engine,
            options: {
                width: footerSection.clientWidth,
                height: footerSection.clientHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: window.devicePixelRatio
            }
        });

        let ground, leftWall, rightWall;

        function createWalls() {
            const width = footerSection.clientWidth;
            const height = footerSection.clientHeight;
            const wallThick = 100;
            const groundOffset = 40;

            if (ground) Composite.remove(world, [ground, leftWall, rightWall]);

            ground = Bodies.rectangle(width / 2, height - groundOffset + (wallThick / 2), width, wallThick, { isStatic: true, render: { visible: false } });
            leftWall = Bodies.rectangle(0 - wallThick / 2, height / 2, wallThick, height * 5, { isStatic: true, render: { visible: false } });
            rightWall = Bodies.rectangle(width + wallThick / 2, height / 2, wallThick, height * 5, { isStatic: true, render: { visible: false } });

            Composite.add(world, [ground, leftWall, rightWall]);
        }

        // 오브제 생성 함수
        function addFooterObjects() {
            const width = footerSection.clientWidth;
            // [수정] 겹침 방지를 위해 x축 범위를 안전하게 좁힘 (좌우 여백 100px)
            for (let i = 0; i < 12; i++) createSingleObject('./img/vector7.png', 0.8, width);
            createSingleObject('./img/vector1.png', 0.9, width);
            createSingleObject('./img/vector4.png', 0.9, width);
            createSingleObject('./img/bread01.png', 0.6, width);
        }

        function createSingleObject(src, scale, containerWidth) {
            // [수정] 벽에 끼지 않도록 X 좌표 범위를 (100 ~ width-100)으로 설정
            const xPos = Math.random() * (containerWidth - 200) + 100;
            // [수정] Y 좌표를 더 위로 올려서(-500 ~ -2000) 확실히 떨어지는 모습 연출
            const yPos = -Math.random() * 1500 - 500;
            const bodySize = 50 * scale;

            const body = Bodies.circle(xPos, yPos, bodySize, {
                restitution: 0.6,
                friction: 0.1,
                frictionAir: 0.01,
                angle: Math.random() * Math.PI * 2,
                render: {
                    sprite: {
                        texture: src,
                        xScale: scale,
                        yScale: scale
                    }
                }
            });
            Composite.add(world, body);
        }

        // 초기 벽 생성
        createWalls();

        // [핵심] 스크롤이 도달했을 때 엔진 시작 및 오브제 투하
        ScrollTrigger.create({
            trigger: "#footer",
            start: "top 70%", // 푸터가 보이기 시작할 때
            once: true,       // 한 번만 실행
            onEnter: () => {
                // 1. 렌더러와 엔진 실행
                Render.run(render);
                const runner = Runner.create();
                Runner.run(runner, engine);

                // 2. 오브제 추가 (엔진이 켜진 후 추가해야 자연스러움)
                addFooterObjects();
            }
        });

        // 마우스 컨트롤
        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
        mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);
        Composite.add(world, mouseConstraint);

        // 리사이즈 대응
        window.addEventListener('resize', () => {
            const newWidth = footerSection.clientWidth;
            const newHeight = footerSection.clientHeight;
            render.canvas.width = newWidth;
            render.canvas.height = newHeight;
            render.options.width = newWidth;
            render.options.height = newHeight;
            render.bounds.max.x = newWidth;
            render.bounds.max.y = newHeight;
            createWalls();
        });
    }
}