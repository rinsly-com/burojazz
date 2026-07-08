import * as migration_20260708_173717_initial from './20260708_173717_initial';

export const migrations = [
  {
    up: migration_20260708_173717_initial.up,
    down: migration_20260708_173717_initial.down,
    name: '20260708_173717_initial'
  },
];
