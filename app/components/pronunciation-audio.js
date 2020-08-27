import React, { useState } from 'react';
import { Button, Icon, Intent, Toaster } from '@blueprintjs/core';

const AudioState = { IDLE: 'idle', LOADING: 'loading', PLAYING: 'playing', FAILED: 'failed' };

const PronunciationAudio = props => {
  const [audioState, setAudioState] = useState(AudioState.IDLE);
  const [audioInstance, setAudioInstance] = useState();
  const [toasterRef, setToasterRef] = useState();

  const playAudio = src => (
    new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.autoplay = true;
      audio.onerror = reject;
      audio.onended = resolve;
      audio.src = src;
      setAudioInstance(audio);
    })
  );

  const fetchAndPlayAudio = async () => {
    setAudioState(AudioState.LOADING);
    const key = '86806895acac49db9b83acc4aecf4393';
    const src = encodeURI(props.pronounceable);
    const url = `https://api.voicerss.org/?key=${key}&hl=tr-tr&v=Omer&r=-3&f=32khz_16bit_stereo&b64=true&src=${src}`;
    try {
      const response = await fetch(url);
      const data = await response.text();
      setAudioState(AudioState.PLAYING);
      await playAudio(data);
      setAudioState(AudioState.IDLE);
    } catch (err) {
      console.error(err);
      setAudioState(AudioState.FAILED);
      displayError();
    }
  };

  const pauseAudio = () => {
    if (audioInstance) {
      audioInstance.pause();
    }
    setAudioState(AudioState.IDLE);
  };

  const displayError = () => {
    const q = encodeURI(props.pronounceable);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${q}&tl=tr&client=tw-ob&ttsspeed=0.24`;
    if (toasterRef) {
      toasterRef.show({
        message: (
          <div>
            An error occured while loading the text-to-speech audio.
            <br/><br/>
            Try listening it from <a href={url} target='_blank' rel='noreferrer'>this link <Icon icon='share'/></a>.
          </div>
        ),
        icon: 'warning-sign',
        intent: Intent.DANGER,
      });
    }
  };

  const handleClick = () => {
    if (audioState === AudioState.IDLE) {
      fetchAndPlayAudio();
    } else if (audioState === AudioState.PLAYING) {
      pauseAudio();
    } else if (audioState === AudioState.FAILED) {
      displayError();
    }
  };

  const buttonIconMap = {
    [AudioState.IDLE]: 'volume-up',
    [AudioState.LOADING]: '',
    [AudioState.PLAYING]: 'pause',
    [AudioState.FAILED]: 'error',
  };
  const buttonIcon = buttonIconMap[audioState];

  return (
    <>
      <Button
        onClick={handleClick}
        icon={buttonIcon}
        loading={audioState === AudioState.LOADING}
      />
      <Toaster
        ref={ref => setToasterRef(ref)}
        maxToasts={1}
      />
    </>
  );
};

export default PronunciationAudio;
