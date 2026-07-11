import * as migration_20260709_180930_initial from './20260709_180930_initial';
import * as migration_20260711_135639_header_nav_links from './20260711_135639_header_nav_links';

export const migrations = [
  {
    up: migration_20260709_180930_initial.up,
    down: migration_20260709_180930_initial.down,
    name: '20260709_180930_initial',
  },
  {
    up: migration_20260711_135639_header_nav_links.up,
    down: migration_20260711_135639_header_nav_links.down,
    name: '20260711_135639_header_nav_links'
  },
];
