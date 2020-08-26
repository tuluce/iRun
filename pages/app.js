import React, { useState } from 'react';
import { Button, TextArea } from '@blueprintjs/core';

import Pronunciation from './components/pronunciation';
import { getPronunciation } from '../pronunciation/pronounce';

const exampleTexts = [
  'Merhaba dünya!',
  'Antik diyarlardan bir gezgine rastladım.',
  'Sabah reçel yemek istiyorum.',
  'İnsanlara örnek, akıl verici, eğitici...',
  'Sıradaki sefer saat kaçta?',
  'Emin Bahadır Tülüce',
  'İhsan Doğramacı Bilkent Üniversitesi',
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
        return (
          <span key={i}>
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
      <h1>Pronounce TR</h1>
      <div>
        <div>
          <p>Enter the Turkish phrase you want to pronounce.</p>
          <p>
            ( or check out some
            <Button className='examples-button' small minimal text='examples' onClick={showNextExample} />
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
