'use strict';

const fs = require('fs');

const { getAllHyphenations } = require('./hyphenate-all');
const { getProperHyphenation, isValidLetter, normalizeWord } = require('./hyphenate');

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
  const syllables = getProperHyphenation(word);
  const pronunciation = [];
  for (let i = 0; i < syllables.length; i++) {
    pronunciation.push(getSimpleSyllablePronunciation(syllables[i]));
  }
  return pronunciation;
};

const getUncoveredSyllableCount = pronunciation => {
  let uncoveredCount = 0;
  for (let i = 0; i < pronunciation.length; i++) {
    if (pronunciation[i].charAt(0) === pronunciation[i].charAt(0).toUpperCase()) {
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
  const alternatives = getFancyWordPronunciations(word);
  let bestAlternative = alternatives[0];
  let bestUncoveredCount = getUncoveredSyllableCount(bestAlternative);
  for (let i = 0; i < alternatives.length; i++) {
    const uncoveredCount = getUncoveredSyllableCount(alternatives[i]);
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

const getPronunciationAnalysis = text => {
  const pronunciationAnalysis = [];
  text.split(' ').forEach(word => {
    if (word.length === 0) {
      return;
    }
    const normalizedWord = normalizeWord(word);
    const wordPronunciations = [getWordPronunciations(normalizedWord), getWordPronunciations(normalizedWord)];
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
      return JSON.stringify({ display, details }); // TODO remove stringify
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


console.log(getPronunciation(`
Emin Bahadır, Tülü'ce tarafından
`, { analysis: true }));


module.exports = { getPronunciation };
