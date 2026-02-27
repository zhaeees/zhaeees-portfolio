AOS.init();

/* ==============
 hero
============== */
const words = [
  "프론트엔드 개발자",
  "퍼블리셔",
  "UI/UX 개발자"
];

const typingEl = document.getElementById("typing-text");

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typingLoop() {
  const currentWord = words[wordIndex];

  if (!isDeleting) {
    typingEl.textContent = currentWord.slice(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentWord.length) {
      setTimeout(() => isDeleting = true, 1200);
    }
  } else {
    typingEl.textContent = currentWord.slice(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length; // 무한 루프
    }
  }

  const speed = isDeleting ? 60 : 100;
  setTimeout(typingLoop, speed);
}

typingLoop();


/* ==============
 draw
============== */
document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.querySelector(".scribble-wrap");
  const svg  = document.querySelector(".scribble");
  const path = document.querySelector(".scribble__path");
  const icon = document.querySelector(".scribble-icon");
  if (!wrap || !svg || !path || !icon) return;

  const DURATION_MS = 2200; // SCSS의 2.2s와 맞추기

  const length = path.getTotalLength();
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);

  let timer = null;

  const reset = () => {
    // 아이콘 숨김
    icon.classList.remove("is-show");

    // 애니메이션 리셋
    path.style.animation = "none";
    path.style.strokeDashoffset = String(length);
    path.offsetHeight; // reflow로 애니메이션 강제 재시작
  };

  const play = () => {
    reset();

    // 라인 그리기 시작
    path.style.animation = `scribble-draw ${DURATION_MS}ms ease forwards`;

    // 그리기 끝나면 아이콘 등장
    clearTimeout(timer);
    timer = setTimeout(() => {
      icon.classList.add("is-show");
    }, DURATION_MS);
  };

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      play();
    } else {
      // 화면 밖으로 나가면 초기화(다시 들어오면 재생)
      reset();
      clearTimeout(timer);
    }
  }, {
    threshold: 0.3
  });

  observer.observe(wrap);
});


/* ==============
   projects
============== */
// 필터
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#projects");
  if (!section) return;

  const cards = section.querySelectorAll(".project-card");
  const allRadio = section.querySelector('input[name="all"]');

  // 토글 적용할 라디오 그룹들
  const toggleRadios = section.querySelectorAll(
    'input[name="tagLang"], input[name="tagTech"], input[name="type"], input[name="etc"]'
  );

  // 그룹별 마지막 선택 저장
  const lastByGroup = new Map();

  // ================================
  // PC radio 토글
  // ================================
  toggleRadios.forEach((radio) => {
    radio.addEventListener("click", function () {
      const group = this.name;
      const last = lastByGroup.get(group);

      // 같은 버튼 다시 클릭 → 체크 해제
      if (last === this) {
        this.checked = false;
        lastByGroup.delete(group);
      } else {
        lastByGroup.set(group, this);
      }

      // 다른 필터 클릭 시 ALL 자동 해제
      if (allRadio) allRadio.checked = false;

      applyFilter();
    });
  });

  // ================================
  // ALL 클릭 시 전체 초기화
  // ================================
  if (allRadio) {
    allRadio.addEventListener("change", () => {
      if (!allRadio.checked) return;

      toggleRadios.forEach((r) => (r.checked = false));
      lastByGroup.clear();
      applyFilter();
    });
  }

  // ==================================================
  // ⭐ 모바일 커스텀 select
  // ==================================================
  const customSelect = section.querySelector(".custom-select");

  if (customSelect) {
    const btn = customSelect.querySelector(".custom-select__btn");
    const list = customSelect.querySelector(".custom-select__list");
    const items = list.querySelectorAll("li");

    // select 열고 닫기
    btn.addEventListener("click", () => {
      customSelect.classList.toggle("open");
    });

    // 항목 선택
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const value = item.dataset.value;

        // 버튼 텍스트 변경
        btn.textContent = item.textContent;
        customSelect.classList.remove("open");

        // ===== 기존 필터 연결 =====

        // ALL 선택
        if (value === "all") {
          if (allRadio) {
            allRadio.checked = true;
            allRadio.dispatchEvent(new Event("change"));
          }
          return;
        }

        // ALL 해제
        if (allRadio) allRadio.checked = false;

        // ⭐ 모바일은 항상 하나만 선택
        toggleRadios.forEach((r) => (r.checked = false));
        lastByGroup.clear();

        // 해당 radio 선택
        const radio = section.querySelector(`input[value="${value}"]`);
        if (radio) {
          radio.checked = true;
          lastByGroup.set(radio.name, radio);
        }

        applyFilter();
      });
    });

    // 바깥 클릭 시 닫기
    document.addEventListener("click", (e) => {
      if (!customSelect.contains(e.target)) {
        customSelect.classList.remove("open");
      }
    });
  }

  // ================================
  // 그룹별 선택값 가져오기
  // ================================
  function getValue(name) {
    const el = section.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : "";
  }

  // ================================
  // 실제 필터링
  // ================================
  function applyFilter() {
    if (allRadio && allRadio.checked) {
      cards.forEach((card) => (card.style.display = ""));
      return;
    }

    const lang = getValue("tagLang");
    const tech = getValue("tagTech");
    const type = getValue("type");
    const etc  = getValue("etc");

    cards.forEach((card) => {
      const tags = (card.dataset.tag || "")
        .trim().split(/\s+/).filter(Boolean);

      const cardType = (card.dataset.type || "").trim();
      const cardEtc  = (card.dataset.etc || "")
        .trim().split(/\s+/).filter(Boolean);

      const matchLang = !lang || tags.includes(lang);
      const matchTech = !tech || tags.includes(tech);
      const matchType = !type || cardType === type;
      const matchEtc  = !etc  || cardEtc.includes(etc);

      card.style.display =
        (matchLang && matchTech && matchType && matchEtc)
          ? ""
          : "none";
    });
  }

  applyFilter();
});


