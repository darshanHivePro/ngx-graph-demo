import { Edge, Node, ClusterNode } from '@swimlane/ngx-graph';

export const nodes = [
  {
    id: 'root',
    label: 'Container Images',
    category: 'root',
    icon: 'data:image/png;base64,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',
  },
  {
    id: 'azure',
    label: 'Azure',
    category: 'source',
  },
  {
    id: 'uploaded',
    label: 'Uploaded',
    category: 'source',
  },
  {
    id: 'aws',
    label: 'AWS',
    category: 'source',
  },
];

export const links = [
  {
    id: 'a',
    source: 'root',
    target: 'aws',
    label: 'is parent of',
    length: 150,
  },
  {
    id: 'b',
    source: 'root',
    target: 'azure',
    label: 'custom label',
    length: 200,
  },
  {
    id: 'd',
    source: 'root',
    target: 'uploaded',
    label: 'custom label',
    length: 150,
  },
];
