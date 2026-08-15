import { AnchorLink } from '@/components/frontend/ui/AnchorLink'
import { hrefFor, type LinkFields } from '@/components/frontend/ui/CMSLink'
import { Icon } from '@/components/frontend/ui/Icon'
import { Media } from '@rinsly-com/site-core/ui'
import type { Footer } from '@/payload-types'
import { cmsText } from '@rinsly-com/site-core'

type Props = {
  footer: Footer | null
}

/** Footer link lists use the same shared link fields as the header nav. */
type LinkItem = LinkFields & { id?: string | null }

/** The site is a onepager, so the fallback menu scrolls to home page sections. */
const FALLBACK_MENU: LinkItem[] = [
  { label: 'Home', type: 'external', url: '/' },
  { label: 'Hulpverleningsvormen', type: 'external', url: '/#hulpverleningsvormen' },
  { label: 'Over ons', type: 'external', url: '/#over-ons' },
  { label: 'Klachtregeling', type: 'external', url: '/#klachtregeling' },
  { label: 'Vacatures', type: 'external', url: '/#vacatures' },
  { label: 'Contact', type: 'external', url: '/contact' },
]

const FALLBACK_INFO: LinkItem[] = [
  { label: 'KvK: 85863025' },
  { label: 'AGB: 90091069' },
  { label: 'Algemene voorwaarden', type: 'external', url: '/algemene-voorwaarden' },
  { label: 'Privacyverklaring', type: 'external', url: '/privacyverklaring' },
  { label: 'Cookies', type: 'external', url: '/cookies' },
  { label: 'Certificaat', type: 'external', url: '/certificaat' },
]

/** Icon + display name per platform. The CMS stores only the platform + URL;
 *  the icon follows the platform so editors never manage icon assets. */
const SOCIAL_PLATFORMS = {
  instagram: { name: 'Instagram', icon: '/images/footer/social-1.svg' },
  linkedin: { name: 'LinkedIn', icon: '/images/footer/social-2.svg' },
  facebook: { name: 'Facebook', icon: '/images/footer/social-3.svg' },
} as const

type SocialItem = { name: string; href: string; icon: string }

/** Shown when the Footer global has no socials configured yet. */
const FALLBACK_SOCIALS: SocialItem[] = [
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: SOCIAL_PLATFORMS.instagram.icon },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', icon: SOCIAL_PLATFORMS.linkedin.icon },
  { name: 'Facebook', href: 'https://www.facebook.com/', icon: SOCIAL_PLATFORMS.facebook.icon },
]

/**
 * One footer link. `hrefFor` resolves the CMS link (internal page + optional
 * section, or an external URL) and returns `'#'` when nothing is set — those
 * entries are plain text lines (e.g. the KvK / AGB numbers), not links.
 */
function FooterLink({ item }: { item: LinkItem }) {
  const label = item.label ?? ''
  if (!label) return null
  const href = hrefFor(item)
  const className = 'text-sm font-medium leading-[1.16] tracking-[-0.01em] text-white'
  if (href !== '#') {
    return (
      <AnchorLink
        href={href}
        newTab={item.newTab ?? false}
        className={`${className} transition-opacity hover:opacity-80`}
      >
        {label}
      </AnchorLink>
    )
  }
  return <span className={className}>{label}</span>
}

function ColumnHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xl font-bold leading-[1.2] tracking-[-0.01em] text-white">{children}</h3>
  )
}

/**
 * Site footer (global-driven chrome): teal panel with tagline, contact
 * details, link columns, Kiwa certificate badge, social icons and the giant
 * fading "BURO J.A.Z.Z." wordmark above the copyright line.
 */
