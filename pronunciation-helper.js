'use strict';

const fs = require('fs');

const { getAllHyphenations } = require('./hyphenate-all');
const { hyphenate, getLetterType } = require('./hyphenate');

console.log('Reading data...');
const phoneticMap = JSON.parse(fs.readFileSync('./data/phonetic-map.json'));
const reverseMap = JSON.parse(fs.readFileSync('./data/reverse-map.json'));
const frequencyMap = JSON.parse(fs.readFileSync('./data/frequency-map.json'));
const simplePronunciationMap = JSON.parse(fs.readFileSync('./data/simple-pronunciation-map.json'));

const getAlternativePhonemes = phoneme => {
  const isStressFreeVowel = phoneme => RegExp('^[AEIOU][A-Z]$').test(phoneme);
  if (isStressFreeVowel(phoneme)) {
    return [`${phoneme}0`, `${phoneme}1`, `${phoneme}2`];
  }
  return [phoneme];
};

const getKeys = phonemeSets => {
  const extendedPhonemeSets = [];
  for (let i = 0; i < phonemeSets.length; i++) {
    const phonemeSet = phonemeSets[i];
    const extendedPhonemeSet = [];
    for (let j = 0; j < phonemeSet.length; j++) {
      const phoneme = phonemeSet[j];
      extendedPhonemeSet.push(...getAlternativePhonemes(phoneme));
    }
    extendedPhonemeSets.push(extendedPhonemeSet);
  }
  let keys = [...extendedPhonemeSets[0]];
  for (let i = 1; i < extendedPhonemeSets.length; i++) {
    const phonemeSet = extendedPhonemeSets[i];
    const initialKeysLength = keys.length;
    for (let j = 0; j < initialKeysLength; j++) {
      const previousKey = keys[j];
      for (let k = 0; k < phonemeSet.length; k++) {
        const phoneme = phonemeSet[k];
        const newKey = phoneme === '' ? previousKey : `${previousKey} ${phoneme}`;
        keys.push(newKey);
      }
    }
    keys = keys.slice(initialKeysLength);
  }
  return keys;
};

const syllablesToPronunciation = syllables => (
  syllables.map(syllable => {
    const phonemeSets = syllable.split('').map(letter => phoneticMap[letter]);
    const keys = getKeys(phonemeSets);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (reverseMap[key]) {
        const alternatives = reverseMap[key].slice();
        const getFrequency = word => frequencyMap[word] || 0;
        alternatives.sort((a, b) => getFrequency(b) - getFrequency(a));
        return alternatives[0];
      }
    }
    return syllable.toLocaleUpperCase('TR');
  })
);

const getWordPronunciations = word => {
  const syllableGroups = getAllHyphenations(word);
  const wordPronunciations = [];
  for (let i = 0; i < syllableGroups.length; i++) {
    const syllables = syllableGroups[i];
    const pronunciation = syllablesToPronunciation(syllables);
    wordPronunciations.push(pronunciation);
  }
  return wordPronunciations;
};

const getPaleSyllablePronunciation = syllable => {
  let result = syllable;
  for (let i = 0; i < syllable.length; i++) {
    result = result.replace(syllable[i], simplePronunciationMap[syllable[i]]);
  }
  return result;
};

const getPaleWordPronunciation = word => {
  const syllables = hyphenate(word);
  const pronunciation = [];
  for (let i = 0; i < syllables.length; i++) {
    pronunciation.push(getPaleSyllablePronunciation(syllables[i]));
  }
  return pronunciation;
};

const getWordPronunciation = word => {
  const getUncoveredCount = pronunciation => {
    let uncoveredCount = 0;
    for (let i = 0; i < pronunciation.length; i++) {
      if (pronunciation[i].charAt(0) === pronunciation[i].charAt(0).toUpperCase()) {
        uncoveredCount += pronunciation[i].length;
      }
    }
    return uncoveredCount;
  };
  const alternatives = getWordPronunciations(word);
  let bestAlternative = alternatives[0];
  let bestUncoveredCount = getUncoveredCount(bestAlternative);
  for (let i = 0; i < alternatives.length; i++) {
    const uncoveredCount = getUncoveredCount(alternatives[i]);
    if (bestUncoveredCount > uncoveredCount) {
      bestUncoveredCount = uncoveredCount;
      bestAlternative = alternatives[i];
    }
  }
  if (bestUncoveredCount > 0) {
    return getPaleWordPronunciation(word);
  }
  return bestAlternative;
};

const getTextPronunciation = text => {
  text = text.toLocaleLowerCase('TR');
  let word = '';
  let textPronunciation = '';
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    if (getLetterType(char)) {
      word += char;
    } else {
      if (word) {
        textPronunciation += getWordPronunciation(word).join('-');
      }
      textPronunciation += char;
      word = '';
    }
  }
  return textPronunciation;
};

console.log(getWordPronunciation('aysel'));
console.log(getWordPronunciation('ayran'));
console.log(getWordPronunciation('içtin'));
console.log(getWordPronunciation('mi'));
console.log(getWordPronunciation('kaç'));
console.log(getWordPronunciation('bardak'));
console.log(getWordPronunciation('ağrı'));
console.log(getWordPronunciation('ağaç'));
console.log(getWordPronunciation('ereğli'));
console.log(getWordPronunciation('gözde'));
console.log(getWordPronunciation('bilgisayar'));
console.log(getWordPronunciation('jilet'));
console.log(getWordPronunciation('antik'));
console.log(getWordPronunciation('o'));
console.log(getWordPronunciation('saat'));
console.log();

const text = (`
Aysel ayran içtin mi? Evet içtim. Ayran içmek istiyorsan iç. Hayır demin içtim.
Kaç bardak içtin? On bardak içtim. Vay hayvan vay!
`);
console.log(getTextPronunciation(text));
