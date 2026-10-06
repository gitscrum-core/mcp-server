/**
 * SprintPresenter — View layer for Sprint entities
 */
import { definePresenter, ui, suggest } from '@vurb/core';
import { SprintModel } from '../models/SprintModel.js';

type Sprint = typeof SprintModel.infer;

export const SprintPresenter = definePresenter({
  name: 'Sprint',
  schema: SprintModel.schema,
  rules: [
    'Progress is a percentage (0-100). Visualize with a progress bar or gauge.',
    'Dates are in YYYY-MM-DD format.',
  ],
  ui: (sprint: Sprint) => [
    sprint.progress !== undefined
      ? ui.echarts({
        series: [{ type: 'gauge', data: [{ value: sprint.progress, name: 'Progress' }] }],
        title: { text: sprint.title },
      })
      : null,
  ],
  suggestActions: (sprint: Sprint) => [
    suggest('sprint.kpi', 'View sprint KPIs'),
    suggest('sprint.progress', 'View burndown data'),
    suggest('sprint.backlog', 'View sprint backlog'),
    ...(sprint.progress !== undefined && sprint.progress < 100
      ? [suggest('sprint.report', 'Generate sprint report')]
      : []),
  ],
});
