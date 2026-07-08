import * as migration_20260708_170032_initial from './20260708_170032_initial';

export const migrations = [
  {
    up: migration_20260708_170032_initial.up,
    down: migration_20260708_170032_initial.down,
    name: '20260708_170032_initial'
  },
];