// 카드
const grid = document.querySelector(".project-grid");
const popup = document.querySelector(".popup");

render(projects);

function render(data) {
  grid.innerHTML = data.map(item => `
    <article class="project-card" data-aos="fade-up" data-aos-anchor-placement="top-bottom" data-aos-duration="1200"
       data-aos-delay="500"    data-aos-easing="ease-out-cubic"
      data-tag="${item.tags.join(" ")}"
      data-type="${item.type}"
      data-etc="${item.tags.join(" ")}"
    >
      <div class="project-thumb">
        <img src="${item.thumb}" alt="">
      </div>

      <div class="project-text">
        <h4>${item.title}</h4>
        <p>${item.subTitle}</p>
        <p>${item.summary}</p>
      </div>

      <div class="btn" data-id="${item.id}">
        <img src="images/more-img.png" alt="">
        <button class="more-btn">MORE</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const project = projects.find(p => p.id == btn.dataset.id);
      openPopup(project);
    });
  });
}

// 팝업
function openPopup(data) {
  const stackHTML = data.stack.map(item => `
    <img src="${item.icon}" class="stack-img" alt="${item.name}">
  `).join("");


  popup.innerHTML = `
    <div class="popup-inner">
      <span class="close">&times;</span>

      <h2 class="popup-title">${data.title}</h2>

      <div class="popup-wrap">
        <div class="scroll-img">
         <img src="${data.img}"  alt="">
        </div>

        <div class="popup-text">

          <div class="desc-wrap">
            <h4>프로젝트 설명</h4>
            <p>${data.description}</p>
          </div>

          <div class="desc-wrap">
            <h4>기술 스택</h4>
            <div class="stack-icons">
              ${stackHTML}
            </div>
          </div>

          <div class="desc-wrap">
            <h4>프로젝트</h4>
            <p>${data.type} 프로젝트</p>
          </div>

          <div class="desc-wrap">
            <h4>기간</h4>
            <p>${data.period}</p>
          </div>

          <div class="popup-btn-wrap">
            <button><a href="${data.ppt}" target="_blank">기획서 보기</a></button>
            <button><a href="${data.site}" target="_blank">사이트 바로가기</a></button>
            <button><a href="${data.github}" target="_blank">Git Hub</a></button>
            <button><a href="${data.figma}" target="_blank">Figma</a></button>
          </div>

        </div>
      </div>
    </div>
  `;

  popup.classList.add("active");
  document.body.style.overflow = "hidden";

  popup.querySelector(".close").onclick = closePopup;
  popup.onclick = e => {
    if (e.target === popup) closePopup();
  }
}

function closePopup() {
  popup.classList.remove("active");
  document.body.style.overflow = "";
}