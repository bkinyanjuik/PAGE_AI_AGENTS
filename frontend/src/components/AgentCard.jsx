import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './common/Card';

export const AgentCard = ({ agent }) => {
  return (
    <Card className="relative overflow-hidden">
      <motion.div
        className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-primary/20 rounded-full blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold gradient-text mb-2">{agent.name}</h3>
        <p className="text-gray-300 mb-4">{agent.role}</p>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            agent.status === 'active' ? 'bg-primary animate-pulse' : 'bg-gray-500'
          }`} />
          <span className="text-sm text-gray-400">{agent.status}</span>
        </div>
        
        {agent.tasks && (
          <div className="mt-4 space-y-2">
            {agent.tasks.map((task, index) => (
              <div key={index} className="text-sm text-gray-300">
                • {task}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
