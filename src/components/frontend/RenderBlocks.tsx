import React from 'react'

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

type Block = NonNullable<Page['layout']>[number]

/**
 * Typed block dispatcher: maps each Payload block slug to its section
 * component. Unknown block types render nothing (forward compatible).
 */
function RenderBlock({ block }: { block: Block }) {
  switch (block.blockType) {
    case 'hero':
      return <Hero {...block} />
    case 'services':
      return <Services {...block} />
    case 'about':
      return <About {...block} />
    case 'coreValues':
      return <CoreValues {...block} />
    case 'visionMission':
      return <VisionMission {...block} />
    case 'contactPersons':
      return <ContactPersons {...block} />
    case 'complaints':
      return <Complaints {...block} />
    case 'social':
      return <Social {...block} />
    case 'vacancies':
      return <Vacancies {...block} />
    case 'accordion':
      return <Accordion {...block} />
    case 'buttonRow':
      return <ButtonRow {...block} />
    case 'richText':
      return <RichTextBlock {...block} />
    default:
      return null
  }
}

export function RenderBlocks({ layout }: { layout: Page['layout'] }) {
  if (!layout || layout.length === 0) return null

  return (
    <>
      {layout.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`
        // Every block is a potential scroll target: prefer its readable Anchor
        // ID, fall back to the stable block id (what SectionSelect stores when
        // no Anchor ID is set). No scroll offset — onepager menu links land with
        // the section's top flush against the top of the viewport.
        const id = block.anchor?.trim().replace(/^#+/, '') || block.id || undefined
        if (!id) return <RenderBlock key={key} block={block} />
        return (
          <div key={key} id={id}>
            <RenderBlock block={block} />
          </div>
        )
      })}
    </>
  )
}

export default RenderBlocks
