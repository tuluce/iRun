const fs = require('fs');

const generateReverseMultiMap = () => {
  console.log('Reading filtered dictionary file...');
  const fileContent = fs.readFileSync('./data/cmudict-filtered.dict', 'utf8');
  const entries = fileContent.split('\n');

  console.log('Processing filtered dictionary entries...');
  const reverseDict = {};
  entries.forEach((entry, i) => {
    const entryElements = entry.split(' ');
    const word = entryElements[0];
    if (word.includes('(2)') || word.includes('(3)') || word.includes('(4)')) {
      return;
    }
    const phonemes = entryElements.slice(1);
    const key = phonemes.join(' ');
    const previousEntry = reverseDict[key];
    if (previousEntry) {
      previousEntry.push(word);
    } else {
      reverseDict[key] = [word];
    }
  });

  console.log('Writing reverse multimap to file...');
  fs.writeFileSync('./data/reverse-multimap.json', JSON.stringify(reverseDict));

  console.log('Done.');
};

module.exports = generateReverseMultiMap;
