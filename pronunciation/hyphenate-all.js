'use strict';

const { LetterType, getLetterType, normalizeWord, getVowelCount } = require('./hyphenate');

const ConsonantPosition = { LEFT: 'left', RIGHT: 'right' };

const multiplyElements = arr => arr.reduce((a, b) => a * b, 1);

const tokenizeWord = word => {
  const tokens = [];
  let lastToken = word.charAt(0);
  for (let charIndex = 1; charIndex < word.length; charIndex++) {
    const currentChar = word.charAt(charIndex);
    if (getLetterType(currentChar) === getLetterType(lastToken.charAt(0)) &&
        getLetterType(currentChar) === LetterType.CONSONANT) {
      lastToken += currentChar;
    } else {
      tokens.push(lastToken);
      lastToken = currentChar;
    }
  }
  if (lastToken !== '') {
    tokens.push(lastToken);
  }
  return tokens;
};

const getCombinationCounts = tokens => {
  const combinationCounts = [];
  for (let tokenIndex = 1; tokenIndex < tokens.length - 1; tokenIndex++) {
    if (getLetterType(tokens[tokenIndex].charAt(0)) === LetterType.CONSONANT) {
      const combinationCount = (tokens[tokenIndex].length + 1);
      combinationCounts.push(combinationCount);
    }
  };
  return combinationCounts;
};

const getconfigurationIndexPairSets = (tokens, combinationCounts) => {
  const totalCombinationCount = multiplyElements(combinationCounts);
  const configurationIndexPairSets = [];
  for (let combinationIndex = 0; combinationIndex < totalCombinationCount; combinationIndex++) {
    const configurationIndexPairSet = [];
    let alternatingTokenIndex = 0;
    for (let tokenIndex = 1; tokenIndex < tokens.length - 1; tokenIndex++) {
      if (getLetterType(tokens[tokenIndex].charAt(0)) === LetterType.CONSONANT) {
        const mult = multiplyElements(combinationCounts.slice(0, alternatingTokenIndex));
        const term1 = Math.floor(combinationIndex / mult);
        const term2 = combinationCounts[alternatingTokenIndex];
        const configuartionIndex = term1 % term2;
        const configurationIndexPair = [configuartionIndex, combinationCounts[alternatingTokenIndex]];
        configurationIndexPairSet.push(configurationIndexPair);
        alternatingTokenIndex++;
      }
    }
    configurationIndexPairSets.push(configurationIndexPairSet);
  }
  return configurationIndexPairSets;
};

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

const getAllHyphenations = word => {
  const normalizedWord = normalizeWord(word);
  if (normalizedWord.length === 0) {
    return [];
  }
  if (getVowelCount(normalizedWord) === 0 || getVowelCount(normalizedWord) === 1) {
    return [[normalizedWord]];
  }
  const tokens = tokenizeWord(normalizedWord);
  const combinationCounts = getCombinationCounts(tokens);
  const totalCombinationCount = multiplyElements(combinationCounts);
  const configurationIndexPairSets = getconfigurationIndexPairSets(tokens, combinationCounts);
  const hyphenations = [];
  for (let combinationIndex = 0; combinationIndex < totalCombinationCount; combinationIndex++) {
    const configurationIndexPairSet = configurationIndexPairSets[combinationIndex];
    const tokenConfigurations = configurationIndexPairSet.map(
      configurationIndexPair => getConfiguration(configurationIndexPair[0], configurationIndexPair[1]),
    );
    const hyphenation = getHyphenation(tokens, tokenConfigurations);
    hyphenations.push(hyphenation);
  }
  return hyphenations;
};

const displayTests = () => {
  console.log(getAllHyphenations('babbababbbab'));
  console.log(getAllHyphenations('bahadır'));
  console.log(getAllHyphenations('santral'));
  console.log(getAllHyphenations('prenses'));
  console.log(getAllHyphenations('arapçı'));
  console.log(getAllHyphenations('aabcdeighu'));
};

module.exports = {
  getAllHyphenations,
  displayTests,
};
