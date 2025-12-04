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
    const navLinks = document.querySelectorAll(".gnb li");

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



    // ================== Skillset ==================
    const skillReceipt = document.querySelector('.skillset_img');

    if (skillReceipt) {

        // 🎯 fromTo는 딱 1번 — 중복 실행 절대 없음
        gsap.fromTo(
            skillReceipt,
            { y: 500, opacity: 0.3 },
            {
                y: 0,
                opacity: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "#skills",
                    start: "top top",
                    end: () => "+=" + window.innerHeight,
                    scrub: 1,
                    pin: true,
                    anticipatePin: 1,
                    pinSpacing: true,
                    markers: false,
                    onEnter: () => set_active("#skills"),
                    onEnterBack: () => set_active("#skills"),
                }
            }
        );
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


    visualItems.forEach((item, i) => {
        gsap.to(".visual_poster_frame", {
            y: i * 80,   // 아이템 순서별 포스터 이동
            scrollTrigger: {
                trigger: item,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
            }
        });
    });

});




