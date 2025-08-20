import React from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import Tasks from '../components/Tasks';

const TasksPage = () => {
  return (
    <>
      <Head>
        <title>Tasks - Vibecoded</title>
        <meta name="description" content="Manage your tasks." />
      </Head>
      <Navigation />
      <main>
        <Tasks />
      </main>
    </>
  );
};

export default TasksPage;
