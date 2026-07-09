import React from 'react'

import type { Page } from '@/payload-types'

import { About } from '@/components/frontend/blocks/About'
import { Complaints } from '@/components/frontend/blocks/Complaints'
import { ContactPersons } from '@/components/frontend/blocks/ContactPersons'
import { CoreValues } from '@/components/frontend/blocks/CoreValues'
import { Hero } from '@/components/frontend/blocks/Hero'
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
    default:
      return null
  }
}

export function RenderBlocks({ layout }: { layout: Page['layout'] }) {
  if (!layout || layout.length === 0) return null

  return (
    <>
      {layout.map((block, index) => (
        <RenderBlock key={block.id ?? `${block.blockType}-${index}`} block={block} />
      ))}
    </>
  )
}

export default RenderBlocks
