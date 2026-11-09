'use strict';

const COLORS = ['ginger', 'gray', 'white'];
const STAT_LABELS = { satiety: 'Сытость', hydration: 'Утоление жажды', happiness: 'Счастье', energy: 'Энергия' };

function createPet(name, color) {
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 20) throw new Error('Имя должно содержать от 1 до 20 символов.');
  if (!COLORS.includes(color)) throw new Error('Выберите доступный окрас.');
  return { name: trimmed, color, satiety: 50, hydration: 50, happiness: 50, energy: 50 };
}

if (typeof document !== 'undefined') {
  let pet = null;
  const form = document.getElementById('createForm');
  const screen = document.getElementById('petScreen');
  const message = document.getElementById('message');

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

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      pet = createPet(document.getElementById('petName').value, document.getElementById('petColor').value);
      render();
      message.textContent = 'Питомец создан!';
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

if (typeof module !== 'undefined') module.exports = { createPet };
