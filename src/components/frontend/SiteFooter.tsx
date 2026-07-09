import Link from 'next/link'

import type { Footer } from '@/payload-types'

type Props = {
  footer: Footer | null
}

type LinkItem = { label?: string | null; url?: string | null; id?: string | null }

const FALLBACK_MENU: LinkItem[] = [
  { label: 'Home', url: '/' },
  { label: 'Hulpverleningsvormen', url: '/hulpverleningsvormen' },
  { label: 'Over ons', url: '/over-ons' },
  { label: 'Klachtregeling', url: '/klachtregeling' },
  { label: 'Vacatures', url: '/vacatures' },
  { label: 'Contact', url: '/contact' },
]

const FALLBACK_INFO: LinkItem[] = [
  { label: 'KvK: 85863025' },
  { label: 'AGB: 90091069' },
  { label: 'Algemene voorwaarden', url: '/algemene-voorwaarden' },
  { label: 'Privacyverklaring', url: '/privacyverklaring' },
  { label: 'Cookies', url: '/cookies' },
  { label: 'Certificaat', url: '/certificaat' },
]

const SOCIALS = [
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: '/images/footer/social-1.svg' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/', icon: '/images/footer/social-2.svg' },
  { name: 'Facebook', href: 'https://www.facebook.com/', icon: '/images/footer/social-3.svg' },
]

function FooterLink({ item }: { item: LinkItem }) {
  const label = item.label ?? ''
  if (!label) return null
  if (item.url) {
    return (
      <Link
        href={item.url}
        className="text-sm font-medium leading-[1.16] tracking-[-0.01em] text-white transition-opacity hover:opacity-80"
      >
        {label}
      </Link>
    )
  }
  return (
    <span className="text-sm font-medium leading-[1.16] tracking-[-0.01em] text-white">
      {label}
    </span>
  )
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
  const tagline = footer?.tagline ?? 'J.A.Z.Z. – Jeugdhulp en Ambulante Zorg met Zorgzaamheid.'
  const email = footer?.email ?? 'contact@burojazz.nl'
  const phone = footer?.phone ?? '+31 6 55202233'
  const address = footer?.address ?? 'Vlasakker 24, 3417 XT Montfoort'
  const menuItems = footer?.menuItems?.length ? footer.menuItems : FALLBACK_MENU
  const infoLinks = footer?.infoLinks?.length ? footer.infoLinks : FALLBACK_INFO
  const copyright =
    footer?.copyright ?? 'Copyright © Buro J.A.Z.Z. 2026 –– Alle rechten voorbehouden.'

  return (
    <footer className="overflow-hidden bg-brand text-white">
      <div className="mx-auto flex w-full max-w-[1512px] flex-col gap-14 px-6 pt-16 md:px-20 md:pt-20 lg:gap-[60px]">
        <div className="flex flex-col gap-6">
          {/* Top: about + link columns */}
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            {/* About */}
            <div className="flex max-w-[275px] flex-col items-start gap-6">
              <img
                src="/images/footer/logo.svg"
                alt="Buro J.A.Z.Z. logo"
                width={71}
                height={71}
                className="size-[71px]"
              />
              <p className="text-sm font-medium leading-[1.4] tracking-[-0.01em]">{tagline}</p>
            </div>

            {/* Link columns */}
            <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-x-[60px] sm:gap-y-10 lg:flex-nowrap">
              {/* Contact */}
              <div className="flex flex-col gap-4">
                <ColumnHeading>Contact</ColumnHeading>
                <ul className="flex flex-col gap-3.5">
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2 text-sm font-medium leading-[1.16] tracking-[-0.01em] transition-opacity hover:opacity-80"
                    >
                      <img src="/images/footer/icon-mail.svg" alt="" width={24} height={24} className="size-6" />
                      {email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${phone.replace(/\s+/g, '')}`}
                      className="flex items-center gap-2 text-sm font-medium leading-[1.16] tracking-[-0.01em] transition-opacity hover:opacity-80"
                    >
                      <img src="/images/footer/icon-phone.svg" alt="" width={24} height={24} className="size-6" />
                      {phone}
                    </a>
                  </li>
                  <li className="flex items-center gap-2 text-sm font-medium leading-[1.16] tracking-[-0.01em]">
                    <img src="/images/footer/icon-location.svg" alt="" width={24} height={24} className="size-6" />
                    {address}
                  </li>
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
                  <img
                    src="/images/footer/kiwa-iso9001.png"
                    alt="Kiwa Certified ISO 9001"
                    width={80}
                    height={90}
                    className="h-[90px] w-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
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
          <p className="pb-6 text-center text-sm font-medium leading-[1.5]">{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
