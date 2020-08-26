import React, { useState } from 'react';
import { TextArea } from '@blueprintjs/core';
import { getPronunciation } from '../pronunciation/pronounce';

const App = () => {
  const [inputText, setInputText] = useState('');
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
        {getPronunciation(inputText).join(' ')}
      </div>
    </div>
  );
};

export default App;
