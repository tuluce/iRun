# iRun

<img src='./public/irun-small.png' alt='irun logo' align='right' />

A web app to help with the pronunciation of Turkish words and phrases

[irun.netlify.app](https://irun.netlify.app)

[![Netlify Status](https://api.netlify.com/api/v1/badges/9aa60e1d-b436-4837-9651-616e973b6655/deploy-status)](https://irun.netlify.app) 

## Scripts
- Install dependencies : `yarn install`
- Lint source code : `yarn lint`
- Preprocess data : `yarn preprocess`
- Start development server : `yarn dev`
- Build and generate the app page to the `/out` directory : `yarn export`
- Serve the generated page in the `/out` directory : `yarn serve`

## How does it work?
### Preprocessing steps - `/preprocessing`
1. The words which do not exist in the standard English dictionary are filtered from CMUdict. [`generate-filtered-dict.js`](./preprocessing/generate-filtered-dict.js)
2. From the filtered CMUdict entries, a reverse mapping (from one pronunciation to possibly multiple words) is generated. [`generate-reverse-multimap.js`](./preprocessing/generate-reverse-multimap.js)
3. The raw English word frequency data file is parsed. [`generate-frequency-map.js`](./preprocessing/generate-frequency-map.js)
4. The words with the same pronunciation but lower usage frequency are eliminated from the reverse mapping. [`generate-reverse-map.js`](./preprocessing/generate-reverse-map.js)

### Pronunciation algorithm - `/pronunciation`
1. All possible syllable combinations are generated from the input Turkish word. [`hyphenate-all.js`](./pronunciation/hyphenate-all.js)
2. The letters in the syllables are written using the alternatives in CMUdict phonetic alphabet. [`phonetic-map.json`](./data/phonetic-map.json)
3. The result is searched in the reverse mapping file. [`reverse-map.json`](./data/reverse-map.json)
4. If no match is found for a syllable, simple translations are applied to each letter. [`letter-pronunciation-map.json`](./data/letter-pronunciation-map.json)
5. The results are sorted prioritizing:
    - the ones with the most English word matches
    - the one which fits the [Turkish natural hyphenation](http://tdk.gov.tr/icerik/yazim-kurallari/hece-yapisi-ve-satir-sonunda-kelimelerin-bolunmesi/)
6. The first 10 of the best results are returned.

#### Example input: `bahadır`
- (1). `['bah', 'ad', 'ır'], ['ba', 'had', 'ır'], ['bah', 'a', 'dır'], ['ba', 'ha', 'dır']`
- (2). `[[['B', 'AA', 'HH'], ['AA', 'D'], ['AH0', 'R']], ... (all combinations) ... ]`
- (3, 4). `['baah-odd-er', 'bah-hud-er', 'baah-uh-derr', 'bah-huh-derr']`
- (5). `['bah-hud-er', 'bah-huh-derr', 'baah-odd-er', 'baah-uh-derr']`

### User interface - `/app`
1. Consists of a single Next.js statically-generated page with no back-end.
2. The reverse mapping file is loaded to the client app, so the algorithm runs on the browser.

## References
- Pronunciation dictionary data source: [Carnegie Mellon Pronouncing Dictionary](https://github.com/cmusphinx/cmudict)
- Word frequency data source: [English Word Frequency dataset on Kaggle](https://www.kaggle.com/rtatman/english-word-frequency)
- Text-to-speech API: [Voice RSS](http://www.voicerss.org)
- Icons: [Freepik on Flaticons](https://www.flaticon.com/authors/freepik)
- NPM packages: [Next.js](https://nextjs.org), [React](https://reactjs.org), [Blueprint](https://blueprintjs.com/)

