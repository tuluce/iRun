import React from 'react';
import { Drawer } from '@blueprintjs/core';

const InfoDrawer = props => {
  const { isDrawerOpen, setIsDrawerOpen } = props;

  const getDrawerSize = () => {
    if (typeof window !== 'undefined') {
      return `${Math.min(window.innerWidth, 450)}px`;
    }
    return '450px';
  };

  return (
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
  );
};

export default InfoDrawer;
