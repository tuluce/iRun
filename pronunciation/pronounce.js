import { getAllHyphenations } from './hyphenate-all';
import { getProperHyphenation, getVowelCount, normalizeWord } from './hyphenate';

import phoneticMap from '../data/phonetic-map.json';
import phoneticMapExtra from '../data/phonetic-map-extra.json';
import reverseMap from '../data/reverse-map.json';
import letterPronunciationMap from '../data/letter-pronunciation-map.json';
import syllablePronunciationMap from '../data/syllable-pronunciation-map.json';

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
      source: 'syllable-translation',
      word: syllablePronunciationMap[syllable],
      explanation: {
        from: syllable,
        to: syllablePronunciationMap[syllable],
      },
    };
  }
  const phonemeSets = getPhonemeSets(syllable);
  const extraPhonemeSets = getExtraPhonemeSets(syllable);
  const keys = [...getKeys(phonemeSets), ...getKeys(extraPhonemeSets)];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (reverseMap[key]) {
      const word = reverseMap[key];
      return {
        word: word,
        source: 'dictionary',
        explanation: {
          from: word,
          to: key,
        },
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
    explanation: {
      from: syllable,
      to: simpleSyllablePronunciation,
    },
  };
};

const getProperWordPronunciation = word => {
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
  if (getVowelCount(word) > 10) {
    return [[{
      word: word,
      source: 'too-much-vowels',
      explanation: { from: word, to: word },
    }]];
  }
  const wordPronunciations = getFancyWordPronunciations(word);
  if (wordPronunciations.length === 0) {
    return wordPronunciations;
  }
  const properWordPronunciation = getProperWordPronunciation(word);
  if (wordPronunciations.filter(wp => JSON.stringify(wp) === JSON.stringify(properWordPronunciation)).length === 0) {
    wordPronunciations.push(properWordPronunciation);
  }
  wordPronunciations.sort((a, b) => {
    let diffScore = getUncoveredSyllableCount(a) - getUncoveredSyllableCount(b);
    if (diffScore === 0) {
      if (JSON.stringify(properWordPronunciation) === JSON.stringify(a)) {
        return -1;
      } else if (JSON.stringify(properWordPronunciation) === JSON.stringify(b)) {
        return +1;
      }
    }
    return diffScore;
  });
  return wordPronunciations;
};

const getPronunciationAnalysis = text => {
  const pronunciationAnalysis = [];
  text.split(/[\s,.-]/).forEach(word => {
    if (word.length === 0) {
      return;
    }
    const normalizedWord = normalizeWord(word);
    const wordPronunciations = getWordPronunciations(normalizedWord);
    const wordAnalysis = {};
    wordAnalysis.original = word;
    wordAnalysis.pronounceable = normalizedWord;
    wordAnalysis.pronunciations = wordPronunciations.map(wordPronunciation => {
      const display = wordPronunciation.map(wordPronunciation => wordPronunciation.word).join('-');
      const words = wordPronunciation.map(wordPronunciation => wordPronunciation.word);
      const details = {};
      wordPronunciation.forEach(pronunciationPart => {
        details[pronunciationPart.word] = {
          source: pronunciationPart.source,
          explanation: pronunciationPart.explanation,
        };
      });
      return { display, words, details };
    });
    pronunciationAnalysis.push(wordAnalysis);
  });
  return pronunciationAnalysis;
};

const getPronunciation = (text, options) => {
  const analysis = options && options.analysis;
  const pronunciationAnalysis = getPronunciationAnalysis(text);
  if (!analysis) {
    return pronunciationAnalysis
      .map(wordAnalysis => {
        if (wordAnalysis.pronunciations && wordAnalysis.pronunciations[0]) {
          return wordAnalysis.pronunciations[0].display;
        }
        return null;
      })
      .filter(pronunciationDisplay => pronunciationDisplay !== null);
  }
  return pronunciationAnalysis;
};

module.exports = { getPronunciation };