export function SiteFooter({ footer }: Props) {
  const tagline = cmsText(footer?.tagline, 'J.A.Z.Z. – Jeugdhulp en Ambulante Zorg met Zorgzaamheid.')
  const email = cmsText(footer?.email, 'contact@burojazz.nl')
  const phone = cmsText(footer?.phone, '+31 6 55202233')
  const address = cmsText(footer?.address, 'Vlasakker 24, 3417 XT, Montfoort')
  // Show the street on its own line and the rest below (split on the first comma).
  const [addressStreet, ...addressRest] = address.split(',')
  const addressCity = addressRest.join(',').trim()
  const menuItems = footer?.menuItems?.length ? footer.menuItems : FALLBACK_MENU
  const infoLinks = footer?.infoLinks?.length ? footer.infoLinks : FALLBACK_INFO
  const copyright =
    cmsText(footer?.copyright, 'Copyright © Buro J.A.Z.Z. 2026 –– Alle rechten voorbehouden.')
  const socials: SocialItem[] = footer?.socials?.length
    ? footer.socials.flatMap((s) => {
        const platform = s.platform ? SOCIAL_PLATFORMS[s.platform] : undefined
        if (!platform || !s.url) return []
        return [{ name: platform.name, href: s.url, icon: platform.icon }]
      })
    : FALLBACK_SOCIALS

  return (
    <footer className="overflow-hidden bg-brand text-white">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-14 px-6 pt-16 md:px-20 md:pt-20 lg:gap-[60px]">
        <div className="flex flex-col gap-6">
          {/* Top: about + link columns */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            {/* About */}
            <div className="flex max-w-[275px] flex-col items-start gap-6">
              <Media
                resource={footer?.logo}
                fallbackSrc="/images/footer/logo.svg"
                alt="Buro J.A.Z.Z. logo"
                fit="contain"
                className="size-[71px]"
              />
              {tagline && <p className="text-sm font-medium leading-[1.4] tracking-[-0.01em]">{tagline}</p>}
            </div>

            {/* Link columns */}
            <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-x-[60px] sm:gap-y-10 lg:flex-nowrap">
              {/* Contact */}
              <div className="flex flex-col gap-4">
                <ColumnHeading>Contact</ColumnHeading>
                <ul className="flex flex-col gap-3.5">
                  {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-sm font-medium leading-[1.16] tracking-[-0.01em] transition-opacity hover:opacity-80"
                    >
                      <Icon fallback="IconMail" size={24} stroke={1.5} className="shrink-0" />
                      {email}
                    </a>
                  </li>
                  )}
                  {phone && (
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2 text-sm font-medium leading-[1.16] tracking-[-0.01em] transition-opacity hover:opacity-80"
                    >
                      <Icon fallback="IconPhone" size={24} stroke={1.5} className="shrink-0" />
                      {phone}
                    </a>
                  </li>
                  )}
                  {address && (
                  <li className="flex items-start gap-2 text-sm font-medium leading-[1.4] tracking-[-0.01em]">
                    <Icon fallback="IconMapPin" size={24} stroke={1.5} className="shrink-0" />
                    <span className="flex flex-col">
                      <span>{addressStreet.trim()},</span>
                      {addressCity && <span>{addressCity}</span>}
                    </span>
                  </li>
                  )}
                </ul>
              </div>

              {/* Menu */}
              <div className="flex flex-col gap-4">
                <ColumnHeading>Menu</ColumnHeading>
                <ul className="flex flex-col gap-3.5">
                  {menuItems.map((item, i) => (
                    <li key={item.id ?? i}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Informatie */}
              <div className="flex flex-col gap-4">
                <ColumnHeading>Informatie</ColumnHeading>
                <ul className="flex flex-col gap-3.5">
                  {infoLinks.map((item, i) => (
                    <li key={item.id ?? i}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Certificaat */}
              <div className="flex flex-col gap-4">
                <ColumnHeading>Certificaat</ColumnHeading>
                <div className="flex size-[109px] items-center justify-center overflow-hidden rounded-xl border border-ink/10 bg-white">
                  <Media
                    resource={footer?.certImage}
                    fallbackSrc="/images/footer/kiwa-iso9001.png"
                    alt="Kiwa Certified ISO 9001"
                    fit="contain"
                    className="h-[90px] w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex size-12 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              >
                <img src={social.icon} alt="" width={24} height={24} className="size-6" />
              </a>
            ))}
          </div>
        </div>

        {/* Giant wordmark + copyright */}
        <div className="flex flex-col items-center">
          <p
            aria-hidden="true"
            className="-mb-[0.13em] w-full select-none bg-gradient-to-b from-white/30 to-white/0 bg-clip-text text-center font-display text-[clamp(3rem,11vw,167px)] font-black leading-[1.2] tracking-[-0.02em] whitespace-nowrap text-transparent"
          >
            BURO J.A.Z.Z.
          </p>
          {copyright && <p className="pb-6 text-center text-sm font-medium leading-[1.5]">{copyright}</p>}
        </div>
      </div>
    </footer>
  )
}
