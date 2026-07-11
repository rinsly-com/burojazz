import * as migration_20260709_180930_initial from './20260709_180930_initial';

export const migrations = [
  {
    up: migration_20260709_180930_initial.up,
    down: migration_20260709_180930_initial.down,
    name: '20260709_180930_initial'
  },
];
