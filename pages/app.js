import React, { useState } from 'react';
import { Button, TextArea, AnchorButton } from '@blueprintjs/core';

import Pronunciation from './components/pronunciation';
import { getPronunciation } from '../pronunciation/pronounce';
import GithubIcon from './components/github-icon';

const exampleTexts = [
  'Merhaba dünya!',
  'Antik diyarlardan bir gezgine rastladım.',
  'Sabah reçel yemek istiyorum.',
  'İşletim sistemleri, veritabanları ve nesne yönelimli programlama',
  'Sıradaki sefer saat kaçta?',
  'İhsan Doğramacı Bilkent Üniversitesi',
  'Emin Bahadır Tülüce',
  'Türkiye Cumhuriyeti',
];

const App = () => {
  const [inputText, setInputText] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);

  const pronunciationAnalysis = getPronunciation(inputText, { analysis: true });

  const pronunciationComponents = pronunciationAnalysis
    .filter(wordAnalysis => wordAnalysis.pronunciations.length > 0)
    .map(
      (wordAnalysis, i) => {
        const key = JSON.stringify([wordAnalysis.pronounceable, i]);
        return (
          <span key={key}>
            <Pronunciation wordAnalysis={wordAnalysis} />
          </span>
        );
      },
    );

  const showNextExample = () => {
    const exampleText = exampleTexts[exampleIndex];
    setExampleIndex((exampleIndex + 1) % exampleTexts.length);
    setInputText(exampleText);
  };

  return (
    <div className='app'>
      <div className='justifier-container'>
        <h1>Pronounce TR</h1>
        <div>
          <div className='app-extra-buttons'>
            <Button
              icon='help'
              text='About'
            />
            &nbsp;
            <AnchorButton
              icon={<GithubIcon />}
              href='https://github.com/tuluce/pronounce-tr'
              target='_blank'
              rel='noreferrer'
            />
          </div>
        </div>
      </div>
      <div>
        <div>
          <p>Enter the Turkish phrase you want to pronounce.</p>
          <p>
            ( or check out some of the
            <Button
              className='examples-button'
              minimal
              small
              onClick={showNextExample}
              text={<i>examples</i>}
            />
            )
          </p>
        </div>
        <TextArea
          fill={true}
          growVertically={true}
          large={true}
          onChange={event => setInputText(event.target.value)}
          value={inputText}
          rows={5}
        />
        <br/><br/>
        {pronunciationComponents}
      </div>
    </div>
  );
};

export default App;
