import * as migration_20260708_215043_initial from './20260708_215043_initial';

export const migrations = [
  {
    up: migration_20260708_215043_initial.up,
    down: migration_20260708_215043_initial.down,
    name: '20260708_215043_initial'
  },
];
