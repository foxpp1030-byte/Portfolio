// ===== Marquee (vanilla) for .sticky_title .list =====
(function initVisionMarquee() {
  const list = document.querySelector('.sticky_title .list');
  if (!list) return;

  // 1) 콘텐츠를 2배로 복제해서 끊김 없이 순환
  //    <li>들을 한 번 더 덧붙여 총 길이를 200%로 만듭니다.
  list.innerHTML = list.innerHTML + list.innerHTML;

  // 2) 실제 폭을 기준으로 속도를 동적으로 설정 (넓으면 천천히, 좁으면 빠르게)
  //    기본 30초를 기준으로, 폭이 넓을수록 duration을 늘려 자연스러운 속도 유지
  const updateSpeed = () => {
    const width = list.scrollWidth; // 200% 기준
    // 200% 기준 너비의 절반(=원본 100%)을 한 바퀴로 간주
    const oneLoop = width / 2;
    // 뷰포트 대비 적당한 시간(픽셀/초 비슷한 느낌)으로 산정
    const pxPerSec = Math.max(40, Math.min(140, window.innerWidth * 0.06));
    const duration = Math.max(10, Math.min(60, oneLoop / pxPerSec));

    list.style.animationDuration = `${duration}s`;
  };

  // 최초 속도 설정 + 리사이즈 반영
  updateSpeed();
  window.addEventListener('resize', () => {
    // 리사이즈 시 애니메이션 리셋 트릭 (지연 없이 재시작)
    list.style.animation = 'none';
    list.offsetHeight; // reflow
    updateSpeed();
    list.style.animation = '';
  });

  // 3) 인터랙션: 포인터/터치 시 일시정지
  const pause = () => list.classList.add('is-paused');
  const resume = () => list.classList.remove('is-paused');
  list.addEventListener('pointerenter', pause);
  list.addEventListener('pointerleave', resume);
  list.addEventListener('touchstart', pause, { passive: true });
  list.addEventListener('touchend', resume, { passive: true });
})();



//performance 서브텍스트 모션 끝

/// 1. .vid에 토글클래스 적용 (원하는 스타일 전환)
gsap.timeline({
  scrollTrigger: {
    trigger: ".vid",
    start: "top 40%",
    end: "bottom center",
    scrub: true,
    // markers: true,
    toggleClass: { targets: ".vid", className: "on" },
  }
});

// 2. .vid_box 핀 처리 및 내부 video 스케일 애니메이션
gsap.timeline({
  scrollTrigger: {
    trigger: ".vid_box",               // 부모 섹션을 트리거로 사용
    start: "top 10%",
    end: "top 10%+=2500",           // 1500px 스크롤 동안 애니메이션 진행 (필요에 따라 조정)
    scrub: 1,
    pin: ".vid_box",               // .vid_box를 핀 처리
    pinSpacing: true,
    pinReparent: true,             // 부모 transform 문제 해결
    // markers: true,
  }
})
  .fromTo(".vid_box video",
    { scale: 0.45, opacity: 0.45, transformOrigin: "top center" },
    { scale: 1, opacity: 1, ease: "power2.out", duration: 2 }
  );




// Trust promise 섹션 애니메이션
const trustContainer = document.querySelector('.trust .con');
const cards = gsap.utils.toArray('.trust ul li');

// 전체 컨테이너를 핀 처리하는 타임라인 생성
gsap.timeline({
  scrollTrigger: {
    trigger: trustContainer,
    start: "top 10%",                      // 컨테이너 상단이 뷰포트 상단에 도달할 때 시작
    // 각 카드당 약 600px (508px 카드 높이 + 여백)을 할당
    end: () => "+=" + (cards.length * 580),
    scrub: 1,
    // markers: true,
    invalidateOnRefresh: true,// <- 새로고침/리프레시 때 위치 다시 계산
  }
})
  // 카드가 나타나면서 원근감 효과: y가 600에서 0으로, z가 300에서 0으로 이동
  .fromTo(cards,
    { y: 300, z: 200, opacity: 0.8 },
    { y: 0, z: 0, duration: 1, ease: "power2.out", stagger: 1, opacity: 1 }
  )

  // 점점 제자리로 오면서 부드럽게(power2.out) 1초 동안 이동
  // stagger: 1 => 카드 하나씩 1초 간격으로 차례차례 등장

  // 카드가 사라지면서 반대로 원근감 효과: y가 0에서 -600, z가 0에서 -300으로 이동
  .to(cards,
    {
      y: -300, z: -200,
      skewY: 5,
      duration: 1, ease: "power2.in", stagger: 1,
    },
    "+=0.5"
  );



let newsSwiper = new Swiper(".news .con", {
  slidesPerView: 'auto',
  loop: 'true',
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
  spaceBetween: 50,
  pagination: {
    el: ".news .swiper-pagination",
    type: "progressbar",
  },
});

const visionCards = gsap.utils.toArray(".vision .card");

visionCards.forEach((card, i) => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".vision",
      start: `top+=${i * 300} center`,
      end: `top+=${(i + 1) * 300} center`,
      scrub: 1.2,
      // markers: true,
    }
  });

  tl.fromTo(card, { rotationY: 0 }, {
    rotationY: 180,
    transformOrigin: "center center",
    ease: "power2.out"
  });
});








