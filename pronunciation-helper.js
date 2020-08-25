'use strict';

const fs = require('fs');

const { getAllHyphenations } = require('./hyphenate-all');
const { hyphenate, getLetterType } = require('./hyphenate');

console.log('Reading data...');
const phoneticMap = JSON.parse(fs.readFileSync('./data/phonetic-map.json'));
const phoneticMapExtra = JSON.parse(fs.readFileSync('./data/phonetic-map-extra.json'));
const reverseMap = JSON.parse(fs.readFileSync('./data/reverse-map.json'));
const frequencyMap = JSON.parse(fs.readFileSync('./data/frequency-map.json'));
const letterPronunciationMap = JSON.parse(fs.readFileSync('./data/letter-pronunciation-map.json'));
const syllablePronunciationMap = JSON.parse(fs.readFileSync('./data/syllable-pronunciation-map.json'));

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

const getPhonemeSets = syllable => syllable.split('').map(letter => phoneticMap[letter]);

const getExtraPhonemeSets = syllable => {
  const extraSyllableIndices = [];
  const extraSyllables = [];
  const extraSyllableList = Object.keys(phoneticMapExtra);
  for (let i = 0; i < syllable.length; i++) {
    for (let j = 0; j < extraSyllableList.length; j++) {
      const extraSyllable = extraSyllableList[j];
      if (syllable.substr(i, extraSyllable.length) === extraSyllable) {
        extraSyllableIndices.push(i);
        extraSyllables.push(extraSyllable);
        i += extraSyllable.length - 1;
      }
    }
  }
  const extraPhonemeSets = [];
  for (let i = 0; i < syllable.length; i++) {
    if (extraSyllableIndices.includes(i)) {
      const j = extraSyllableIndices.indexOf(i);
      const extraSyllable = extraSyllables[j];
      extraPhonemeSets.push(phoneticMapExtra[extraSyllable]);
      i += extraSyllable.length - 1;
    } else {
      const letter = syllable[i];
      extraPhonemeSets.push(phoneticMap[letter]);
    }
  }
  return extraPhonemeSets;
};

const getFancySyllablePronunciation = syllable => {
  if (syllablePronunciationMap[syllable]) {
    return syllablePronunciationMap[syllable];
  }
  const phonemeSets = getPhonemeSets(syllable);
  const extraPhonemeSets = getExtraPhonemeSets(syllable);
  const keys = [...getKeys(phonemeSets), ...getKeys(extraPhonemeSets)];
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
};

const syllablesToPronunciation = syllables => (
  syllables.map(syllable => getFancySyllablePronunciation(syllable))
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

const getSimpleSyllablePronunciation = syllable => {
  const preferredPronunciation = getFancySyllablePronunciation(syllable);
  if (preferredPronunciation !== preferredPronunciation.toUpperCase()) {
    return preferredPronunciation;
  }
  let result = syllable;
  for (let i = 0; i < syllable.length; i++) {
    result = result.replace(syllable[i], letterPronunciationMap[syllable[i]]);
  }
  return result;
};

const getSimpleWordPronunciation = word => {
  const syllables = hyphenate(word);
  const pronunciation = [];
  for (let i = 0; i < syllables.length; i++) {
    pronunciation.push(getSimpleSyllablePronunciation(syllables[i]));
  }
  return pronunciation;
};

const getWordPronunciation = word => {
  const getUncoveredCount = pronunciation => {
    let uncoveredCount = 0;
    for (let i = 0; i < pronunciation.length; i++) {
      if (pronunciation[i].charAt(0) === pronunciation[i].charAt(0).toUpperCase()) {
        uncoveredCount += 1;
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
    return getSimpleWordPronunciation(word);
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

console.log(getWordPronunciation('ağrı'));
console.log(getWordPronunciation('ağaç'));
console.log(getWordPronunciation('ereğli'));
console.log(getWordPronunciation('gözde'));
console.log(getWordPronunciation('bilgisayar'));
console.log(getWordPronunciation('çiğdem'));
console.log(getWordPronunciation('jilet'));
console.log(getWordPronunciation('antik'));
console.log(getWordPronunciation('o'));
console.log(getWordPronunciation('saat'));
console.log(getWordPronunciation('emin'));
console.log(getWordPronunciation('bahadır'));
console.log(getWordPronunciation('tülüce'));
console.log(getWordPronunciation('dakika'));
console.log(getWordPronunciation('tülüce'));
console.log();

console.log(getTextPronunciation(`
Aysel ayran içtin mi? Evet içtim. Ayran içmek istiyorsan iç. Hayır demin içtim.
Kaç bardak içtin? On bardak içtim. Vay hayvan vay!
`));

console.log(getTextPronunciation(`
Taş iletişim kurduğu diğer taşa karşılıklı olarak çevresini ve ona emredileni
görüntüler ile iletirdi. Bu özelliği sayesinde ülkeler arasındaki en hızlı
iletişimi sağladılar.
`));

console.log(getTextPronunciation(`
Emin Bahadır Tülüce tarafından
`));

console.log(getTextPronunciation(`
Gündemde ve sosyal medyada olup bitenlerden geride kalma!
İnternette anlamadığın, kaçırdığın bir şeye rastlarsan sor ve hemen cevap al.
Sorulan sorulara, eklenen olaylara veya gönderilere göz at.
`));
