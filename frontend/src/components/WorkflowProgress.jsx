import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './common/Card';

export const WorkflowProgress = ({ workflow }) => {
  const progress = (workflow.completedTasks / workflow.totalTasks) * 100;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold gradient-text mb-4">{workflow.name}</h2>
      
      <div className="relative h-2 bg-dark-light rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-4">
        {workflow.tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={`w-3 h-3 rounded-full ${
              task.status === 'completed' ? 'bg-primary' :
              task.status === 'in_progress' ? 'bg-warning animate-pulse' :
              'bg-gray-600'
            }`} />
            <div className="flex-1">
              <p className="font-medium">{task.name}</p>
              <p className="text-sm text-gray-400">{task.agent}</p>
            </div>
            {task.duration && (
              <span className="text-sm text-gray-400">{task.duration}</span>
            )}
          </motion.div>
        ))}
      </div>
    </Card>
  );
};
