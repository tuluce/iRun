import React, { useState } from 'react';
import { Button, TextArea, AnchorButton, Drawer } from '@blueprintjs/core';

import Pronunciation from './components/pronunciation';
import { getPronunciation } from '../pronunciation/pronounce';
import GithubIcon from './components/github-icon';

const exampleTexts = [
  'Merhaba dünya!',
  'Emin Bahadır Tülüce',
  'Antik diyarlardan bir gezgine rastladım.',
  'İhsan Doğramacı Bilkent Üniversitesi',
  'Sabah reçel yemek istiyorum.',
  'İşletim sistemleri, veritabanları ve nesne yönelimli programlama',
  'Sıradaki sefer saat kaçta?',
  'Hiç şüphesiz ki Antalya dünyanın en güzel yeridir.',
];

const App = () => {
  const [inputText, setInputText] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const getDrawerSize = () => {
    if (typeof window !== 'undefined') {
      return `${Math.min(window.innerWidth, 450)}px`;
    }
    return '450px';
  };

  return (
    <div className='app bp3-dark'>
      <h1>
        Pronounce TR&nbsp;
        <div className='meta-buttons-wrapper'>
          <Button
            className='meta-button'
            icon='help'
            onClick={() => setIsDrawerOpen(true)}
          />
          &nbsp;
          <AnchorButton
            className='meta-button'
            icon={<GithubIcon />}
            href='https://github.com/tuluce/pronounce-tr'
            target='_blank'
            rel='noreferrer'
          />
        </div>
      </h1>
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
        <br/><br/><br/>
        {pronunciationComponents}
      </div>
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        size={getDrawerSize()}
        icon='info-sign'
        title='About Pronounce TR'
      >
        <div className='drawer-content'>
          <h3>What?</h3>
          <p>
            An open-source web app to help with the pronunciation of Turkish words. To check
            out the source code or contribute, please visit the GitHub repository.
          </p>
          <h3>Why?</h3>
          <p>
            Unlike any other pronunciation dictionaries, Pronounce TR attempts to find
            English dictionary words which have close pronunciations to the target Turkish
            syllable. The goal is to make the prounciation easier to the people who are not
            familiar with Turkish.
          </p>
          <h3>How?</h3>
          <p>
            Pronounce TR uses the CMUdict (the Carnegie Mellon Pronouncing Dictionary) to
            find English matches to Turkish syllables. Dividing Turkish words into syllables
            is done in various ways. You can check out the documentation for the full explanation.
          </p>
          <br />
          <hr />
          <br />
          <i>Emin Bahadır Tülüce - 2020</i>
        </div>
      </Drawer>
    </div>
  );
};

export default App;
