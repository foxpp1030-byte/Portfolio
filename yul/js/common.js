gsap.registerPlugin(ScrollTrigger);

// Lenis 초기화
const lenis = new Lenis({
    // 필요 시 duration/lerp 등 옵션 추가
});

// Lenis와 GSAP 동기화
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Lenis 스크롤 시 ScrollTrigger 업데이트
lenis.on('scroll', () => {
    ScrollTrigger.update();
});

// 기본 스크롤(윈도우) 기준이므로 scroller 지정 불필요
ScrollTrigger.defaults({
    scrub: 1,
});

// ✅ cursor, businessSection을 먼저 정의한 뒤 사용하세요
const cursor = document.querySelector(".custom_cursor");
const businessSection = document.querySelector('.business ul');

// 마우스 좌표 업데이트 (⚠️ cursor null 가드 + window.scrollY 사용)
// 마우스 이동 → transform으로만 이동 (scrollY 보정 X)
if (cursor) {
    let x = 0, y = 0, rafId = null;
    window.addEventListener('pointermove', (e) => {
        x = e.clientX; y = e.clientY;
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                rafId = null;
                // ✅ transform은 CSS가 관리, JS는 변수만 업데이트
                cursor.style.setProperty('--mx', x + 'px');
                cursor.style.setProperty('--my', y + 'px');
            });
        }
    });
}
// 드래그 상태 토글(있을 때만)
if (businessSection && cursor) {
    businessSection.addEventListener('mouseenter', () => cursor.classList.add('drag'));
    businessSection.addEventListener('mouseleave', () => cursor.classList.remove('drag'));
}
// nav 안전 가드
const nav = document.querySelector('nav');
if (nav) {
    nav.addEventListener('mouseenter', (e) => {
        e.target.classList.add('on');
    });
    nav.addEventListener('mouseleave', (e) => {
        e.target.classList.remove('on');
    });
}

// r_memu 오타 가능성 있으니 확인 필요: .r_menu ?
const p = document.querySelector('.r_menu .sel p');
if (p) {
    p.addEventListener('click', function () {
        const selElement = this.closest('.sel');
        if (selElement) selElement.classList.toggle('on');
    });
}

// 특정 섹션이 부드럽게 나타나는 효과
gsap.utils.toArray(".txt p").forEach((el, index) => {
    gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 1,
        delay: index * 0.3,
        scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
            // ❌ scroller: "body" 제거 (기본 window 사용)
        }
    });
});

let mainSlide = new Swiper(".main_slide_wrap", {
    loop: true,
    effect: "fade",
    keyboard: { enabled: true },
    autoplay: { delay: 3000, disableOnInteraction: false },
    navigation: {
        nextEl: ".main_visual .next",
        prevEl: ".main_visual .prev",
    },
    on: {
        autoplayTimeLeft(swiper, time, progress) {
            document.querySelector('.swiper-pagination-line-fill').style.height = (1 - progress) * 100 + '%';
        },
        init(swiper) { updatePagination(swiper); },
        slideChangeTransitionEnd(swiper) { updatePagination(swiper); },
    },
});

function updatePagination(swiper) {
    const currentNum = swiper.realIndex + 1;
    const formattedNum = currentNum < 10 ? `0${currentNum}` : currentNum;
    const el = document.querySelector(".swiper-pagination-current");
    if (el) el.textContent = formattedNum;
}

let tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".txt_area",
        start: "top 20%",
        end: "bottom bottom",
        scrub: true,
    }
});

tl.to(".txt_area strong.tit", { backgroundSize: "100%", duration: 1, ease: "none" })
    .to(".txt_area", {
        backgroundSize: "100% 100%",
        opacity: 1,
        duration: 1,
        ease: "none"
    })
    .to(".txt_area i.tit", { backgroundSize: "100%", duration: 1, ease: "none" }, "+=0.6")
    .to(".txt_area b.tit", { backgroundSize: "100%", duration: 1, ease: "none" }, "+=1.2")
    .to(".txt_area em.tit", { backgroundSize: "100%", duration: 1, ease: "none" }, "+=1.8");


let businessSwiper = new Swiper(".business .slide", {
    loop: true,
    slidesPerView: 1.2,
    spaceBetween: 30,
    touchStartPreventDefault: false,
    pagination: { el: ".business .swiper-pagination", clickable: true },
    navigation: { nextEl: ".business .next", prevEl: ".business .prev" },
});

// --- special_product 패럴랙스 (Reduced Motion 고려) ---
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sectionEl = document.querySelector('.special_product');

if (!reduceMotion && sectionEl) {
    // speed=1 기준 이동량(px). 화면크기에 맞춰 과하지 않게 클램프.
    const BASE = () => Math.max(60, Math.min(160, window.innerHeight * 0.18));

    gsap.utils.toArray(sectionEl.querySelectorAll('li[data-scroll-speed]')).forEach((el) => {
        const speed = parseFloat(el.dataset.scrollSpeed || '1'); // 1, 3, -1 ...
        const dist = () => BASE() * speed;

        gsap.fromTo(el,
            { y: () => dist() },
            {
                y: () => -dist(),
                ease: 'none',
                scrollTrigger: {
                    trigger: el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                    invalidateOnRefresh: true,
                    // markers: true,
                }
            }
        );
    });

    // 이미지 로딩 뒤 위치 정확도 ↑
    window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
    // 정적 모드: 패럴랙스만 초기화(다른 트리거는 유지)
    gsap.set('.special_product li[data-scroll-speed]', { clearProps: 'transform' });
}

// Reduced Motion 설정이 바뀌면 새로고침 (선택 사항)
window.matchMedia('(prefers-reduced-motion: reduce)')
    .addEventListener('change', () => location.reload());
