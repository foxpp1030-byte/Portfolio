// js/footer.js

export function initFooter(lenis) {
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
    // 기존 인터벌이 있다면 클리어 (중복 방지)
    if (window.timeInterval) clearInterval(window.timeInterval);
    window.timeInterval = setInterval(updateTime, 1000);
    updateTime();

    // 2. 푸터 등장 애니메이션 (GSAP)
    gsap.from(".big_typo", {
        scrollTrigger: { trigger: "#footer", start: "top 90%" },
        y: 100, opacity: 0, duration: 1.2, ease: "power2.out"
    });
    gsap.from(".contact_area, .meta_info", {
        scrollTrigger: { trigger: "#footer", start: "top 85%" },
        y: 50, opacity: 0, duration: 1, stagger: 0.1
    });

    // 3. Matter.js 물리 엔진 로직
    const footerContainer = document.querySelector("#footer_matter_container");
    const footerSection = document.querySelector(".footer_top_area");

    // [중요] 이미 엔진이 실행 중이라면 중복 실행 방지
    if (window.matterEngineRunning) return;

    if (footerContainer && footerSection) {
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;

        // 엔진 생성
        const engine = Engine.create();
        const world = engine.world;

        // [설정] 픽셀 비율 대응 (마우스 정확도 향상)
        const pixelRatio = window.devicePixelRatio || 1;

        const render = Render.create({
            element: footerContainer,
            engine: engine,
            options: {
                width: footerSection.clientWidth,
                height: footerSection.clientHeight,
                background: 'transparent',
                wireframes: false,
                pixelRatio: pixelRatio // 픽셀 비율 명시
            }
        });

        let ground, leftWall, rightWall;

        // [수정] 벽과 바닥을 훨씬 두껍게 만들어서 뚫고 나가는 현상 방지
        function createWalls() {
            const width = footerSection.clientWidth;
            const height = footerSection.clientHeight;
            const wallThick = 500; // 두께를 500px로 대폭 증가

            const floorOffset = 30;
            // 기존 벽 제거
            if (ground) Composite.remove(world, [ground, leftWall, rightWall]);

            // 바닥 (화면 아래쪽에 두껍게 배치)
            ground = Bodies.rectangle(width / 2, height + (wallThick / 2) - floorOffset, width + 200, wallThick, {
                isStatic: true,
                render: { visible: false },
                label: "Ground"
            });

            // 왼쪽 벽 (화면 왼쪽에 두껍게 배치)
            leftWall = Bodies.rectangle(0 - (wallThick / 2), height / 2, wallThick, height * 10, {
                isStatic: true,
                render: { visible: false },
                label: "LeftWall"
            });

            // 오른쪽 벽 (화면 오른쪽에 두껍게 배치)
            rightWall = Bodies.rectangle(width + (wallThick / 2), height / 2, wallThick, height * 10, {
                isStatic: true,
                render: { visible: false },
                label: "RightWall"
            });

            Composite.add(world, [ground, leftWall, rightWall]);
        }

        // 오브제 생성 함수
        function addFooterObjects() {
            const width = footerSection.clientWidth;

            // [수정] 오브젝트 갯수와 생성 위치를 조절하여 폭발 방지
            // Y축 위치를 -500부터 -3000까지 넓게 퍼뜨려 순차적으로 떨어지게 함
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    createSingleObject('/img/vector7.png', 0.8, width, i);
                }, i * 100); // 0.1초 간격으로 생성하여 겹침 방지
            }

            setTimeout(() => createSingleObject('/img/vector4.png', 0.9, width, 10), 1000);
            setTimeout(() => createSingleObject('/img/bread01.png', 0.6, width, 11), 1200);
        }

        function createSingleObject(src, scale, containerWidth, index) {
            // [수정] 안전한 X 좌표 범위 (좌우 여백 150px)
            const safeWidth = Math.max(containerWidth - 300, 100);
            const xPos = Math.random() * safeWidth + 150;

            // [수정] Y 좌표를 더 높이, 그리고 분산시켜서 배치
            const yPos = -500 - (index * 200);

            const bodySize = 50 * scale;

            const body = Bodies.circle(xPos, yPos, bodySize, {
                restitution: 0.5, // 탄성 약간 감소 (너무 튀지 않게)
                friction: 0.1,
                frictionAir: 0.02, // 공기 저항 약간 증가 (너무 빨리 떨어지지 않게)
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

        // [핵심] 실행 함수
        window.__startFooterMatter = function () {
            // 이미 실행 중이면 중단 (중복 실행 방지)
            if (window.matterEngineRunning) return;

            window.matterEngineRunning = true; // 실행 플래그 설정

            // console.log(render); // [삭제] 콘솔 스팸 제거
            Render.run(render);

            const runner = Runner.create();
            Runner.run(runner, engine);

            addFooterObjects();
        };

        let footerStarted = false;

        lenis.on('scroll', ({ scroll }) => {
            // 이미 실행되었거나, 실행 중이면 리턴
            if (footerStarted || window.matterEngineRunning) return;

            const scrollY = scroll;
            const totalHeight = document.body.scrollHeight;
            const viewport = window.innerHeight;

            // 조건: 푸터 근처에 도달했을 때
            if (scrollY + viewport >= totalHeight - 1200) { // 감지 거리를 조금 더 넉넉하게
                footerStarted = true;
                if (window.__startFooterMatter) {
                    window.__startFooterMatter();
                }
            }
        });

        // [수정] 마우스 컨트롤 개선
        const mouse = Mouse.create(render.canvas);

        // 픽셀 비율에 따른 마우스 스케일 보정
        mouse.pixelRatio = pixelRatio;

        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });

        // 스크롤 휠 이벤트가 간섭하지 않도록 제거
        // mouseConstraint.mouse.element.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel);
        // mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel);

        Composite.add(world, mouseConstraint);

        // 리사이즈 대응 (디바운스 적용)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newWidth = footerSection.clientWidth;
                const newHeight = footerSection.clientHeight;

                render.canvas.width = newWidth;
                render.canvas.height = newHeight;
                render.options.width = newWidth;
                render.options.height = newHeight;

                // 마우스 스케일 재조정은 필요 없으나 캔버스 오프셋 갱신 필요 가능성 있음

                createWalls();
            }, 200);
        });
    }
}