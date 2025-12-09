// js/gnb.js

// 메뉴 활성화 함수 (main.js에서도 쓰기 위해 export)
export function set_active(target) {
    const navLinks = document.querySelectorAll(".gnb_tit li");

    navLinks.forEach((li) => {
        const a = li.querySelector('a');
        if (!a) return;

        if (typeof target === 'string') {
            if (a.getAttribute('href') === target) {
                li.classList.add('on');
            } else {
                li.classList.remove('on');
            }
        } else if (target instanceof Element) {
            const href = a.getAttribute('href');
            if (href && (href === `#${target.id}` || target.matches(href))) {
                li.classList.add('on');
            } else {
                li.classList.remove('on');
            }
        }
    });
}

// GNB 초기화 함수
export function initGnb(lenis) {
    // 1. 상단 메뉴 클릭 시 스크롤 이동
    const gnbLinks = document.querySelectorAll(".gnb_tit li a");

    gnbLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            document.body.style.overflow = "auto";
            if (lenis) lenis.start();

            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                gsap.to(window, {
                    scrollTo: { y: targetId, autoKill: false },
                    duration: 1.2,
                    ease: "power4.inOut",
                    onComplete: () => set_active(targetId)
                });
            }
        });
    });

    // 2. 오버레이(햄버거 메뉴) 제어
    const hamMenu = document.querySelector(".ham_menu");
    const hamIcon = document.querySelector(".ham_menu i");
    const overlayPage = document.querySelector('.object_page');

    function addOverlay() {
        if (lenis) lenis.stop();
        document.body.style.overflow = "hidden";
        overlayPage.classList.add('on');
        hamIcon.classList.remove("fa-bars-staggered");
        hamIcon.classList.add("fa-xmark");
    }

    function removeOverlay() {
        document.body.style.overflow = "auto";
        if (lenis) lenis.start();
        overlayPage.classList.remove('on');
        hamIcon.classList.remove("fa-xmark");
        hamIcon.classList.add("fa-bars-staggered");
    }

    if (hamMenu) {
        hamMenu.addEventListener("click", () => {
            if (overlayPage.classList.contains('on')) {
                removeOverlay();
            } else {
                addOverlay();
            }
        });
    }

    // 3. 오버레이 내부 아이템 클릭 시 이동
    document.querySelectorAll('.object_inner a').forEach((item) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const target = item.getAttribute("href");
            removeOverlay();

            if (target) {
                gsap.to(window, {
                    scrollTo: target,
                    duration: 1.2,
                    ease: "power4.inOut",
                    onComplete: () => set_active(target)
                });
            }
        });
    });
}