const fs = require('fs');
const axios = require('axios');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const excludedWords = ['a', 'u'];

const maxRequestCount = 256;
const requestSleepDuration = 1;

const generateFilteredDict = async () => {
  console.log('Reading dictionary file...');
  const fileContent = fs.readFileSync('./data/cmudict.dict', 'utf8');
  const entries = fileContent.split('\n');

  console.log('Processing dictionary entries...');
  const filteredEntries = entries.map(() => null);
  let processedCount = 0;
  let currentRequestCount = 0;
  entries.forEach(async (entry, i) => {
    while (currentRequestCount > maxRequestCount) {
      await sleep(requestSleepDuration);
    }
    currentRequestCount++;
    const entryElements = entry.split(' ');
    const word = entryElements[0].replace('(2)', '').replace('(3)', '').replace('(4)', '');
    const url = `https://dictionary.cambridge.org/dictionary/english/${word}`;
    let status = null;
    while (status !== 200 && status !== 302) {
      try {
        const response = await axios.head(url, { maxRedirects: 0 });
        status = response.status;
      } catch (error) {
        if (error.response) {
          status = error.response.status;
        }
      }
    }
    if (status === 200 && !excludedWords.includes(word)) {
      filteredEntries[i] = entry;
    }
    processedCount++;
    currentRequestCount--;
  });

  while (processedCount < entries.length) {
    console.log(processedCount, '/', entries.length);
    await sleep(1000);
  }

  const filteredContent = filteredEntries.filter(entry => entry !== null).join('\n');

  console.log('Writing filtered dictionary to file...');
  fs.writeFileSync('./data/cmudict-filtered.dict', filteredContent);

  console.log('Done.');
};

module.exports = generateFilteredDict;
