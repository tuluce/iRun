import React from 'react';
import Head from 'next/head';

import App from '../app';

const HomePage = () => {
  return (
    <>
      <Head>
        <link href='https://unpkg.com/normalize.css@^7.0.0' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/icons@^3.4.0/lib/css/blueprint-icons.css' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/core@^3.10.0/lib/css/blueprint.css' rel='stylesheet' />
        <link href='styles.css' rel='stylesheet' />
        <link rel='icon ' type='image/png ' href='favicon.png' />
        <title>iRun</title>
        <meta name='description' content='A web app to help with the pronunciation of Turkish words' />
        <meta property='og:site_name' content='iRun' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='iRun' />
        <meta property='og:description' content='A web app to help with the pronunciation of Turkish words' />
        <meta property='og:image' content='irun.png' />
      </Head>
      <App />
    </>
  );
};

export default HomePage;
