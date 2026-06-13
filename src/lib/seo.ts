import type { ComparisonPage, RouteView, SolutionPage } from '../app-types'

const defaultSiteTitle = 'Hermes Agent | A Persistent AI Agent That Remembers, Acts, and Improves'
const defaultSiteDescription =
  'Hermes Agent is not a disposable chatbot. It remembers context across sessions, uses 47 real tools to complete tasks, and improves through use. Self-hosted, model-agnostic, always on.'

const canonicalLinkId = 'hermes-canonical-link'
const structuredDataScriptId = 'hermes-structured-data'

type StructuredDataRecord = Record<string, unknown>

export type SeoDocument = {
  title: string
  description: string
  canonicalUrl: string
  robots: string
  structuredData: StructuredDataRecord[]
}

type BuildSeoDocumentArgs = {
  pathname: string
  routeView: RouteView
  publicAppOrigin: string
  supportEmail: string
  solutionPage: SolutionPage | null
  comparisonPage: ComparisonPage | null
}

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function normalizeOrigin(origin: string) {
  try {
    return new URL(origin).origin
  } catch {
    return window.location.origin
  }
}

function buildCanonicalUrl(origin: string, pathname: string) {
  return new URL(normalizePathname(pathname), `${normalizeOrigin(origin)}/`).toString()
}

function buildWebPageStructuredData(title: string, description: string, canonicalUrl: string): StructuredDataRecord {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
  }
}

function buildBreadcrumbStructuredData(
  origin: string,
  pathname: string,
  currentPageLabel: string,
): StructuredDataRecord | null {
  const normalizedPath = normalizePathname(pathname)

  if (normalizedPath === '/') {
    return null
  }

  const items: Array<{ name: string; item: string }> = [
    {
      name: 'Home',
      item: buildCanonicalUrl(origin, '/'),
    },
  ]

  if (normalizedPath.startsWith('/solutions/')) {
    items.push({
      name: 'Solutions',
      item: buildCanonicalUrl(origin, '/#solutions'),
    })
  } else if (normalizedPath.startsWith('/compare/')) {
    items.push({
      name: 'Compare',
      item: buildCanonicalUrl(origin, '/#compare'),
    })
  } else if (normalizedPath === '/plans') {
    items.push({
      name: 'Pricing',
      item: buildCanonicalUrl(origin, '/#pricing'),
    })
  }

  items.push({
    name: currentPageLabel,
    item: buildCanonicalUrl(origin, normalizedPath),
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

function buildFaqStructuredData(
  faqs: Array<{
    question: string
    answer: unknown
  }>,
): StructuredDataRecord | null {
  const mainEntity = faqs.flatMap((faq) => {
    if (typeof faq.answer !== 'string') {
      return []
    }

    return [
      {
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      },
    ]
  })

  if (mainEntity.length === 0) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }
}

function buildNotFoundSeoDocument(origin: string, pathname: string): SeoDocument {
  const title = 'Page not found | Hermes Agent'
  const description =
    'This Hermes Agent page could not be matched to a public marketing route. Return to the homepage to continue.'

  return {
    title,
    description,
    canonicalUrl: buildCanonicalUrl(origin, pathname),
    robots: 'noindex,nofollow',
    structuredData: [buildWebPageStructuredData(title, description, buildCanonicalUrl(origin, pathname))],
  }
}

export function buildSeoDocument({
  pathname,
  routeView,
  publicAppOrigin,
  supportEmail,
  solutionPage,
  comparisonPage,
}: BuildSeoDocumentArgs): SeoDocument {
  const normalizedPath = normalizePathname(pathname)
  const canonicalUrl = buildCanonicalUrl(publicAppOrigin, normalizedPath)

  if (routeView === 'home' && normalizedPath !== '/') {
    return buildNotFoundSeoDocument(publicAppOrigin, normalizedPath)
  }

  if (routeView === 'solution' && !solutionPage) {
    return buildNotFoundSeoDocument(publicAppOrigin, normalizedPath)
  }

  if (routeView === 'compare' && !comparisonPage) {
    return buildNotFoundSeoDocument(publicAppOrigin, normalizedPath)
  }

  if (routeView === 'home') {
    return {
      title: defaultSiteTitle,
      description: defaultSiteDescription,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Hermes Agent',
          url: canonicalUrl,
          email: supportEmail,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Hermes Agent',
          url: canonicalUrl,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Hermes Agent',
          description: defaultSiteDescription,
          serviceType: 'Managed Hermes Agent launch service',
          provider: {
            '@type': 'Organization',
            name: 'Hermes Agent',
          },
          areaServed: 'Worldwide',
          url: canonicalUrl,
        },
      ],
    }
  }

  if (routeView === 'solution' && solutionPage) {
    const title = `${solutionPage.title} | Hermes Agent`
    const description = `${solutionPage.summary} Hermes Agent supports memory, tools, multi-channel launch paths, and one console for follow-up operations.`

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        buildBreadcrumbStructuredData(publicAppOrigin, normalizedPath, solutionPage.title),
        buildFaqStructuredData(solutionPage.faqs),
      ].filter(Boolean) as StructuredDataRecord[],
    }
  }

  if (routeView === 'compare' && comparisonPage) {
    const title = `${comparisonPage.title} | Hermes Agent`
    const description = `${comparisonPage.summary} Compare memory, tool use, follow-through, and operational fit before choosing your agent path.`

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        buildBreadcrumbStructuredData(publicAppOrigin, normalizedPath, comparisonPage.title),
        buildFaqStructuredData(comparisonPage.faqs),
      ].filter(Boolean) as StructuredDataRecord[],
    }
  }

  if (routeView === 'privacy') {
    const title = 'Privacy Policy | Hermes Agent'
    const description =
      'Read how Hermes Agent processes visitor, account, order, payment, workspace, and support information.'

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        buildBreadcrumbStructuredData(publicAppOrigin, normalizedPath, 'Privacy Policy'),
      ].filter(Boolean) as StructuredDataRecord[],
    }
  }

  if (routeView === 'terms') {
    const title = 'Terms of Service | Hermes Agent'
    const description =
      'Review the Hermes Agent Terms of Service for account, order, payment, workspace, console, and support usage.'

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        buildBreadcrumbStructuredData(publicAppOrigin, normalizedPath, 'Terms of Service'),
      ].filter(Boolean) as StructuredDataRecord[],
    }
  }

  if (routeView === 'plans') {
    const title = 'Pricing Plans | Hermes Agent'
    const description =
      'Choose a Hermes Agent plan based on workspace volume, then continue into payment and console-based launch tracking.'

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index,follow',
      structuredData: [
        buildWebPageStructuredData(title, description, canonicalUrl),
        buildBreadcrumbStructuredData(publicAppOrigin, normalizedPath, 'Pricing Plans'),
      ].filter(Boolean) as StructuredDataRecord[],
    }
  }

  if (routeView === 'console') {
    const title = 'Console | Hermes Agent'
    const description =
      'Track Hermes Agent orders, launches, upgrades, and account operations inside the console.'

    return {
      title,
      description,
      canonicalUrl,
      robots: 'noindex,nofollow',
      structuredData: [buildWebPageStructuredData(title, description, canonicalUrl)],
    }
  }

  return buildNotFoundSeoDocument(publicAppOrigin, normalizedPath)
}

