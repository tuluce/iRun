import React from 'react';
import Head from 'next/head';

import App from '../app';

const rootUrl = 'https://irun.netlify.app';

const HomePage = () => {
  return (
    <>
      <Head>
        <link href='https://unpkg.com/normalize.css@^7.0.0' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/icons@^3.4.0/lib/css/blueprint-icons.css' rel='stylesheet' />
        <link href='https://unpkg.com/@blueprintjs/core@^3.10.0/lib/css/blueprint.css' rel='stylesheet' />
        <link href='/styles.css' rel='stylesheet' />
        <link rel='icon ' type='image/x-icon' href='/favicon.ico' />
        <title>iRun - Pronounce Turkish phrases</title>
        <meta name='description' content='A web app to help with the pronunciation of Turkish words and phrases' />
        <meta property='og:site_name' content='iRun' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='iRun - Pronounce Turkish phrases' />
        {/* eslint-disable-next-line max-len */}
        <meta property='og:description' content='A web app to help with the pronunciation of Turkish words and phrases' />
        <meta property='og:url' content={rootUrl} />
        <meta property='og:image' content={`${rootUrl}/irun.png`} />
        <meta property="og:image:width" content="1067" />
        <meta property="og:image:height" content="560" />
      </Head>
      <App />
    </>
  );
};

export default HomePage;
