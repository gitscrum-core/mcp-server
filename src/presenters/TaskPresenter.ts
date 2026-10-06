/**
 * TaskPresenter — View layer for Task entities
 */
import { definePresenter, ui, suggest } from '@vurb/core';
import { TaskModel } from '../models/TaskModel.js';

type Task = typeof TaskModel.infer;

export const TaskPresenter = definePresenter({
  name: 'Task',
  schema: TaskModel.schema,
  rules: [
    'Display task status using emoji: ✅ done, 🔄 in progress, 📋 to do, 🐛 bug, 🚧 blocker.',
    'Always show the task code (e.g. PROJ-123) when available.',
    'Dates are in YYYY-MM-DD format.',
  ],
  ui: (task: Task) => [
    task.labels && task.labels.length > 0
      ? ui.markdown(`**Labels**: ${task.labels.map((l: { title: string }) => `\`${l.title}\``).join(', ')}`)
      : null,
  ],
  agentLimit: {
    max: 50,
    onTruncate: (n) => ui.summary(`⚠️ Dataset truncated. 50 tasks shown, ${n} hidden. Use 'task.filter' to narrow results.`),
  },
  suggestActions: (task: Task) => [
    suggest('task.get', `View full details for "${task.title}"`),
    ...(task.workflow?.title?.toLowerCase() !== 'done'
      ? [suggest('task.complete', 'Mark task as complete')]
      : []),
    suggest('comment.list', 'View task comments'),
    suggest('task.update', 'Update task details'),
  ],
  collectionSuggestions: (tasks: Task[]) => [
    tasks.some(t => t.is_blocker)
      ? suggest('task.filter', '🚧 Some tasks are blockers — filter to view them')
      : null,
    tasks.some(t => t.is_bug)
      ? suggest('task.filter', '🐛 Some tasks are bugs — filter to isolate')
      : null,
  ],
});
