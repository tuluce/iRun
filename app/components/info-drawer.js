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
      title='About iRun'
    >
      <div className='drawer-content'>
        <h3>What</h3>
        <p>
          An open-source web app to help with the pronunciation of Turkish words. To check
          out the source code or contribute, please visit the GitHub repository.
        </p>
        <h3>Why</h3>
        <p>
          Unlike any other pronunciation dictionaries, <i>iRun</i> attempts to find
          English dictionary words which have close pronunciations to the target Turkish
          syllable. The goal is to make the prounciation easier for the people who are not
          familiar with Turkish. You can also benefit from this app if you have a Turkish
          name and you have hard time making other people pronounce it correctly.
        </p>
        <h3>How</h3>
        <p>
          The algorithm behind <i>iRun</i> uses the CMUdict (the Carnegie Mellon Pronouncing
          Dictionary) to find English matches to Turkish syllables. You can check out the
          documentation for the full explanation.
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