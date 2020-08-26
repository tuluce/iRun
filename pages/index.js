import React from 'react';
import Head from 'next/head';

import App from './app';
import './styles.css';

const HomePage = () => {
  return (
    <>
      <Head>
        <link href='https://unpkg.com/normalize.css@^7.0.0' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/icons@^3.4.0/lib/css/blueprint-icons.css' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/core@^3.10.0/lib/css/blueprint.css' rel='stylesheet' />
      </Head>
      <App />
    </>
  );
};

export default HomePage;
