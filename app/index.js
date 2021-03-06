import React, { useEffect, useState } from 'react';
import { Button, TextArea, AnchorButton, Toaster, Intent } from '@blueprintjs/core';

import Pronunciation from './components/pronunciation';
import { getPronunciation } from '../pronunciation/pronounce';
import GithubIcon from './icons/github-icon';
import AyranIcon from './icons/ayran-icon';
import InfoDrawer from './components/info-drawer';
import AnalyticsWrapper from './components/analytics-wrapper';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [exampleIndex, setExampleIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pronunciatonText, setPronunciatonText] = useState('');
  const [activeIndicesTrigger, setActiveIndicesTrigger] = useState(0);
  const [toasterRef, setToasterRef] = useState();

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const isDarkModeStr = localStorage.getItem('irun-is-dark-mode');
      if (isDarkModeStr) {
        const lastIsDarkMode = JSON.parse(isDarkModeStr);
        setIsDarkMode(lastIsDarkMode);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.querySelector('html').style.backgroundColor = '#30404d';
    } else {
      document.querySelector('html').style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('irun-is-dark-mode', JSON.stringify(newIsDarkMode));
    }
  };

  useEffect(() => {
    const pronuncationButtons = document.getElementById('pronunciation-buttons');
    let text = pronuncationButtons.innerText;
    while (text.includes('\n')) {
      text = text.replace('\n', ' ');
    }
    setPronunciatonText(text);
  }, [inputText, activeIndicesTrigger]);

  const pronunciationAnalysis = getPronunciation(inputText, { analysis: true });

  const pronunciationComponents = pronunciationAnalysis
    .filter(wordAnalysis => wordAnalysis.pronunciations.length > 0)
    .map(
      (wordAnalysis, i) => {
        const key = JSON.stringify([wordAnalysis.pronounceable, i]);
        return (
          <span key={key}>
            <Pronunciation
              wordAnalysis={wordAnalysis}
              setActiveIndicesTrigger={setActiveIndicesTrigger}
            />
          </span>
        );
      },
    );

  const showNextExample = () => {
    const exampleTexts = [
      'Merhaba dünya!',
      'Emin Bahadır Tülüce',
      'Ayran içmek istiyorsan iç.',
      'İhsan Doğramacı Bilkent Üniversitesi',
      'Antik diyarlardan bir gezgine rastladım.',
      'Sabah reçel yemek istiyorum.',
      'işletim sistemleri, veritabanları ve nesne yönelimli programlama',
      'Sıradaki sefer saat kaçta?',
      'Hiç şüphesiz ki Antalya dünyanın en güzel yeridir.',
    ];
    const exampleText = exampleTexts[exampleIndex];
    setExampleIndex((exampleIndex + 1) % exampleTexts.length);
    setInputText(exampleText);
  };

  const displayCopiedMessage = () => {
    if (toasterRef) {
      toasterRef.show({
        message: 'Copied pronunciation to clipboard!',
        icon: 'tick',
        intent: Intent.SUCCESS,
      });
    }
  };

  const copyPronunciation = () => {
    const input = document.createElement('input');
    input.setAttribute('value', pronunciatonText);
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    displayCopiedMessage();
  };

  return (
    <div className={`app ${isDarkMode ? 'bp3-dark' : ''}`}>
      <div className='justifier-container'>
        <h1>
          iRun&nbsp;
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
              href='https://github.com/tuluce/iRun'
              target='_blank'
              rel='noreferrer'
            />
          </div>
        </h1>
        <div className='right-meta-button-wrapper'>
          <Button
            className='meta-button'
            icon='moon'
            onClick={toggleDarkMode}
          />
        </div>
      </div>
      <div>
        <div>
          <div className='ayran-icon-wrapper'>
            <AyranIcon />
          </div>
          <div>
            <p>Enter the Turkish phrase you want to pronounce. Use Turkish characters for more accurate results.</p>
            <p>
              Or, check out some of the
              <Button
                className='examples-button'
                minimal
                small
                onClick={showNextExample}
                text={<u>examples</u>}
              />
            </p>
          </div>
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
        <div id='pronunciation-buttons'>
          {pronunciationComponents}
        </div>
        <br/>
        {pronunciationComponents.length > 0 && (
          <Button minimal icon='clipboard' className='pronunciation-button' onClick={copyPronunciation} />
        )}
        {pronunciatonText}
      </div>
      <InfoDrawer {...{isDrawerOpen, setIsDrawerOpen}} />
      <Toaster ref={ref => setToasterRef(ref)} maxToasts={1} />
      <AnalyticsWrapper />
    </div>
  );
};

export default App;
