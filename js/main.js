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
    gsap.to(".visual_poster_frame", {
        y: (visualItems.length - 1) * 80,
        scrollTrigger: {
            trigger: ".visual_poster_frame",
            start: "top top",
            end: "+=" + (visualItems.length * window.innerHeight),
            scrub: 1,
            pin: true,
        }
    });


});




// ==============================
// ICON CLOUD (Visual Archive 아이콘 섹션)
// ==============================
(function () {
    const icon_layer = document.querySelector('[data_icon_layer]');
    if (!icon_layer) return;

    const icon_count = 9; // X 여러 개 + 마지막 크루아상 1개
    const x_icon_src = './img/icon.png';      // X 아이콘 경로
    const bread_icon_src = './img/bread01.png'; // 크루아상 경로

    const duration_ms = 1100; // CSS animation 시간 1.1s

    for (let i = 0; i < icon_count; i++) {
        const img = document.createElement('img');
        img.draggable = false;
        img.classList.add('floating_icon');

        if (i === icon_count - 1) {
            img.src = bread_icon_src;
            img.alt = 'bread_icon';
            img.classList.add('floating_icon_bread');
        } else {
            img.src = x_icon_src;
            img.alt = 'x_icon';
        }

        // 가로 위치: 10% ~ 90% 랜덤
        const random_left_percent = 10 + Math.random() * 80;

        // 최종 세로 위치: 아래쪽 70% ~ 85% 사이에 모이게
        const random_final_top_percent = 70 + Math.random() * 15;

        // 떨어지는 시작 시간 살짝 랜덤
        const random_delay = Math.random() * 0.6; // 0 ~ 0.6초

        img.style.left = random_left_percent + '%';
        img.style.setProperty('--final_top', random_final_top_percent + '%');
        img.style.setProperty('--delay', random_delay + 's');

        icon_layer.appendChild(img);

        // 애니메이션이 끝난 뒤에 위치를 "고정"하고 드래그 기능 붙이기
        const total_delay = duration_ms + random_delay * 1000 + 50;
        setTimeout(function () {
            freeze_icon_and_enable_drag(img, icon_layer);
        }, total_delay);
    }

    // 애니메이션 끝난 위치를 px로 저장 + 드래그 이벤트 세팅
    function freeze_icon_and_enable_drag(icon, layer) {
        const layer_rect = layer.getBoundingClientRect();
        const rect = icon.getBoundingClientRect();

        // 아이콘 중심 좌표
        const center_x = rect.left - layer_rect.left + rect.width / 2;
        const center_y = rect.top - layer_rect.top + rect.height / 2;

        // 애니메이션 완전히 제거하고, 현재 위치를 px로 고정
        icon.style.animation = 'none';
        icon.style.left = center_x + 'px';
        icon.style.top = center_y + 'px';
        icon.style.transform = 'translate(-50%, -50%)';

        enable_icon_drag(icon, layer);
    }

    function enable_icon_drag(icon, layer) {
        let is_dragging = false;
        let offset_x = 0;
        let offset_y = 0;

        icon.addEventListener('pointerdown', function (event) {
            is_dragging = true;
            icon.setPointerCapture(event.pointerId);

            const rect = icon.getBoundingClientRect();

            // 포인터 위치 기준, 아이콘 "중심"에서 얼마나 벗어나 있는지 저장
            offset_x = event.clientX - (rect.left + rect.width / 2);
            offset_y = event.clientY - (rect.top + rect.height / 2);
        });

        icon.addEventListener('pointermove', function (event) {
            if (!is_dragging) return;

            const layer_rect = layer.getBoundingClientRect();

            let x = event.clientX - layer_rect.left - offset_x;
            let y = event.clientY - layer_rect.top - offset_y;

            // 화면 밖으로 못 나가게 약간 여유
            const padding = 40;
            x = Math.max(padding, Math.min(layer_rect.width - padding, x));
            y = Math.max(padding, Math.min(layer_rect.height - padding, y));

            // left/top 은 항상 "중심" 좌표
            icon.style.left = x + 'px';
            icon.style.top = y + 'px';
        });

        icon.addEventListener('pointerup', function (event) {
            if (!is_dragging) return;
            is_dragging = false;
            icon.releasePointerCapture(event.pointerId);
        });

        icon.addEventListener('pointercancel', function () {
            is_dragging = false;
        });
    }
})();