function upsertMeta(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`)

  if (!(element instanceof HTMLMetaElement)) {
    element = document.createElement('meta')
    element.setAttribute(attributeName, attributeValue)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertCanonicalLink(href: string) {
  let element =
    (document.head.querySelector(`#${canonicalLinkId}`) as HTMLLinkElement | null) ??
    (document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null)

  if (!(element instanceof HTMLLinkElement)) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  element.id = canonicalLinkId
  element.rel = 'canonical'
  element.href = href
}

function upsertStructuredData(structuredData: StructuredDataRecord[]) {
  let element = document.head.querySelector(`#${structuredDataScriptId}`) as HTMLScriptElement | null

  if (!(element instanceof HTMLScriptElement)) {
    element = document.createElement('script')
    element.id = structuredDataScriptId
    element.type = 'application/ld+json'
    document.head.appendChild(element)
  }

  const payload =
    structuredData.length <= 1
      ? structuredData[0] ?? {}
      : {
          '@context': 'https://schema.org',
          '@graph': structuredData.map((item) => {
            const { '@context': _context, ...rest } = item
            return rest
          }),
        }

  element.textContent = JSON.stringify(payload)
}

export function syncSeoDocument(seo: SeoDocument) {
  document.title = seo.title

  upsertMeta('name', 'description', seo.description)
  upsertMeta('name', 'robots', seo.robots)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:site_name', 'Hermes Agent')
  upsertMeta('property', 'og:title', seo.title)
  upsertMeta('property', 'og:description', seo.description)
  upsertMeta('property', 'og:url', seo.canonicalUrl)
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', seo.title)
  upsertMeta('name', 'twitter:description', seo.description)
  upsertCanonicalLink(seo.canonicalUrl)
  upsertStructuredData(seo.structuredData)
}
