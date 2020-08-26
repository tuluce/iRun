import React, { useState } from 'react';
import { Button, Popover, Position, Icon } from '@blueprintjs/core';
import PronunciationAudio from './pronunciation-audio';

const Pronunciation = props => {
  const wordAnalysis = props.wordAnalysis;
  const [activeIndex, setActiveIndex] = useState(0);

  const maxHyphenationCount = 10;
  const pronunciations = wordAnalysis?.pronunciations?.slice(0, maxHyphenationCount);

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
          (<a href={url} target='_blank' rel='noreferrer'>dictionary <Icon icon='manual'/></a> )
        </span>
      );
    }
    if (source === 'syllable-translation') {
      return (
        <span>
          ({from} &#8594; {to})
        </span>
      );
    }
    if (source === 'letter-translation') {
      return (
        <span>
          ({from} &#8594; {to})
        </span>
      );
    }
  };

  return (
    <span>
      <Popover position={Position.BOTTOM} content={(
        <div className='pornunciation-popover'>
          <PronunciationAudio pronounceable={wordAnalysis.pronounceable}/>
          &nbsp;
          {wordAnalysis.pronounceable}
          &nbsp;&#8594;&nbsp;
          <b>{pronunciation?.display}</b>
          &nbsp;({actualIndex + 1} / {pronunciations?.length})
          <br/>
          <br/>
          {pronunciation?.words.map((word, i) => (
            <div className='pronunciation-word-line' key={i}>
              <b>{word}</b> {renderExplanation(word)}
            </div>
          ))}
          <br/>
          <Button
            icon='arrow-left'
            text='Previous'
            onClick={goPrevious}
            disabled={actualIndex === minIndex}
          />
          &nbsp;
          <Button
            rightIcon='arrow-right'
            text='Next'
            onClick={goNext}
            disabled={actualIndex === maxIndex}
          />
        </div>
      )}>
        <Button className='pronunciation-button'>{pronunciation?.display}</Button>
      </Popover>
    </span>
  );
};

export default Pronunciation;
