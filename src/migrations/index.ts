import * as migration_20260709_180930_initial from './20260709_180930_initial';
import * as migration_20260711_135639_header_nav_links from './20260711_135639_header_nav_links';
import * as migration_20260711_150801_drop_page_content from './20260711_150801_drop_page_content';
import * as migration_20260711_152316_trim_unrendered_block_fields from './20260711_152316_trim_unrendered_block_fields';
import * as migration_20260711_154019_services_tabs_cards from './20260711_154019_services_tabs_cards';
import * as migration_20260711_155148_core_value_image from './20260711_155148_core_value_image';
import * as migration_20260711_160558_core_value_description from './20260711_160558_core_value_description';
import * as migration_20260711_161451_contact_person_fields from './20260711_161451_contact_person_fields';
import * as migration_20260711_181919_remove_hero_cert from './20260711_181919_remove_hero_cert';
import * as migration_20260712_114843_complaints_pills_contact from './20260712_114843_complaints_pills_contact';
import * as migration_20260712_130435_cms_managed_images from './20260712_130435_cms_managed_images';
import * as migration_20260712_131205_social_arrow_instagram from './20260712_131205_social_arrow_instagram';
import * as migration_20260712_133841_aanmeldingen from './20260712_133841_aanmeldingen';
import * as migration_20260712_134346_anchor_links from './20260712_134346_anchor_links';
import * as migration_20260713_161147_services_card_icon from './20260713_161147_services_card_icon';
import * as migration_20260713_163446_seo_meta from './20260713_163446_seo_meta';
import * as migration_20260713_172042_noindex_meta from './20260713_172042_noindex_meta';

export const migrations = [
  {
    up: migration_20260709_180930_initial.up,
    down: migration_20260709_180930_initial.down,
    name: '20260709_180930_initial',
  },
  {
    up: migration_20260711_135639_header_nav_links.up,
    down: migration_20260711_135639_header_nav_links.down,
    name: '20260711_135639_header_nav_links',
  },
  {
    up: migration_20260711_150801_drop_page_content.up,
    down: migration_20260711_150801_drop_page_content.down,
    name: '20260711_150801_drop_page_content',
  },
  {
    up: migration_20260711_152316_trim_unrendered_block_fields.up,
    down: migration_20260711_152316_trim_unrendered_block_fields.down,
    name: '20260711_152316_trim_unrendered_block_fields',
  },
  {
    up: migration_20260711_154019_services_tabs_cards.up,
    down: migration_20260711_154019_services_tabs_cards.down,
    name: '20260711_154019_services_tabs_cards',
  },
  {
    up: migration_20260711_155148_core_value_image.up,
    down: migration_20260711_155148_core_value_image.down,
    name: '20260711_155148_core_value_image',
  },
  {
    up: migration_20260711_160558_core_value_description.up,
    down: migration_20260711_160558_core_value_description.down,
    name: '20260711_160558_core_value_description',
  },
  {
    up: migration_20260711_161451_contact_person_fields.up,
    down: migration_20260711_161451_contact_person_fields.down,
    name: '20260711_161451_contact_person_fields',
  },
  {
    up: migration_20260711_181919_remove_hero_cert.up,
    down: migration_20260711_181919_remove_hero_cert.down,
    name: '20260711_181919_remove_hero_cert',
  },
  {
    up: migration_20260712_114843_complaints_pills_contact.up,
    down: migration_20260712_114843_complaints_pills_contact.down,
    name: '20260712_114843_complaints_pills_contact',
  },
  {
    up: migration_20260712_130435_cms_managed_images.up,
    down: migration_20260712_130435_cms_managed_images.down,
    name: '20260712_130435_cms_managed_images',
  },
  {
    up: migration_20260712_131205_social_arrow_instagram.up,
    down: migration_20260712_131205_social_arrow_instagram.down,
    name: '20260712_131205_social_arrow_instagram',
  },
  {
    up: migration_20260712_133841_aanmeldingen.up,
    down: migration_20260712_133841_aanmeldingen.down,
    name: '20260712_133841_aanmeldingen',
  },
  {
    up: migration_20260712_134346_anchor_links.up,
    down: migration_20260712_134346_anchor_links.down,
    name: '20260712_134346_anchor_links',
  },
  {
    up: migration_20260713_161147_services_card_icon.up,
    down: migration_20260713_161147_services_card_icon.down,
    name: '20260713_161147_services_card_icon',
  },
  {
    up: migration_20260713_163446_seo_meta.up,
    down: migration_20260713_163446_seo_meta.down,
    name: '20260713_163446_seo_meta',
  },
  {
    up: migration_20260713_172042_noindex_meta.up,
    down: migration_20260713_172042_noindex_meta.down,
    name: '20260713_172042_noindex_meta',
  },
];
