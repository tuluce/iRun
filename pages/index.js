import React from 'react';
import { getPronunciation } from '../pronunciation/pronounce';

const HomePage = () => {
  return (
    <div>
      Welcome to Next.js, {getPronunciation('bahadır').join('-')}!
    </div>
  );
};

export default HomePage;
