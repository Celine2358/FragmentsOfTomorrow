const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const themeToggle = $('#themeToggle');
const menuToggle = $('#menuToggle');
const nav = $('.nav');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('fot-theme', theme);
  themeToggle.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
}

setTheme(localStorage.getItem('fot-theme') || 'dark');

themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

menuToggle?.addEventListener('click', () => nav.classList.toggle('open'));
$$('.nav a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

// Survival simulator
const hydrationRange = $('#hydrationRange');
const hungerRange = $('#hungerRange');
const hydrationValue = $('#hydrationValue');
const hungerValue = $('#hungerValue');
const survivalReadout = $('#survivalReadout');

function hydrationProfile(h) {
  if (h >= 51) return { speed: 100, recover: 100, label: '정상 이동' };
  if (h >= 31) return { speed: 80, recover: 100, label: '가벼운 갈증' };
  if (h >= 11) return { speed: 50, recover: 90, label: '위험한 갈증' };
  if (h >= 1) return { speed: 20, recover: 80, label: '탈수 직전' };
  return { speed: 10, recover: 50, label: '탈수 상태' };
}

function hungerProfile(h) {
  if (h >= 101) return { hp: '4초당 HP +1', state: '회복 가능' };
  if (h >= 51) return { hp: '6초당 HP +1', state: '느린 회복' };
  if (h >= 31) return { hp: 'HP 변화 없음', state: '불안정' };
  if (h >= 11) return { hp: '5초당 HP -1', state: '체력 감소' };
  if (h >= 1) return { hp: '2초당 HP -1', state: '심각한 허기' };
  return { hp: '1초당 HP -1', state: '아사 상태' };
}

function updateSurvival() {
  const hydration = Number(hydrationRange.value);
  const hunger = Number(hungerRange.value);
  hydrationValue.textContent = hydration;
  hungerValue.textContent = hunger;
  const hp = hungerProfile(hunger);
  const hy = hydrationProfile(hydration);
  const dash = hydration > 30 && hunger > 30;
  survivalReadout.innerHTML = `
    <strong>${hy.label}</strong><br>
    이동 속도: ${hy.speed}% · 허기 회복 효율: ${hy.recover}%<br>
    HP 상태: ${hp.hp} <small>(${hp.state})</small><br>
    대시 가능 여부: <strong>${dash ? '가능' : '불가능'}</strong>
  `;
}

hydrationRange.addEventListener('input', updateSurvival);
hungerRange.addEventListener('input', updateSurvival);
updateSurvival();

// Decay simulator
const decayRange = $('#decayRange');
const decayValue = $('#decayValue');
const iceboxCheck = $('#iceboxCheck');
const decayReadout = $('#decayReadout');

function decayMultiplier(decay) {
  let penalty = 0;
  if (decay < 30) return 1;
  if (decay < 50) penalty = (decay - 30) * 0.02;
  else if (decay < 70) penalty = 20 * 0.02 + (decay - 50) * 0.03;
  else penalty = 20 * 0.02 + 20 * 0.03 + (decay - 70) * 0.04;
  return Math.max(0, 1 - penalty);
}

function updateDecay() {
  const decay = Number(decayRange.value);
  decayValue.textContent = decay;
  const mult = decayMultiplier(decay);
  const equivalent = iceboxCheck.checked ? Math.round(decay * 0.2) : decay;
  const label = decay < 30 ? '신선함' : decay < 50 ? '품질 저하' : decay < 70 ? '위험' : '부패 심각';
  decayReadout.innerHTML = `
    <strong>${label}</strong><br>
    회복 효율: ${Math.round(mult * 100)}%<br>
    예시 회복량 50 기준: ${Math.round(50 * mult)}<br>
    아이스박스 적용 시 체감 부패 진행: ${equivalent}%
  `;
}

decayRange.addEventListener('input', updateDecay);
iceboxCheck.addEventListener('change', updateDecay);
updateDecay();

// Damage simulator
const baseAttack = $('#baseAttack');
const playerLevel = $('#playerLevel');
const critCheck = $('#critCheck');
const metalTier = $('#metalTier');
const damageReadout = $('#damageReadout');

function applyMetalTier(tier, damage) {
  if (tier === 'ThirdMetal') return Math.round(damage * 0.9);
  if (tier === 'SecondMetal') return Math.round(damage * 0.8);
  return Math.round(damage);
}

function updateDamage() {
  const attack = Math.max(0, Number(baseAttack.value));
  const level = Math.max(1, Number(playerLevel.value));
  let damage = attack * Math.sqrt(level);
  const beforeCrit = damage;
  if (critCheck.checked) damage *= 1.5;
  const afterMetal = applyMetalTier(metalTier.value, damage);
  const lowRoll = Math.round(afterMetal * 0.8);
  const highRoll = Math.round(afterMetal * 1.1);
  damageReadout.innerHTML = `
    <strong>${lowRoll} ~ ${highRoll}</strong> 예상 피해<br>
    기본 계산: ${attack} × √${level} = ${beforeCrit.toFixed(2)}<br>
    치명타: ${critCheck.checked ? '×1.5 적용' : '미적용'}<br>
    AIRa 금속 보정: ${metalTier.value}
  `;
}

[baseAttack, playerLevel, critCheck, metalTier].forEach((el) => el.addEventListener('input', updateDamage));
[critCheck, metalTier].forEach((el) => el.addEventListener('change', updateDamage));
updateDamage();

// Glitch clock
const clockDisplay = $('#clockDisplay');
const glitchButton = $('#glitchButton');
const restoreClock = $('#restoreClock');
let glitchTimer = null;

function renderClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  if (!clockDisplay.classList.contains('error')) clockDisplay.textContent = `${h}:${m}`;
}
setInterval(renderClock, 1000);
renderClock();

glitchButton.addEventListener('click', () => {
  clearTimeout(glitchTimer);
  const texts = ['ERROR', '00:00', 'NULL', 'TIME?'];
  clockDisplay.classList.add('error');
  clockDisplay.textContent = texts[Math.floor(Math.random() * texts.length)];
  glitchTimer = setTimeout(() => {
    clockDisplay.classList.remove('error');
    renderClock();
  }, 900);
});
restoreClock.addEventListener('click', () => {
  clearTimeout(glitchTimer);
  clockDisplay.classList.remove('error');
  renderClock();
});

// Monster filter
const chips = $$('.chip');
const monsterCards = $$('.monster-card');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const filter = chip.dataset.filter;
    monsterCards.forEach((card) => {
      const visible = filter === 'all' || card.dataset.kind === filter;
      card.classList.toggle('hidden', !visible);
    });
  });
});

// Small reveal polish
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.animate([
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 500, easing: 'ease-out', fill: 'both' });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

$$('.panel, .loop-card, .monster-card, .item-card').forEach((el) => observer.observe(el));
