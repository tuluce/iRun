'use strict';

const consonants = [
  'b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l',
  'm', 'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z',
];

const vowels = ['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü'];

const LetterType = {
  CONSONANT: 'CONSONANT',
  VOWEL: 'VOWEL',
};

const getLetterType = letter => {
  if (consonants.includes(letter)) {
    return LetterType.CONSONANT;
  }
  if (vowels.includes(letter)) {
    return LetterType.VOWEL;
  }
  return null;
};

const normalizeWord = word => {
  const lowerCaseWord = word.toLocaleLowerCase('TR');
  const normalizedLetters = [];
  for (let i = 0; i < lowerCaseWord.length; i++) {
    const letter = lowerCaseWord[i];
    if (getLetterType(letter)) {
      normalizedLetters.push(letter);
    }
  }
  return normalizedLetters.join('');
};

const getVowelCount = word => {
  const lowerCaseWord = word.toLocaleLowerCase('TR');
  let vowelCount = 0;
  for (let i = 0; i < lowerCaseWord.length; i++) {
    if (getLetterType(lowerCaseWord[i]) === LetterType.VOWEL) {
      vowelCount++;
    }
  }
  return vowelCount;
};

const hyphenateRecursive = word => {
  const w = normalizeWord(word);
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

const hyphenate = word => {
  const result = hyphenateRecursive(word);
  if (!result || result.length === 0 || (result.length === 1 && result[0] === '')) {
    return [];
  }
  return result;
};

const test = () => {
  console.log(hyphenate('proaktifcilerim'));
  console.log(hyphenate('aortçularım'));
  console.log(hyphenate('paracılarım'));
  console.log(hyphenate('tavacılarım'));
  console.log(hyphenate('baklavacılarım'));
  console.log(hyphenate('tavlacılarım'));
  console.log(hyphenate('kamplaşmacılarım'));
  console.log(hyphenate('kurtçukçularım'));
  console.log(hyphenate('tabldotçularım'));
  console.log(hyphenate('klostrofobicilerim'));
  console.log(hyphenate('elektrikçilerim'));
  console.log(hyphenate('elektronikçilerim'));
  console.log(hyphenate('santralcilerim'));
  console.log(hyphenate('hancılardansa'));
  console.log(hyphenate('yeşilimtrak'));
  console.log(hyphenate('prensleştirmekte'));
};

module.exports = {
  test,
  hyphenate,
  LetterType,
  getLetterType,
  normalizeWord,
  getVowelCount,
};
