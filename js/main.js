gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

document.addEventListener("DOMContentLoaded", () => {

    // ==================== Lenis ====================
    const lenis = new Lenis({
        duration: 0.8,
        easing: (t) => t, // 선형 (빠른 반응)
        smooth: true,
        smoothTouch: true, // 모바일 터치 스크롤 부드럽게
    });

    function raf(t) {
        lenis.raf(t);
        ScrollTrigger.update();
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    lenis.on('scroll', () => {
        ScrollTrigger.update();
    });

    // 기본 스크롤(윈도우) 기준이므로 scroller 지정 불필요
    ScrollTrigger.defaults({
        scrub: 1,
    });

    /* ================== Navigation Active ================== */
    const navLinks = document.querySelectorAll(".gnb li");

    function set_active(target) {
        navLinks.forEach((li) => {
            const a = li.querySelector("a");
            if (!a) return;
            li.classList.toggle("on", a.getAttribute("href") === target);
        });
    }


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


    const scrollMap = [
        { selector: ".obj_key", target: "#about" },
        { selector: ".obj_dessert", target: "#projects" },
        { selector: ".obj_earphone", target: "#visual" },
        { selector: ".obj_skillset", target: "#skills" }
    ];

    scrollMap.forEach(item => {
        const el = document.querySelector(item.selector);
        const target = document.querySelector(item.target);

        if (el && target) {
            el.addEventListener("click", () => {
                set_active(item.target);
                // removeOverlay(target);
            });
        }
    });
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
    ["about", "projects", "visual", "skills", "vision"].forEach((id) => {
        ScrollTrigger.create({
            trigger: "#" + id,
            start: "top top",
            end: "bottom center",
            onEnter: () => set_active("#" + id),
            onEnterBack: () => set_active("#" + id),
        });
    });



    window.addEventListener("load", () => {
        ScrollTrigger.refresh();
        setTimeout(() => ScrollTrigger.refresh(), 500); // ✅ Lenis 초기화 후 0.5초 뒤 다시

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












    //가로 스크롤 섹션 애니메이션 설정
    const horizontal = document.querySelector('.horizontal');
    const sections = gsap.utils.toArray('.horizontal>article');
    let ani = [];
    const scrollTween = gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),//전체 섹션 수만큼 왼쪽으로 밀기
        ease: 'none',//부드럽게 넘기지 않고 스크롤에 따라 바로 반응
        scrollTrigger: {
            trigger: horizontal,
            start: 'top top', //스크롤이 맨 위에 닿을때 시작
            end: () => "+=" + (horizontal.offsetWidth - innerWidth), //스크롤 끝나는 위치 계산
            pin: true, //해당 부분에서 화면을 고정해서 보여줌
            //markers: true,//디버그용 마커 보여주기
            scrub: 1, //스크롤에 따라 실시간으로 움직임
            anticipatePin: 1, // 핀 고정 시 살짝 미리 준비해서 부드럽게
            invalidateOnRefresh: true, // 새로고침하면 위치 다시 계산해줌
        }
    })


    // 각 섹션에 애니메이션 적용
    const animations = [
        { target: ".iw1", properties: { y: -200 }, duration: 2, ease: "elastic" },
        { target: ".iw2", properties: { rotation: 720 }, duration: 2, ease: "elastic" },
        { target: ".iw3", properties: { scale: 0.3 }, duration: 2, ease: "elastic" },
        { target: ".iw4", properties: { x: -100, rotation: 50 }, duration: 2.5, ease: "power1.inOut" },
        { target: ".iw5", properties: { scale: 2.3 }, duration: 1, ease: "none" }
    ];


    //애니메이션 설정
    animations.forEach((anim, index) => {
        ani[index] = gsap.to(anim.target, {
            ...anim.properties,
            duration: anim.duration,
            ease: anim.ease,
            scrollTrigger: {
                trigger: anim.target,
                containerAnimation: scrollTween, // 가로 스크롤 애니메이션과 동기화
                start: 'left center',
                toggleActions: "play none reverse none", //한번 재생, 뒤로갈때만 역재생
                id: anim.target //디버깅용 id
            }
        })
    })

    //각 애니메이션을 트리거하는 함수
    function triggerAnimation(index) {
        //ani[index]가 존재하는지 체크하고 애니메이션 실행
        if (ani[index]) {
            ani[index].restart(); //해당 섹션의 애니메이션 재시작
        }
    }

    //각 섹션에 대한 스크롤 트리거 설정
    sections.forEach((section, index) => {
        ScrollTrigger.create({
            trigger: section,
            start: "left center",
            onEnter: () => {
                triggerAnimation(index);
            },
            onEnterBack: () => {
                triggerAnimation(index);
            },
            containerAnimation: scrollTween, // 가로 스크롤 애니메이션과 동기화   
        })
    })





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

    window.addEventListener("resize", () => ScrollTrigger.refresh());
    // Reduced Motion 설정이 바뀌면 새로고침 (선택 사항)
    window.matchMedia('(prefers-reduced-motion: reduce)')
        .addEventListener('change', () => location.reload());

});



