import React from 'react';
import { Button, Icon } from '@blueprintjs/core';

import { getPronunciation } from '../pronunciation/pronounce';

const HomePage = () => {
  return (
    <>
      Welcome to Next.js, {getPronunciation('bahadır').join('-')}!
      <Icon icon="globe" iconSize={20} />
      <Button>My button</Button>
    </>
  );
};

export default HomePage;
