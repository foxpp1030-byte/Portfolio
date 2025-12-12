// js/gnb.js

// 메뉴 활성화 함수 (유지)
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

            // [수정된 부분] gsap.to 대신 lenis.scrollTo 사용
            if (targetId && lenis) {
                lenis.scrollTo(targetId, {
                    duration: 1.5, // 이동 속도 (초)
                    easing: (t) => 1 - Math.pow(1 - t, 4), // 부드러운 감속 효과 (power4.out 느낌)
                    onComplete: () => set_active(targetId)
                });
            }
        });
    });

    // 2. 오버레이(햄버거 메뉴) 제어 (유지)
    const hamMenu = document.querySelector(".ham_menu");
    const hamIcon = document.querySelector(".ham_menu i");
    const overlayPage = document.querySelector('.object_page');

    function addOverlay() {
        if (lenis) lenis.stop();
        document.body.style.overflow = "hidden";
        overlayPage.classList.add('on');
        hamIcon.classList.remove("fa-bars-staggered");
        hamIcon.classList.add("fa-xmark");
        document.querySelector('header').classList.add('menu-open');
    }

    function removeOverlay() {
        document.body.style.overflow = "auto";
        if (lenis) lenis.start();
        overlayPage.classList.remove('on');
        hamIcon.classList.remove("fa-xmark");
        hamIcon.classList.add("fa-bars-staggered");
        document.querySelector('header').classList.remove('menu-open');
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

            // [수정된 부분] 오버레이 메뉴도 lenis.scrollTo로 변경
            if (target && lenis) {
                lenis.scrollTo(target, {
                    duration: 1.5,
                    easing: (t) => 1 - Math.pow(1 - t, 4),
                    onComplete: () => set_active(target)
                });
            }
        });
    });
}