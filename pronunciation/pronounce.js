'use strict';

const fs = require('fs');

const { getAllHyphenations } = require('./hyphenate-all');
const { getProperHyphenation, normalizeWord } = require('./hyphenate');

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

const getExtendedPhonemeSet = phonemeSet => {
  const extendedPhonemeSet = [];
  phonemeSet.forEach(phoneme => {
    extendedPhonemeSet.push(...getAlternativePhonemes(phoneme));
  });
  return extendedPhonemeSet;
};

const getKeys = phonemeSets => {
  const extendedPhonemeSets = [];
  phonemeSets.forEach(phonemeSet => {
    const extendedPhonemeSet = getExtendedPhonemeSet(phonemeSet);
    extendedPhonemeSets.push(extendedPhonemeSet);
  });

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
    return {
      word: syllablePronunciationMap[syllable],
      source: 'syllable-translation',
    };
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
      return {
        word: alternatives[0],
        source: 'dictionary',
      };
    }
  }
  return getSimpleSyllablePronunciation(syllable);
};

const getSimpleSyllablePronunciation = syllable => {
  let simpleSyllablePronunciation = syllable;
  for (let i = 0; i < syllable.length; i++) {
    simpleSyllablePronunciation = simpleSyllablePronunciation.replace(
      syllable[i],
      letterPronunciationMap[syllable[i]],
    );
  }
  return {
    word: simpleSyllablePronunciation,
    source: 'letter-translation',
  };
};

const getSimpleWordPronunciation = word => {
  const syllables = getProperHyphenation(word);
  const pronunciation = [];
  for (let i = 0; i < syllables.length; i++) {
    pronunciation.push(getFancySyllablePronunciation(syllables[i]));
  }
  return pronunciation;
};

const getUncoveredSyllableCount = pronunciation => {
  let uncoveredCount = 0;
  for (let i = 0; i < pronunciation.length; i++) {
    if (pronunciation[i].source !== 'dictionary') {
      uncoveredCount += 1;
    }
  }
  return uncoveredCount;
};

const getFancyWordPronunciations = word => {
  const syllableGroups = getAllHyphenations(word);
  const wordPronunciations = [];
  for (let i = 0; i < syllableGroups.length; i++) {
    const syllables = syllableGroups[i];
    const pronunciation = syllables.map(syllable => getFancySyllablePronunciation(syllable));
    wordPronunciations.push(pronunciation);
  }
  return wordPronunciations;
};

const getWordPronunciations = word => {
  const wordPronunciations = getFancyWordPronunciations(word);
  wordPronunciations.sort((a, b) => getUncoveredSyllableCount(a) - getUncoveredSyllableCount(b));
  const bestUnceverdSyllableCount = getUncoveredSyllableCount(wordPronunciations[0]);
  if (bestUnceverdSyllableCount > 0) {
    const simpleWordPronunciation = getSimpleWordPronunciation(word);
    wordPronunciations.unshift(simpleWordPronunciation);
  }
  return wordPronunciations;
};

const getPronunciationAnalysis = text => {
  const pronunciationAnalysis = [];
  text.split(' ').forEach(word => {
    if (word.length === 0) {
      return;
    }
    const normalizedWord = normalizeWord(word);
    const wordPronunciations = getWordPronunciations(normalizedWord);
    const wordAnalysis = {};
    wordAnalysis.original = word;
    wordAnalysis.pronouncable = normalizedWord;
    wordAnalysis.pronunciations = wordPronunciations.map(wordPronunciation => {
      const display = wordPronunciation.join('-');
      const details = {};
      wordPronunciation.forEach(pronunciationPart => {
        details[pronunciationPart] = {
          phonemes: 'PHONEME LIST HERE',
          source: 'dictionary OR syllable-translation OR letter-translation HERE',
        };
      });
      return { display, details };
    });
    pronunciationAnalysis.push(wordAnalysis);
  });
  return pronunciationAnalysis;
};

const getPronunciation = (text, { analysis }) => {
  const pronunciationAnalysis = getPronunciationAnalysis(text);
  if (!analysis) {
    return pronunciationAnalysis.map(pronunciation => pronunciation);
  }
  return pronunciationAnalysis;
};

console.dir(getPronunciation(`
Emin Bahadır, Tülü'ce tarafından
`, { analysis: true }), { depth: null });


module.exports = { getPronunciation };
