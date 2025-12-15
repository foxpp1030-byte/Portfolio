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
    // const hamIcon = document.querySelector(".ham_menu i");
    const menuIcon = document.querySelector('.menu_icon_svg');
    const overlayPage = document.querySelector('.object_page');
    const header = document.querySelector('header');

    function addOverlay() {
        if (lenis) lenis.stop();
        document.body.style.overflow = "hidden";
        overlayPage.classList.add('on');
        header.classList.add('menu-open');

        // ⭐ [수정] 햄버거 아이콘(SVG)을 X 아이콘으로 교체 ⭐
        if (menuIcon) {
            // X 아이콘 SVG 파일이 './img/close.svg'에 있다고 가정합니다.
            // 파일이 없다면 이 파일명을 실제 'X'자 SVG 파일 경로로 바꿔주세요.
            menuIcon.src = './img/close.svg';
        }
    }

    function removeOverlay() {
        document.body.style.overflow = "auto";
        if (lenis) lenis.start();
        overlayPage.classList.remove('on');
        header.classList.remove('menu-open');

        // ⭐ [수정] X 아이콘(SVG)을 햄버거 아이콘으로 복귀 ⭐
        if (menuIcon) {
            menuIcon.src = './img/menu.svg';
        }
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




    function toggleMenu() {
        const header = document.querySelector('header');
        const overlay = document.querySelector('.object_page');
        const isOpen = header.classList.contains('menu-open');

        if (isOpen) {
            // 메뉴 닫기
            header.classList.remove('menu-open');
            overlay.classList.remove('on');
            lenis.start(); // 스크롤 재개

            // ⭐ 햄버거 아이콘으로 복귀 ⭐
            if (menuIcon) {
                menuIcon.src = './img/menu.svg';
            }
        } else {
            // 메뉴 열기
            header.classList.add('menu-open');
            overlay.classList.add('on');
            lenis.stop(); // 스크롤 막기

            // ⭐ X 아이콘으로 변경 ⭐
            if (menuIcon) {
                // "X" 모양의 SVG 파일 경로로 변경해야 합니다. 
                // 예를 들어, X 모양의 SVG 파일이 'img/close.svg'에 있다면
                // menuIcon.src = './img/close.svg';

                // 또는 Font Awesome X 아이콘을 이미지로 만든 것이 있다면 그 경로를 사용합니다.
                // 임시로 기본 닫기 아이콘 경로를 가정합니다.
                menuIcon.src = './img/close_x.svg';
            }
        }
    }
}