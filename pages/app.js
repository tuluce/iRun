import React, { useState } from 'react';
import { TextArea } from '@blueprintjs/core';

import Pronunciation from './components/pronunciation';
import { getPronunciation } from '../pronunciation/pronounce';

const App = () => {
  const [inputText, setInputText] = useState('');
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
  return (
    <div className='app'>
      <h1>Pronounce TR</h1>
      <div>
        Enter the Turkish phrase you want to pronounce.
        <br/><br/>
        <TextArea
          fill={true}
          growVertically={true}
          large={true}
          onChange={event => setInputText(event.target.value)}
          value={inputText}
        />
        <br/><br/>
        {pronunciationComponents}
      </div>
    </div>
  );
};

export default App;
