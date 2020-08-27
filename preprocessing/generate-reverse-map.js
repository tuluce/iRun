const fs = require('fs');

const generateReverseMap = () => {
  console.log('Reading multimap file...');
  const reverseMultimapFileContent = fs.readFileSync('./data/reverse-multimap.json', 'utf8');
  const reverseMultimap = JSON.parse(reverseMultimapFileContent);

  console.log('Reading frequency map file...');
  const frequencyMapFileContent = fs.readFileSync('./data/frequency-map.json', 'utf8');
  const frequencyMap = JSON.parse(frequencyMapFileContent);

  console.log('Processing multimap entries...');
  const reverseMap = {};
  Object.keys(reverseMultimap).forEach(key => {
    const alternatives = reverseMultimap[key];
    const getFrequency = word => frequencyMap[word] || 0;
    alternatives.sort((a, b) => getFrequency(b) - getFrequency(a));
    reverseMap[key] = alternatives[0];
  });

  console.log('Writing reverse map to file...');
  fs.writeFileSync('./data/reverse-map.json', JSON.stringify(reverseMap));

  console.log('Done.');
};

module.exports = generateReverseMap;
