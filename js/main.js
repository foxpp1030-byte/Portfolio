gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

window.addEventListener("load", () => {
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
            anticipatePin: 1
        }
    });
});



document.addEventListener("scroll", () => {
    const hero = document.querySelector(".hero_section");
    const logo = document.querySelector(".rotate_logo");

    const hero_bottom = hero.getBoundingClientRect().bottom;

    if (hero_bottom <= 0) {
        logo.classList.add("rotate_logo_hidden");
    } else {
        logo.classList.remove("rotate_logo_hidden");
    }
});


document.querySelectorAll('.obj[data_target]').forEach(obj => {
    obj.addEventListener('click', () => {
        const target = obj.getAttribute('data_target');
        gsap.to(window, { duration: 1, scrollTo: target, ease: "power2.out" });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    //스크롤에 따라 경로 애니메이션 진행
    function calcDashOffset(scrollY, element, length) {
        const ratio = (scrollY - element.offsetTop) / element.offsetHeight; // 스크롤 위치와 요소 높이 비율 계산
        const value = length - (length * ratio); // 대시 오프셋 값을 계산
        return Math.max(0, Math.min(value, length)); // 범위 내에서 반환
    }

    //스크롤 이벤트에 따른 경로 애니메이션 처리
    function scrollHandler(svgCon, path, pathLenght) {
        const scrollY = window.scrollY + (window.innerHeight * 0.8);
        //화면 높이 고려한 스크롤 위치 계산
        path.style.strokeDashoffset = calcDashOffset(scrollY, svgCon, pathLenght)
    }
    window.addEventListener('scroll', () => {
        //svg 경로 애니메이션 설정
        const svgCon = document.querySelector('#projects');
        const path = document.querySelector('.path1');
        const pathLenght = path.getTotalLength(); //경로의 총 길이 계산
        path.style.strokeDasharray = pathLenght; //경로를 점선처럼 보이게 설정
        path.style.strokeDashoffset = pathLenght; //경로를 숨기기 위해 대시 오프셋을 길이로 설정
        scrollHandler(svgCon, path, pathLenght)

    }); //스크롤 이벤트 리스너 추가});

    //가로 스크롤 섹션 애니메이션 설정
    const horizontal = document.querySelector('.horizontal');
    const sections = gsap.utils.toArray('.horizontal>section');
    let ani = [];
    const scrollTween = gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),//전체 섹션 수만큼 왼쪽으로 밀기
        ease: 'none',//부드럽게 넘기지 않고 스크롤에 따라 바로 반응
        scrollTrigger: {
            trigger: horizontal,
            start: 'top top', //스크롤이 맨 위에 닿을때 시작
            end: () => "+=" + (horizontal.offsetWidth - innerWidth), //스크롤 끝나는 위치 계산
            pin: true, //해당 부분에서 화면을 고정해서 보여줌
            markers: true,//디버그용 마커 보여주기
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

});





