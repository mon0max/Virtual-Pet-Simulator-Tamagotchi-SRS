'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPet, careForPet, isValidPet } = require('../script.js');

test('creation validates names and color and sets initial values', () => {
  for (const name of ['', '   ', 'x'.repeat(21)]) assert.throws(() => createPet(name, 'gray'));
  assert.throws(() => createPet('Кот', 'invalid'));
  assert.equal(createPet('x'.repeat(20), 'white').name.length, 20);
  assert.deepEqual(createPet(' Мурка ', 'ginger'), {name:'Мурка',color:'ginger',satiety:50,hydration:50,happiness:50,energy:50});
});

test('feeding and watering add 20, clamp at 100 and report fullness', () => {
  const pet = createPet('Кот', 'gray');
  careForPet(pet, 'feed');
  careForPet(pet, 'water');
  assert.equal(pet.satiety, 70);
  assert.equal(pet.hydration, 70);
  pet.satiety = pet.hydration = 95;
  careForPet(pet, 'feed');
  careForPet(pet, 'water');
  assert.equal(pet.satiety, 100);
  assert.equal(pet.hydration, 100);
  assert.match(careForPet(pet, 'feed'), /сыт/);
  assert.match(careForPet(pet, 'water'), /не хочет пить/);
});

test('playing adds 15 happiness, costs 10 energy and rejects low energy', () => {
  const pet = createPet('Кот', 'white');
  careForPet(pet, 'play');
  assert.equal(pet.happiness, 65);
  assert.equal(pet.energy, 40);
  pet.happiness = 95;
  pet.energy = 10;
  careForPet(pet, 'play');
  assert.equal(pet.happiness, 100);
  assert.equal(pet.energy, 0);
  pet.energy = 9;
  const before = structuredClone(pet);
  assert.match(careForPet(pet, 'play'), /Недостаточно энергии/);
  assert.deepEqual(pet, before);
});

test('saved data accepts a round trip and rejects corrupted values', () => {
  const pet = createPet('Кот', 'gray');
  assert.ok(isValidPet(JSON.parse(JSON.stringify(pet))));
  for (const value of [-1, 101, null, '50']) assert.ok(!isValidPet({...pet,energy:value}));
  assert.ok(!isValidPet({}));
  assert.ok(!isValidPet({...pet,color:'invalid'}));
});
