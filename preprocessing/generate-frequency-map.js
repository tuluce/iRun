'use strict';

const fs = require('fs');

const generateFrequencyMap = () => {
  console.log('Reading frequency file...');
  const fileContent = fs.readFileSync('../data/unigram_freq.csv', 'utf8');
  const entries = fileContent.split('\n');

  console.log('Processing frequency entries...');
  const frequencyDict = {};
  entries.forEach((entry, i) => {
    if (i % 10000 === 0) {
      console.log(i, '/', entries.length);
    }
    const entryElements = entry.split(',');
    frequencyDict[entryElements[0]] = Number(entryElements[1]);
  });

  console.log('Writing frequencty map to file...');
  fs.writeFileSync('../data/frequency-map.json', JSON.stringify(frequencyDict));

  console.log('Done.');
};

module.exports = generateFrequencyMap;
