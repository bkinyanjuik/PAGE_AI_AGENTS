import React from 'react';
import Head from 'next/head';
import Navigation from '../../components/Navigation';
import Agents from '../../components/Agents';

const AgentsPage = () => {
  return (
    <>
      <Head>
        <title>Agents - Vibecoded</title>
        <meta name="description" content="Manage your AI agents." />
      </Head>
      <Navigation />
      <main>
        <Agents />
      </main>
    </>
  );
};

export default AgentsPage;
