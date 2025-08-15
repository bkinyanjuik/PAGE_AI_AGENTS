import React from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import LandingPage from '../components/LandingPage';

const Home = () => {
  return (
    <>
      <Head>
        <title>Vibecoded - AI Agent Orchestration Platform</title>
        <meta name="description" content="Next-generation AI Agent Orchestration Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <LandingPage />
    </>
  );
};

export default Home;
