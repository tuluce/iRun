'use strict';

const consonants = [
  'b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l',
  'm', 'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z',
];

const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];

const LetterType = { CONSONANT: 'consonant', VOWEL: 'vowel' };

const getLetterType = letter => {
  if (consonants.includes(letter)) {
    return LetterType.CONSONANT;
  }
  if (vowels.includes(letter)) {
    return LetterType.VOWEL;
  }
  return null;
};

const isValidLetter = letter => consonants.includes(letter) || vowels.includes(letter);

const normalizeWord = word => {
  const lowerCaseWord = word.toLocaleLowerCase('TR');
  return [...lowerCaseWord].filter(letter => isValidLetter(letter)).join('');
};

const getVowelCount = word => {
  const lowerCaseWord = word.toLocaleLowerCase('TR');
  return [...lowerCaseWord].filter(letter => getLetterType(letter) === LetterType.VOWEL).length;
};

const hyphenateRecursive = w => {
  for (let i = 0; i < w.length; i++) {
    if (getLetterType(w.charAt(i)) === LetterType.VOWEL) {

      if (w.length === i + 1) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 1)) === LetterType.VOWEL) {
        return [w.substr(0, i + 1), ...hyphenateRecursive(w.substr(i + 1))];
      }

      if (w.length === i + 2) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 2)) === LetterType.VOWEL) {
        return [w.substr(0, i + 1), ...hyphenateRecursive(w.substr(i + 1))];
      }

      if (w.length === i + 3) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 3)) === LetterType.VOWEL) {
        return [w.substr(0, i + 2), ...hyphenateRecursive(w.substr(i + 2))];
      }

      if (w.length === i + 4) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 4)) === LetterType.VOWEL) {
        if (w.charAt(i + 3) === 'r') {
          return [w.substr(0, i + 2), ...hyphenateRecursive(w.substr(i + 2))];
        } else {
          return [w.substr(0, i + 3), ...hyphenateRecursive(w.substr(i + 3))];
        }
      }

      if (w.length === i + 5) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 5)) === LetterType.VOWEL) {
        if (w.charAt(i + 3) === 'r') {
          return [w.substr(0, i + 4), ...hyphenateRecursive(w.substr(i + 4))];
        } else {
          return [w.substr(0, i + 3), ...hyphenateRecursive(w.substr(i + 3))];
        }
      }

      if (w.length === i + 6) {
        return [w];
      }
      if (getLetterType(w.charAt(i + 6)) === LetterType.VOWEL) {
        return [w.substr(0, i + 4), ...hyphenateRecursive(w.substr(i + 4))];
      }
    }
  }
  return [w];
};

const getProperHyphenation = word => {
  const normalizedWord = normalizeWord(word);
  const result = hyphenateRecursive(normalizedWord);
  if (!result || result.length === 0 || (result.length === 1 && result[0] === '')) {
    return [];
  }
  return result;
};

const displayTests = () => {
  console.log(getProperHyphenation('proaktifcilerim'));
  console.log(getProperHyphenation('aortçularım'));
  console.log(getProperHyphenation('paracılarım'));
  console.log(getProperHyphenation('tavacılarım'));
  console.log(getProperHyphenation('baklavacılarım'));
  console.log(getProperHyphenation('tavlacılarım'));
  console.log(getProperHyphenation('kamplaşmacılarım'));
  console.log(getProperHyphenation('kurtçukçularım'));
  console.log(getProperHyphenation('tabldotçularım'));
  console.log(getProperHyphenation('klostrofobicilerim'));
  console.log(getProperHyphenation('elektrikçilerim'));
  console.log(getProperHyphenation('elektronikçilerim'));
  console.log(getProperHyphenation('santralcilerim'));
  console.log(getProperHyphenation('hancılardansa'));
  console.log(getProperHyphenation('yeşilimtrak'));
  console.log(getProperHyphenation('prensleştirmekte'));
};

module.exports = {
  getProperHyphenation,
  getLetterType,
  LetterType,
  isValidLetter,
  normalizeWord,
  getVowelCount,
  displayTests,
};
