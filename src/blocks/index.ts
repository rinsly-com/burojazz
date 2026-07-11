import type { Block } from 'payload'

import { heroBlock } from './hero'
import { servicesBlock } from './services'
import { aboutBlock } from './about'
import { coreValuesBlock } from './coreValues'
import { visionMissionBlock } from './visionMission'
import { contactPersonsBlock } from './contactPersons'
import { complaintsBlock } from './complaints'
import { socialBlock } from './social'
import { vacanciesBlock } from './vacancies'
import { accordionBlock } from './accordion'
import { buttonRowBlock } from './buttonRow'
import { richTextBlock } from './richText'

export const pageBlocks: Block[] = [
  heroBlock,
  servicesBlock,
  aboutBlock,
  coreValuesBlock,
  visionMissionBlock,
  contactPersonsBlock,
  complaintsBlock,
  socialBlock,
  vacanciesBlock,
  accordionBlock,
  buttonRowBlock,
  richTextBlock,
]
