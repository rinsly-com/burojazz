'use client'

import { createPreviewShell } from '@rinsly-com/site-core/preview'

import type { Page } from '@/payload-types'
import { About } from '@/components/frontend/blocks/About'
import { Accordion } from '@/components/frontend/blocks/Accordion'
import { ButtonRow } from '@/components/frontend/blocks/ButtonRow'
import { Complaints } from '@/components/frontend/blocks/Complaints'
import { ContactPersons } from '@/components/frontend/blocks/ContactPersons'
import { CoreValues } from '@/components/frontend/blocks/CoreValues'
import { Hero } from '@/components/frontend/blocks/Hero'
import { RichTextBlock } from '@/components/frontend/blocks/RichTextBlock'
import { Services } from '@/components/frontend/blocks/Services'
import { Social } from '@/components/frontend/blocks/Social'
import { Vacancies } from '@/components/frontend/blocks/Vacancies'
import { VisionMission } from '@/components/frontend/blocks/VisionMission'

type BlockOf<T extends string> = Extract<NonNullable<Page['layout']>[number], { blockType: T }>

const as = <T,>(block: unknown) => block as T

/**
 * This site's block renderers, on the client, for live preview.
 *
 * Mirrors `RenderBlocks` deliberately rather than importing it. That module is
 * used on the SERVER public path; marking it `'use client'` would break it.
 * Keep the two in step: a block in one and not the other either misses the
 * public site or does not update as the editor types.
 *
 * Every slug here overrides the engine's built-in renderer of the same name
 * (hero, services, …) — without that, preview would paint the generic core
 * blocks instead of Buro J.A.Z.Z.'s.
 */
export const PreviewShell = createPreviewShell({
  hero: (block) => <Hero {...as<BlockOf<'hero'>>(block)} />,
  services: (block) => <Services {...as<BlockOf<'services'>>(block)} />,
  about: (block) => <About {...as<BlockOf<'about'>>(block)} />,
  coreValues: (block) => <CoreValues {...as<BlockOf<'coreValues'>>(block)} />,
  visionMission: (block) => <VisionMission {...as<BlockOf<'visionMission'>>(block)} />,
  contactPersons: (block) => <ContactPersons {...as<BlockOf<'contactPersons'>>(block)} />,
  complaints: (block) => <Complaints {...as<BlockOf<'complaints'>>(block)} />,
  social: (block) => <Social {...as<BlockOf<'social'>>(block)} />,
  vacancies: (block) => <Vacancies {...as<BlockOf<'vacancies'>>(block)} />,
  accordion: (block) => <Accordion {...as<BlockOf<'accordion'>>(block)} />,
  buttonRow: (block) => <ButtonRow {...as<BlockOf<'buttonRow'>>(block)} />,
  richText: (block) => <RichTextBlock {...as<BlockOf<'richText'>>(block)} />,
})
