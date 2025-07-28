import React from 'react';
import Advisories from '../components/Advisories';
import Agents from '../components/Agents';
import Tasks from '../components/Tasks';
import Workflows from '../components/Workflows';

const HomePage = () => {
  return (
    <div>
      <h1>Vibecoded App</h1>
      <Advisories />
      <Agents />
      <Tasks />
      <Workflows />
    </div>
  );
};

export default HomePage;
