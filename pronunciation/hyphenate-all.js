'use strict';

const { LetterType, getLetterType, normalizeWord, getVowelCount } = require('./hyphenate');

const ConsonantPosition = { LEFT: 'left', RIGHT: 'right' };

const tokenizeWord = word => {
  const w = normalizeWord(word);
  const tokens = [];
  let lastToken = w.charAt(0);
  for (let i = 1; i < w.length; i++) {
    if (getLetterType(w.charAt(i)) === getLetterType(lastToken.charAt(0)) &&
        getLetterType(w.charAt(i)) === LetterType.CONSONANT) {
      lastToken += w.charAt(i);
    } else {
      tokens.push(lastToken);
      lastToken = w.charAt(i);
    }
  }
  if (lastToken !== '') {
    tokens.push(lastToken);
  }
  return tokens;
};

const getAllHyphenations = word => {
  if (getVowelCount(word) === 0) {
    return [];
  }
  if (word.includes('\'') &&
      getVowelCount(word.substr(0, word.indexOf('\''))) === 0) {
    return [];
  }
  if (getVowelCount(word) === 1) {
    return [[word]];
  }
  const tokens = tokenizeWord(word);
  let totalCombinationCount = 1;
  const combinationCounts = [];
  for (let i = 1; i < tokens.length - 1; i++) {
    if (getLetterType(tokens[i].charAt(0)) === LetterType.CONSONANT) {
      const combinationCount = (tokens[i].length + 1);
      combinationCounts.push(combinationCount);
      totalCombinationCount *= combinationCount;
    }
  };

  const configurationIndexSets = [];
  for (let combinationIndex = 0; combinationIndex < totalCombinationCount; combinationIndex++) {
    const configurationIndexSet = [];
    let alternatingTokenIndex = 0;
    for (let i = 1; i < tokens.length - 1; i++) {
      if (getLetterType(tokens[i].charAt(0)) === LetterType.CONSONANT) {
        const mult = arr => arr.reduce((a, b) => a * b, 1);
        const term1 = (Math.floor(combinationIndex / mult(combinationCounts.slice(0, alternatingTokenIndex))));
        const term2 = combinationCounts[alternatingTokenIndex];
        const configuartionIndex = term1 % term2;
        configurationIndexSet.push([configuartionIndex, combinationCounts[alternatingTokenIndex]]);
        alternatingTokenIndex++;
      }
    }
    configurationIndexSets.push(configurationIndexSet);
  }

  const getConfiguration = (configurationIndex, configurationCount) => {
    const configuration = [];
    for (let i = 0; i < configurationCount - 1; i++) {
      if (i < configurationIndex) {
        configuration.push(ConsonantPosition.LEFT);
      } else {
        configuration.push(ConsonantPosition.RIGHT);
      }
    }
    return configuration;
  };

  const getHyphenation = (tokens, tokenConfigurations) => {
    let alternatingTokenIndex = 0;
    const hyphenation = [];
    if (getLetterType(tokens[0].charAt(0)) === LetterType.VOWEL) {
      hyphenation.push(tokens[0]);
    }
    let rightConsonantBuffer = '';
    for (let i = 1; i < tokens.length - 1; i++) {
      if (getLetterType(tokens[i].charAt(0)) === LetterType.VOWEL) {
        hyphenation.push(rightConsonantBuffer + tokens[i]);
        rightConsonantBuffer = '';
      } else if (getLetterType(tokens[i].charAt(0)) === LetterType.CONSONANT) {
        const tokenConfiguration = tokenConfigurations[alternatingTokenIndex];
        for (let j = 0; j < tokens[i].length; j++) {
          const consonant = tokens[i][j];
          const position = tokenConfiguration[j];
          if (position === ConsonantPosition.LEFT) {
            hyphenation[hyphenation.length - 1] = hyphenation[hyphenation.length - 1] + consonant;
          } else if (position === ConsonantPosition.RIGHT) {
            rightConsonantBuffer += consonant;
          }
        }
        alternatingTokenIndex++;
      }
    }
    if (getLetterType(tokens[tokens.length - 1].charAt(0)) === LetterType.VOWEL) {
      hyphenation.push(rightConsonantBuffer + tokens[tokens.length - 1]);
    }
    if (getLetterType(tokens[0].charAt(0)) === LetterType.CONSONANT) {
      hyphenation[0] =
        tokens[0] + hyphenation[0];
    }
    if (getLetterType(tokens[tokens.length - 1].charAt(0)) === LetterType.CONSONANT) {
      hyphenation[hyphenation.length - 1] =
        hyphenation[hyphenation.length - 1] + tokens[tokens.length - 1];
    }
    return hyphenation;
  };

  const hyphenations = [];
  for (let combinationIndex = 0; combinationIndex < totalCombinationCount; combinationIndex++) {
    const configurationIndexSet = configurationIndexSets[combinationIndex];
    const tokenConfigurations = configurationIndexSet.map(
      configurationIndexPair => getConfiguration(configurationIndexPair[0], configurationIndexPair[1]),
    );
    const hyphenation = getHyphenation(tokens, tokenConfigurations);
    hyphenations.push(hyphenation);
  }
  return hyphenations;
};

const test = () => {
  console.log(getAllHyphenations('babbababbbab'));
  console.log(getAllHyphenations('bahadır'));
  console.log(getAllHyphenations('santral'));
  console.log(getAllHyphenations('prenses'));
  console.log(getAllHyphenations('arabcı'));
  console.log(getAllHyphenations('aabrsealye'));
};

module.exports = {
  test,
  getAllHyphenations,
};
