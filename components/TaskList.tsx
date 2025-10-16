import React, { useState, useEffect } from 'react';
import { Task, Friend } from '../types';
import { motion } from 'framer-motion';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface TaskListProps {
  tasks: Task[];
  friends: Friend[];
  onUpdateTasks: (tasks: Task[]) => Promise<void>;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, friends, onUpdateTasks }) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTaskId) {
      const taskToEdit = tasks.find(t => t.id === editingTaskId);
      if (taskToEdit) {
        setDescription(taskToEdit.description);
        setAssignedTo(taskToEdit.assignedTo || '');
        setDeadline(taskToEdit.deadline || '');
      }
    } else {
      resetForm();
    }
  }, [editingTaskId, tasks]);

  const resetForm = () => {
    setDescription('');
    setAssignedTo('');
    setDeadline('');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);

    if (editingTaskId) {
      await onUpdateTasks(
        tasks.map(t =>
          t.id === editingTaskId
            ? {
                ...t,
                description: description.trim(),
                assignedTo: assignedTo || undefined,
                deadline: deadline || undefined,
              }
            : t
        )
      );
      setEditingTaskId(null);
    } else {
      const newTask: Task = {
        id: new Date().toISOString(),
        description: description.trim(),
        assignedTo: assignedTo || undefined,
        deadline: deadline || undefined,
        completed: false,
      };
      await onUpdateTasks([...tasks, newTask]);
      resetForm();
    }
    setIsSubmitting(false);
  };

  const toggleTaskCompletion = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  
  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  }

  const getFriendName = (id: string) => friends.find(f => f.id === id)?.name || 'Unassigned';

  return (
    <div className="bg-surface p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Party Tasks</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-surface-light rounded-lg">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description..."
          className="md:col-span-2 bg-surface border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary"
          required
        />
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="bg-surface border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary">
          <option value="">Assign to...</option>
          {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-surface border border-gray-600 rounded-md px-3 py-2 text-text focus:ring-primary focus:border-primary"
        />
        <div className="md:col-span-4 flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={isSubmitting} className={`flex-grow font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${editingTaskId ? 'bg-secondary text-white hover:bg-secondary-hover' : 'bg-primary text-white hover:bg-primary-hover'} disabled:bg-opacity-50`}>
              {isSubmitting ? <SpinnerIcon /> : (editingTaskId ? 'Update Task' : <><PlusIcon /> Add Task</>)}
            </motion.button>
            {editingTaskId && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={handleCancelEdit} className="px-4 bg-surface text-text-secondary rounded-lg hover:bg-surface-light transition-colors">
                    Cancel
                </motion.button>
            )}
        </div>
      </form>
      <ul className="space-y-3">
        {tasks.map(task => (
          <motion.li
            key={task.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors group ${task.completed ? 'bg-green-500/10' : 'bg-surface-light'}`}
          >
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTaskCompletion(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-secondary bg-secondary' : 'border-text-secondary'}`}>
                {task.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
              </button>
              <div>
                <p className={`font-medium ${task.completed ? 'line-through text-text-secondary' : ''}`}>{task.description}</p>
                <div className="text-xs text-text-secondary flex gap-4">
                  <span>Assigned to: <strong>{getFriendName(task.assignedTo || '')}</strong></span>
                  {task.deadline && <span>Deadline: <strong>{new Date(task.deadline).toLocaleDateString()}</strong></span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => handleEditClick(task)} className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity disabled:opacity-20" disabled={!!editingTaskId && editingTaskId !== task.id}>
                    <EditIcon className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity">
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
