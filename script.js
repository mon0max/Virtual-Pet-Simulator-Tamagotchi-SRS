'use strict';

const COLORS = ['ginger', 'gray', 'white'];
const STAT_LABELS = { satiety: 'Сытость', hydration: 'Утоление жажды', happiness: 'Счастье', energy: 'Энергия' };

function createPet(name, color) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 20) throw new Error('Имя должно содержать от 1 до 20 символов.');
  if (!COLORS.includes(color)) throw new Error('Выберите доступный окрас.');
  return { name: trimmed, color, satiety: 50, hydration: 50, happiness: 50, energy: 50 };
}

function careForPet(pet, action) {
  const key = action === 'feed' ? 'satiety' : action === 'water' ? 'hydration' : null;
  if (!key) throw new Error('Неизвестное действие.');
  if (pet[key] >= 100) return action === 'feed' ? 'Питомец уже сыт.' : 'Питомец не хочет пить.';
  pet[key] = Math.min(100, pet[key] + 20);
  return action === 'feed' ? 'Питомец поел.' : 'Питомец попил.';
}

function isValidPet(value) {
  return value && typeof value.name === 'string' && value.name === value.name.trim()
    && value.name.length >= 1 && value.name.length <= 20 && COLORS.includes(value.color)
    && Object.keys(STAT_LABELS).every(key => Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 100);
}

if (typeof document !== 'undefined') {
  let pet = null;
  const form = document.getElementById('createForm');
  const screen = document.getElementById('petScreen');
  const message = document.getElementById('message');

  const storageKey = 'tamagotchi.pet.v1';

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(pet));
      return '';
    } catch {
      return ' Не удалось сохранить прогресс: проверьте доступ к хранилищу браузера.';
    }
  }

  function render() {
    form.hidden = true;
    screen.hidden = false;
    document.getElementById('petTitle').textContent = pet.name;
    document.getElementById('pet').className = `pet ${pet.color}`;
    const stats = document.getElementById('stats');
    stats.replaceChildren();
    for (const [key, label] of Object.entries(STAT_LABELS)) {
      const row = document.createElement('div');
      row.className = 'stat';
      const caption = document.createElement('label');
      caption.htmlFor = key;
      caption.textContent = `${label}: ${pet[key]}%`;
      const bar = document.createElement('progress');
      bar.id = key;
      bar.max = 100;
      bar.value = pet[key];
      row.append(caption, bar);
      stats.append(row);
    }
  }

  for (const [action, label] of [['feed', 'Покормить'], ['water', 'Напоить']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      const result = careForPet(pet, action);
      const warning = save();
      render();
      message.textContent = result + warning;
    });
    document.getElementById('actions').append(button);
  }

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const restored = JSON.parse(saved);
      if (!isValidPet(restored)) throw new Error('Invalid saved pet');
      pet = restored;
      render();
      message.textContent = 'Прогресс загружен.';
    }
  } catch {
    message.textContent = 'Сохранение недоступно или повреждено. Можно создать нового питомца.';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      pet = createPet(document.getElementById('petName').value, document.getElementById('petColor').value);
      render();
      message.textContent = 'Питомец создан!' + save();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

if (typeof module !== 'undefined') module.exports = { createPet, careForPet, isValidPet };
