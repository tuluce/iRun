import React, { useState } from 'react';
import { TextArea, Button, Popover, Position, Icon } from '@blueprintjs/core';
import { getPronunciation } from '../pronunciation/pronounce';

const Pronunciation = props => {
  const wordAnalysis = props.wordAnalysis;
  const [activeIndex, setActiveIndex] = useState(0);

  const pronunciations = wordAnalysis?.pronunciations?.slice(0, 50);

  const maxIndex = pronunciations?.length - 1;
  const minIndex = 0;
  const actualIndex = Math.min(Math.max(activeIndex, minIndex), maxIndex);
  const pronunciation = pronunciations[actualIndex];

  const goNext = () => {
    setActiveIndex(Math.min(maxIndex, actualIndex + 1));
  };

  const goPrevious = () => {
    setActiveIndex(Math.max(minIndex, actualIndex - 1));
  };

  const renderExplanation = word => {
    const source = pronunciation.details[word].source;
    const from = pronunciation.details[word].explanation.from;
    const to = pronunciation.details[word].explanation.to;
    if (source === 'dictionary') {
      const url = `https://dictionary.cambridge.org/dictionary/english/${word}`;
      return (
        <span>
          word (<a href={url} target='_blank' rel='noreferrer'>dictionary <Icon icon='manual'/></a> )
        </span>
      );
    }
    if (source === 'syllable-translation') {
      return (
        <span>
          direct ({from} &#8594; {to})
        </span>
      );
    }
    if (source === 'letter-translation') {
      return (
        <span>
          direct ({from} &#8594; {to})
        </span>
      );
    }
  };

  const playAudio = () => {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=emin&tl=tr&client=tw-ob&ttsspeed=0.24';
    const myAudio = new Audio(url);
    myAudio.play();
  };

  return (
    <span>
      <Popover position={Position.BOTTOM} content={(
        <div className='pornunciation-popover'>
          <Button icon='volume-up' onClick={playAudio} />
          &nbsp;
          {wordAnalysis.pronounceable}
          &nbsp;&#8594;&nbsp;
          <b>{pronunciation.display}</b>
          &nbsp;({actualIndex + 1} / {pronunciations?.length})
          <br/>
          <br/>
          {pronunciation.words.map((word, i) => (
            <div className='pronunciation-word-line' key={i}>
              <b>{word}</b>: {renderExplanation(word)}
            </div>
          ))}
          <br/>
          <Button
            icon='arrow-left'
            text='Previous'
            onClick={goPrevious}
          />
          &nbsp;
          <Button
            rightIcon='arrow-right'
            text='Next'
            onClick={goNext}
          />
        </div>
      )}>
        <Button className='pronunciation-button'>{pronunciation.display}</Button>
      </Popover>
    </span>
  );
};

const App = () => {
  const [inputText, setInputText] = useState('');
  const pronunciationAnalysis = getPronunciation(inputText, { analysis: true });
  const pronunciationComponents = pronunciationAnalysis.map(
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
