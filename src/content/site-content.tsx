import { CircleHelp, Layers3, Rocket } from 'lucide-react'

import {
  ClaudeLogo,
  DiscordLogo,
  GlmLogo,
  GeminiLogo,
  OpenAILogo,
  TelegramLogo,
  WhatsAppLogo,
} from '../components/logos'
import { annualBillingMultiplier, channelCatalog, modelCatalog, planCatalog } from './catalog'
import type {
  AuthFormState,
  ComparisonPage,
  CreateUserFormState,
  FaqItem,
  Feature,
  GuideChannel,
  GuideContent,
  LegalSection,
  NavItem,
  Option,
  Plan,
  SolutionPage,
} from '../app-types'

export const supportEmail = 'support@aigeamy.com'

export const navItems: NavItem[] = [
  { href: '#features', label: 'Features', icon: Layers3 },
  { href: '#solutions', label: 'Solutions', icon: Layers3 },
  { href: '#compare', label: 'Compare', icon: CircleHelp },
  { href: '#pricing', label: 'Pricing', icon: Rocket },
  { href: '#faq', label: 'FAQ', icon: CircleHelp },
]

export const privacySections: LegalSection[] = [
  {
    title: 'Scope and overview',
    paragraphs: [
      'This Privacy Policy describes how Hermes Agent collects, uses, stores, and discloses information when visitors access our website, create an account, start a workspace launch, pay for a plan, open the console, contact support, or otherwise use any related features, pages, APIs, and services we make available.',
      'This Policy is intended to be read together with our Terms of Service. By accessing or using the service, you acknowledge that certain information must be processed in order for the website, account system, checkout flow, workspace launch tracking, console access, and support functions to operate.',
    ],
  },
  {
    title: 'Information we collect',
    paragraphs: [
      'We may collect information you provide directly, information created through your use of the service, and limited technical information collected automatically by the website and backend systems.',
    ],
    bullets: [
      'Account and contact information, such as name, email address, login credentials, and account role information if you register or are created as an operator by an administrator.',
      'Order and plan information, such as selected model, selected channel, billing cycle, plan choice, price, order identifiers, payment status, workspace status, and related timestamps.',
      'Channel connection information, such as a Telegram, Discord, or WhatsApp token or similar communication credential when you choose to provide one.',
      'Guest access and session information, such as guest tokens, session cookies, checkout paths, console paths, and account-binding state needed to let unpaid, paid, guest, and logged-in flows function correctly.',
      'Deployment and runtime information, such as target server labels, Hermes Agent version, workspace names, workspace paths, deployment logs, upgrade status, console URLs, service names, and similar operational metadata.',
      'Support and communications, including messages you send to us through support channels or by email.',
      'Technical usage data, such as IP-derived request context, browser metadata ordinarily transmitted in HTTP requests, request timestamps, and error or diagnostic records reasonably required for service security and troubleshooting.',
    ],
  },
  {
    title: 'How we use information',
    paragraphs: [
      'We use information only to the extent reasonably necessary to operate, secure, improve, support, and enforce the service and our legitimate business operations.',
    ],
    bullets: [
      'To create, maintain, and administer accounts, guest sessions, and workspace launch records.',
      'To create checkout sessions, process plan purchases, reconcile payment events, and maintain billing records.',
      'To provision, track, operate, upgrade, and troubleshoot Hermes Agent workspaces and related console access.',
      'To store channel credentials you submit for later gateway binding or deployment-related use.',
      'To respond to support requests, account issues, payment issues, operational incidents, and abuse reports.',
      'To detect misuse, fraud, unauthorized access, payment abuse, deployment misuse, or other activity that could affect the security or integrity of the service.',
      'To comply with applicable law, regulation, lawful requests, or contractual obligations imposed on us by payment providers, infrastructure providers, or similar vendors.',
    ],
  },
  {
    title: 'How we handle sensitive credentials',
    paragraphs: [
      'The service may receive channel tokens, guest access tokens, session material, deployment-related secrets, and other credentials or quasi-credentials required for the service to function. We seek to limit exposure of such data and use technical measures reasonably designed to reduce unnecessary disclosure.',
      'Where supported by the application, certain credentials are encrypted before persistence or otherwise stored in a form intended to reduce plain-text exposure. Even so, no method of transmission, storage, or processing is guaranteed to be absolutely secure, and we cannot warrant that any system will be immune from compromise, interception, or unauthorized access.',
    ],
  },
  {
    title: 'Payments and third-party providers',
    paragraphs: [
      'Payment processing is handled through third-party payment service providers. We do not represent that full payment card details are stored by our website. Payment pages, card fields, billing verification, live payment enablement, and similar payment functions may be provided or controlled by the third-party processor.',
      'We may share order identifiers, plan details, price information, customer email information, return URLs, and limited transaction metadata with the payment processor to create and manage checkout sessions, confirm payment status, and handle payment-related support or reconciliation.',
    ],
  },
  {
    title: 'When we disclose information',
    paragraphs: [
      'We do not sell personal information in the ordinary course of operating this website. We may disclose information only as reasonably necessary in the following circumstances:',
    ],
    bullets: [
      'To infrastructure, hosting, deployment, payment, or technical service providers that help us operate the service.',
      'To protect the security, rights, property, users, systems, or lawful interests of Hermes Agent, our users, or third parties.',
      'To comply with law, regulation, court order, lawful subpoena, governmental request, or similar legal process.',
      'In connection with a merger, acquisition, financing, reorganization, sale of assets, or similar transaction, subject to appropriate confidentiality handling where reasonably practicable.',
    ],
  },
  {
    title: 'Data retention',
    paragraphs: [
      'We retain information for as long as reasonably necessary for the purposes described in this Policy, including account administration, order history, payment reconciliation, deployment operations, fraud prevention, dispute handling, security logging, and compliance obligations.',
      'Retention periods may vary depending on the type of information, the status of the account or order, technical requirements of the service, and legal or operational obligations. We may delete, anonymize, aggregate, or de-identify information when we determine it is no longer reasonably required.',
    ],
  },
  {
    title: 'Your choices and rights',
    paragraphs: [
      'Depending on your location and applicable law, you may have rights to request access to, correction of, or deletion of certain personal information that we hold about you, subject to lawful exceptions and operational limitations.',
      'You may also choose not to provide certain information, but some website features, deployment functions, account features, checkout flows, or console access functions may not operate correctly without the required information.',
    ],
  },
  {
    title: 'Cookies, sessions, and guest access',
    paragraphs: [
      'The website uses cookies, guest tokens, session identifiers, URL parameters, and similar state mechanisms to maintain login state, allow guest checkout and guest console access, preserve account binding state, and support related functionality.',
      'If you disable cookies or similar browser storage behavior, some features may be unavailable or may not work as intended.',
    ],
  },
  {
    title: 'International processing and security',
    paragraphs: [
      'Information may be processed on systems and by providers located in jurisdictions different from your own. By using the service, you understand that information may be transferred to and processed in such locations, subject to the operational choices of the service and its providers.',
      'We implement measures we consider commercially reasonable in light of the nature of the service, but no service can guarantee perfect security, uninterrupted availability, or absolute prevention of accidental loss, misuse, unauthorized disclosure, or unauthorized modification.',
    ],
  },
  {
    title: 'Changes and contact',
    paragraphs: [
      'We may update this Privacy Policy from time to time by posting an updated version on the website. The updated version will apply from the time it is posted unless otherwise stated.',
      `If you have questions about this Privacy Policy, you may contact us at ${supportEmail}.`,
    ],
  },
]

export const termsSections: LegalSection[] = [
  {
    title: 'Acceptance of terms',
    paragraphs: [
      'These Terms of Service govern access to and use of Hermes Agent, including our website, order flow, checkout-related features, console access, account features, workspace launch tracking, upgrade functions, APIs, and related operational services.',
      'By accessing or using the service, you agree to be bound by these Terms. If you do not agree, you must not access or use the service.',
    ],
  },
  {
    title: 'Nature of the service',
    paragraphs: [
      'Hermes Agent is a self-hosted AI agent product and launch service that provides a website-based flow for selecting a model, connecting an initial channel, creating orders, initiating payment, tracking workspace state, opening a control console, and managing related operational functions.',
      'Unless expressly stated otherwise, the service is offered on an as-available and as-provided basis and may evolve over time. Features, flows, payment methods, integrations, launch methods, and supported channels may change, be suspended, or be removed without creating an obligation to continue any particular function indefinitely.',
    ],
  },
  {
    title: 'Eligibility and account responsibility',
    paragraphs: [
      'You represent that you have legal capacity to enter into these Terms and to use the service in compliance with applicable law. If you use the service on behalf of an entity, you represent that you have authority to bind that entity to these Terms.',
      'You are responsible for maintaining the confidentiality of your account credentials, session state, guest access links, console links, and any third-party channel credentials you choose to submit through the service.',
    ],
  },
  {
    title: 'Orders, checkout, and payment',
    paragraphs: [
      'Submitting a launch flow, selecting a plan, or creating an order does not guarantee successful payment, successful workspace launch, uninterrupted console access, or future service availability. Payment processing is performed through third-party providers and remains subject to their approval, risk review, technical availability, and operating rules.',
      'Prices, billing cycle labels, workspace entitlements, and package descriptions are displayed on the site, but final checkout availability, payment acceptance, tax treatment, currency handling, and live-payment enablement may depend on the payment provider and associated merchant account status.',
      'You authorize us and our payment service providers to process the applicable transaction information necessary to create and manage your checkout session. We are not responsible for card network decisions, bank declines, fraud screening outcomes, live-payment enablement decisions, or payment-provider account limitations imposed by third parties.',
    ],
  },
  {
    title: 'Workspace launch and operational limitations',
    paragraphs: [
      'The service may provide workspace launch tracking, console access, and Hermes Agent operations, but we do not guarantee that every order will result in successful launch, successful channel binding, uninterrupted service, or uninterrupted third-party provider availability.',
      'Launch outcomes may depend on infrastructure state, third-party repositories, network reachability, payment confirmation, server configuration, provider APIs, firewall configuration, operating system behavior, and other factors beyond our direct control.',
      'Estimated launch times, status messages, version labels, or package descriptions are informational only and do not constitute a strict service commitment unless we expressly agree otherwise in writing.',
    ],
  },
  {
    title: 'Acceptable use',
    paragraphs: [
      'You may not use the service in a manner that is unlawful, fraudulent, abusive, infringing, harmful to systems or networks, or reasonably likely to interfere with our operations or the use of the service by others.',
    ],
    bullets: [
      'Attempting to bypass authentication, access controls, payment controls, or launch safeguards.',
      'Submitting credentials, channel tokens, payment information, or other information that you are not authorized to use.',
      'Using the service to send unlawful, abusive, deceptive, or malicious content through third-party channels.',
      'Interfering with or overloading the service, payment flow, console flow, API endpoints, or deployment systems.',
      'Reverse engineering, scraping, or automating the service in a way that is abusive or not reasonably permitted by us.',
    ],
  },
  {
    title: 'Third-party services and dependencies',
    paragraphs: [
      'The service depends on third-party services, including payment services, network services, hosting services, software repositories, model providers, and channel providers. We do not control those services and are not responsible for their availability, policy changes, outages, errors, delays, risk decisions, suspensions, or content.',
      'Use of any third-party service, including payment pages or chat-channel integrations, may also be subject to that third party’s own terms, policies, and operational restrictions.',
    ],
  },
  {
    title: 'Intellectual property and site content',
    paragraphs: [
      'As between you and Hermes Agent, we retain all rights, title, and interest in the website, service design, text, branding, UI, software logic, operational flows, documentation, and related materials, except to the extent rights are expressly granted by law or by written agreement.',
      'Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable right to access and use the service for its intended purpose.',
    ],
  },
  {
    title: 'Disclaimers',
    paragraphs: [
      'To the maximum extent permitted by applicable law, the service is provided on an as is, as available, and with all faults basis. We disclaim warranties of any kind, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, quiet enjoyment, availability, and accuracy.',
      'We do not warrant that the service will be uninterrupted, error-free, fully secure, always timely, or compatible with every device, browser, network environment, payment-provider state, deployment environment, or third-party integration.',
    ],
  },
  {
    title: 'Limitation of liability',
    paragraphs: [
      'To the maximum extent permitted by applicable law, Hermes Agent and its operators will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of revenue, profit, business, goodwill, use, opportunity, or data, arising out of or related to the service.',
      'To the maximum extent permitted by applicable law, our aggregate liability for claims arising out of or related to the service will not exceed the amount actually paid by you to us for the specific order or service giving rise to the claim during the twelve months preceding the event giving rise to liability, or one hundred U.S. dollars, whichever is greater.',
    ],
  },
  {
    title: 'Suspension and termination',
    paragraphs: [
      'We may suspend, restrict, or terminate access to the service at any time if we reasonably believe it is necessary to protect the service, comply with law, respond to abuse, enforce these Terms, address payment or security issues, or prevent harm to us, our providers, or other users.',
      'Termination or suspension does not waive any accrued rights, obligations, payment responsibilities, or limitations of liability that by their nature should survive.',
    ],
  },
  {
    title: 'Changes and contact',
    paragraphs: [
      'We may revise these Terms from time to time by posting an updated version on the website. Continued use of the service after an updated version becomes effective constitutes acceptance of the revised Terms.',
      `If you have questions about these Terms, you may contact us at ${supportEmail}.`,
    ],
  },
]

export const models: Option[] = modelCatalog.map((model) => ({
  ...model,
  icon:
    model.id.startsWith('glm')
      ? <GlmLogo />
      : model.id.startsWith('claude')
        ? <ClaudeLogo />
        : model.id.startsWith('gpt')
          ? <OpenAILogo />
          : <GeminiLogo />,
}))

export const channels: Option[] = channelCatalog.map((channel) => ({
  ...channel,
  icon:
    channel.id === 'telegram'
      ? <TelegramLogo />
      : channel.id === 'discord'
        ? <DiscordLogo />
        : <WhatsAppLogo />,
}))

export const channelBadges = ['Slack', 'Signal', 'Feishu', 'DingTalk', 'Email', 'API']

export const features: Feature[] = [
  {
    title: 'Memory that persists',
    description:
      'Your context, carried forward across every session. Preferences, project state, and prior decisions stay warm — Hermes never starts from zero.',
  },
  {
    title: '47 tools that act',
    description:
      'Web search, terminal, browser automation, file management, code execution, image generation — the agent doesn’t just answer, it does.',
  },
  {
    title: 'Skills that compound',
    description: (
      <>
        Repeated workflows become reusable skills automatically. The more you use Hermes,
        the sharper it gets — not a <strong>static prompt wrapper</strong>.
      </>
    ),
  },
  {
    title: 'Any model, one runtime',
    description:
      'Claude, GPT, Gemini, DeepSeek, Ollama — switch providers without rebuilding your agent or losing the operating layer.',
  },
  {
    title: 'Multi-platform gateway',
    description:
      'Launch from Telegram, Discord, or WhatsApp first, then expand into Slack, Signal, Feishu, DingTalk, Email, and API as your footprint grows.',
  },
  {
    title: 'Your infrastructure, your data',
    description:
      'Full data sovereignty. Run Hermes on servers you control, manage deployments, upgrades, and operators from one console.',
  },
]

export const plans: Plan[] = planCatalog

export const faqs: FaqItem[] = [
  {
    question: 'Do I need my own server before I start?',
    answer:
      'Not to begin. Hermes Agent is a self-hosted AI agent framework, but this launch flow is designed for teams that want a faster path to a working workspace without assembling every layer by hand on day one.',
  },
  {
    question: 'How is Hermes Agent different from a normal chatbot?',
    answer:
      'A normal chatbot answers inside one conversation. Hermes Agent is meant to keep memory across sessions, use tools, retain preferences, and carry multi-step work forward over time.',
  },
  {
    question: 'Which channels can I start with?',
    answer:
      'The launch flow starts with Telegram, Discord, or WhatsApp. After the first workspace is live, Hermes can expand into broader gateway integrations such as Slack, Signal, Email, and API-driven entry points.',
  },
  {
    question: 'Who is Hermes Agent best for?',
    answer:
      'It fits founders, operators, lean teams, and experts who need continuity, tool use, and visible task ownership instead of a prompt-only assistant that forgets everything between sessions.',
  },
  {
    question: 'When should I stay fully self-hosted?',
    answer:
      'Stay fully self-hosted when your team must control every infrastructure, hardening, upgrade, and rollback decision directly from the start. This managed launch path is better when you want Hermes online faster with less repeated setup work.',
  },
  {
    question: 'How can I contact support before I buy?',
    answer: (
      <>
        Reach us any time at{' '}
        <a href={`mailto:${supportEmail}`} className="inline-link">
          {supportEmail}
        </a>{' '}
        if you want help choosing a plan, model, channel, or rollout path.
      </>
    ),
  },
]

export const solutionPages: SolutionPage[] = [
  {
    href: '/solutions/personal-agent',
    label: 'Personal Agent',
    eyebrow: 'Solutions',
    title: 'Hermes Agent as a personal agent',
    summary:
      'Give an individual operator a durable AI partner that remembers preferences, keeps priorities warm, and follows work across meetings, inboxes, and decisions.',
    definition:
      'Hermes Agent as a personal agent means a persistent AI assistant with memory, tools, and durable context rather than a disposable chat tab.',
    facts: [
      'Hermes Agent can persist context across sessions instead of starting blank each time.',
      'It combines memory, tool use, and multi-step execution in one operating layer.',
      'It works well for founders, creators, executives, and solo operators who need continuity.',
      'It can start from a messaging channel and expand into a broader workspace later.',
    ],
    bestFor: ['Founders and solo operators', 'Executives needing a chief-of-staff style assistant', 'Experts with recurring research and follow-up work'],
    notFor: [
      'One-off prompting with no need for memory',
      'Teams that only need a simple FAQ bot',
      'Use cases where no tool use or follow-through is required',
    ],
    outcomes: ['Less repeated briefing', 'Better priority continuity', 'A more durable daily operating assistant'],
    workflow: [
      'Choose the model and first channel that fit the user’s daily operating style.',
      'Launch the workspace and save the first credential so Hermes can stay reachable.',
      'Let memory, skills, and tool use compound as the agent learns recurring work.',
    ],
    conclusion:
      'Choose the personal-agent framing when the real need is continuity: one agent that remembers, helps, and follows through across the user’s ongoing responsibilities.',
    faqs: [
      {
        question: 'Is this only for executives or can individuals use it too?',
        answer:
          'Individuals can absolutely use it. The personal-agent story is strongest anywhere durable context, preference memory, and follow-through matter more than flashy one-shot answers.',
      },
      {
        question: 'Why not just use a normal AI chat app for this?',
        answer:
          'Because a normal chat app usually loses context between tasks. Hermes Agent becomes more useful over time because it can remember, use tools, and keep a longer-running operating thread.',
      },
      {
        question: 'What kinds of work fit best here?',
        answer:
          'Daily briefs, research threads, inbox preparation, meeting follow-up, and any personal workflow where the cost of re-explaining context keeps showing up.',
      },
    ],
  },
  {
    href: '/solutions/digital-employee',
    label: 'Digital Employee',
    eyebrow: 'Solutions',
    title: 'Hermes Agent as an AI digital employee',
    summary:
      'Frame Hermes as a worker-like system for owned slices of operational work, where memory, tools, and visible follow-through matter more than one clever response.',
    definition:
      'Hermes Agent as an AI digital employee means an always-on operator that can remember context, use tools, and complete repeatable work with clearer ownership.',
    facts: [
      'The digital-employee framing fits teams replacing repeated manual coordination.',
      'Hermes Agent can carry context across work sessions instead of restarting every task.',
      'Tool use makes it possible to inspect systems, update records, and close loops.',
      'The launch flow shortens the path from selection to a working Hermes workspace.',
    ],
    bestFor: ['Operations and support teams', 'Lean companies replacing repetitive coordination', 'Teams who want visible agent follow-through'],
    notFor: [
      'Organizations that need full custom infrastructure ownership immediately',
      'Work that is too narrow for an agent and better served by static automation',
      'Teams looking only for a lightweight chatbot interface',
    ],
    outcomes: ['More accountable recurring work', 'Fewer manual handoffs', 'A clearer operator layer for repeatable tasks'],
    workflow: [
      'Choose the model and first channel that match the team’s operating lane.',
      'Launch the workspace, open the console, and connect the first workflow entry point.',
      'Add skills, tools, and repeat loops so Hermes can own a narrower but real slice of team work.',
    ],
    conclusion:
      'Use the digital-employee framing when the business wants an agent that can keep state warm, act through systems, and own repeatable work instead of behaving like a temporary assistant tab.',
    faqs: [
      {
        question: 'What makes the digital-employee framing credible?',
        answer:
          'It only works when the product has memory, tools, and visible task completion. Hermes Agent is useful here because it is not only answering questions; it can carry context and act.',
      },
      {
        question: 'Is this the same as replacing a whole team?',
        answer:
          'No. The best framing is narrower: Hermes should own specific recurring lanes of work, reduce coordination drag, and keep operators more focused, not pretend to replace an entire department overnight.',
      },
      {
        question: 'Which teams benefit most?',
        answer:
          'Lean operations, support, internal tooling, and coordination-heavy teams where too much work still depends on people restating context and manually pushing the next step.',
      },
    ],
  },
  {
    href: '/solutions/task-automation',
    label: 'Task Automation',
    eyebrow: 'Solutions',
    title: 'Hermes Agent for AI task automation',
    summary:
      'Move beyond rigid triggers and one-shot flows by giving an agent memory, tools, and the ability to handle branching, multi-step work.',
    definition:
      'Hermes Agent for AI task automation means a tool-using agent that can remember prior context, adapt to changing conditions, and complete multi-step work instead of only executing fixed rules.',
    facts: [
      'Hermes Agent is stronger than brittle automation when the work has exceptions or branching logic.',
      'Memory helps the agent resume work with less re-briefing.',
      'Tool access lets Hermes inspect systems, gather evidence, and take action.',
      'The workspace can start from one channel and grow into a broader automation surface later.',
    ],
    bestFor: ['Teams with recurring multi-step processes', 'Operators dealing with changing inputs and exceptions', 'Workflows that need summaries as well as action'],
    notFor: [
      'Single-step automations with no branching or context',
      'Jobs solved perfectly by a fixed rule engine',
      'Use cases where no human-readable summary or adaptive behavior is needed',
    ],
    outcomes: ['Better multi-step execution', 'Less brittle workflow behavior', 'A stronger bridge between memory and action'],
    workflow: [
      'Choose the model and first interface that match the workflow lane.',
      'Launch the workspace and save the first credential so Hermes can start operating immediately.',
      'Connect tools and let Hermes handle multi-step work loops with more context and clearer summaries.',
    ],
    conclusion:
      'Choose the task-automation framing when the real challenge is not triggering a task once, but keeping context, handling exceptions, and finishing a chain of work without starting from zero each time.',
    faqs: [
      {
        question: 'How is this different from a normal workflow bot?',
        answer:
          'A workflow bot is strongest when the path is fixed. Hermes Agent matters when the work branches, the context changes, and the agent needs memory plus tool use to finish the job.',
      },
      {
        question: 'Does every automation need Hermes?',
        answer:
          'No. If the workflow is fully deterministic and never needs context or judgment, simpler automation can be better. Hermes is valuable when the work becomes dynamic.',
      },
      {
        question: 'What kinds of tasks fit best?',
        answer:
          'Research loops, support triage, monitoring follow-up, reporting workflows, and operational jobs where the system needs to check current state, take action, and return a readable outcome.',
      },
    ],
  },
]

export const comparisonPages: ComparisonPage[] = [
  {
    href: '/compare/hermes-vs-chatbots',
    label: 'Vs Chatbots',
    eyebrow: 'Compare',
    title: 'Hermes Agent vs a normal AI chatbot',
    summary:
      'If you need continuity, memory, tool use, and multi-step follow-through, Hermes Agent is the stronger fit. A normal chatbot is still useful for quick questions and disposable conversations.',
    alternativeName: 'AI chatbot',
    chooseLaunch: [
      'You want the agent to remember context across sessions',
      'You need tools, system reach, and more than text-only answers',
      'You want the agent to carry tasks forward instead of ending with the conversation',
    ],
    chooseAlternative: [
      'You only need one-off answers and simple drafting',
      'You do not need memory, tool use, or follow-through',
      'A disposable conversation is good enough for the work',
    ],
    rows: [
      {
        label: 'Memory',
        launch: 'Keeps durable context, preferences, and prior actions warm across sessions',
        alternative: 'Usually starts fresh and depends on the current conversation only',
      },
      {
        label: 'Tool use',
        launch: 'Can act through tools, files, browsers, commands, and external systems',
        alternative: 'Often stops at explanation or lightweight built-in actions',
      },
      {
        label: 'Follow-through',
        launch: 'Better suited to multi-step work that continues between tasks',
        alternative: 'Best for one conversation and one immediate response',
      },
      {
        label: 'Best fit',
        launch: 'Founders, operators, and teams wanting a durable AI worker',
        alternative: 'Users who only need quick answers and lightweight drafting help',
      },
    ],
    faqs: [
      {
        question: 'Is a chatbot always the wrong choice?',
        answer:
          'No. A chatbot is still useful for lightweight Q&A, drafting, or one-off interactions. Hermes becomes the better fit when the cost of forgetting context starts slowing real work down.',
      },
      {
        question: 'What does Hermes add beyond better answers?',
        answer:
          'It adds continuity, memory, tool use, and a stronger ability to carry work across time instead of ending value at the last message in the thread.',
      },
      {
        question: 'Who feels the difference most quickly?',
        answer:
          'People with recurring responsibilities, shared tools, and workflows that return day after day. That is where memory and follow-through stop being optional and start being the whole point.',
      },
    ],
  },
  {
    href: '/compare/hermes-vs-workflow-bots',
    label: 'Vs Workflow Bots',
    eyebrow: 'Compare',
    title: 'Hermes Agent vs a rigid workflow bot',
    summary:
      'Choose Hermes Agent when the work has exceptions, changing context, and multi-step loops. Stay with a workflow bot when the process is linear, rule-driven, and fully predictable.',
    alternativeName: 'Workflow bot',
    chooseLaunch: [
      'The task branches and cannot be expressed as one rigid rule chain',
      'The agent needs memory about prior state or user preferences',
      'You want a readable summary and adaptive behavior, not only a trigger firing',
    ],
    chooseAlternative: [
      'The workflow is fixed, deterministic, and easy to encode as rules',
      'No durable context is required between runs',
      'You only need a narrow automation lane with minimal judgment',
    ],
    rows: [
      {
        label: 'Context',
        launch: 'Carries prior state, user context, and earlier actions into the next task',
        alternative: 'Usually depends on current inputs and fixed rules only',
      },
      {
        label: 'Adaptability',
        launch: 'Handles branching logic, ambiguity, and changing system state better',
        alternative: 'Works best when every path is known in advance',
      },
      {
        label: 'Execution style',
        launch: 'Combines reasoning, tool use, and follow-up into one operating loop',
        alternative: 'Executes the pre-defined automation and stops there',
      },
      {
        label: 'Best fit',
        launch: 'Dynamic work loops with exceptions and multi-step judgment',
        alternative: 'Stable, repeated processes with very low ambiguity',
      },
    ],
    faqs: [
      {
        question: 'Does Hermes replace all workflow bots?',
        answer:
          'No. Fixed, deterministic automations are still great when the work is narrow and predictable. Hermes is for the messier category where context, branching, and judgment keep showing up.',
      },
      {
        question: 'What is the main gain over rigid automation?',
        answer:
          'The main gain is not only more steps. It is the ability to remember, adapt, inspect real-world state, and explain what changed after the job is done.',
      },
      {
        question: 'What type of team should choose Hermes here?',
        answer:
          'Teams running recurring operational loops, research flows, reporting chains, or support triage where simple triggers keep breaking once real variation enters the process.',
      },
    ],
  },
]

export const guideContent: Record<GuideChannel, GuideContent> = {
  telegram: {
    title: 'Telegram gateway setup',
    steps: [
      'Open BotFather in Telegram and create or choose your bot.',
      'Copy the HTTP API token BotFather gives you.',
      'Paste that token here so Hermes Agent can save it for the first workspace launch.',
    ],
    tokenLabel: 'Telegram bot token',
    tokenPlaceholder: '123456:telegram-bot-token',
    phone: {
      avatar: 'TG',
      name: 'BotFather',
      subtitle: 'Telegram setup',
      lead: { text: 'Use BotFather to create a bot and copy its API token.', time: '10:14', tone: 'incoming' },
      quickActions: [
        { title: '/newbot', subtitle: 'Create a new Telegram bot' },
        { title: '/token', subtitle: 'Reveal the bot API token again' },
      ],
      outgoing: { text: 'I need the token for my Hermes Agent setup.', time: '10:16', tone: 'outgoing' },
      reply: { text: 'Copy the API token, then save it in the launch flow.', time: '10:17', tone: 'incoming' },
      composer: 'Paste Telegram bot token',
    },
  },
  discord: {
    title: 'Discord gateway setup',
    steps: [
      'Open the Discord Developer Portal and create or choose your application.',
      'Add a bot user, then copy the bot token from the Bot page.',
      'Paste the bot token here so Hermes Agent can keep the first channel credential ready.',
    ],
    tokenLabel: 'Discord bot token',
    tokenPlaceholder: 'discord-bot-token',
    phone: {
      avatar: 'DC',
      name: 'Discord Dev Portal',
      subtitle: 'Bot setup',
      lead: { text: 'Create an application, add a bot, and copy the bot token.', time: '09:42', tone: 'incoming' },
      quickActions: [
        { title: 'New Application', subtitle: 'Create the Discord app shell' },
        { title: 'Reset Token', subtitle: 'Generate a fresh bot token' },
      ],
      outgoing: { text: 'I need the saved token before I launch Hermes.', time: '09:44', tone: 'outgoing' },
      reply: { text: 'Copy the token from the Bot page, then store it here.', time: '09:45', tone: 'incoming' },
      composer: 'Paste Discord bot token',
    },
  },
  whatsapp: {
    title: 'WhatsApp gateway setup',
    steps: [
      'Open your WhatsApp provider dashboard and choose the app or sender you want to connect.',
      'Generate or copy the API token that will be used for message delivery.',
      'Paste that token here so Hermes Agent can retain it for the initial gateway launch.',
    ],
    tokenLabel: 'WhatsApp API token',
    tokenPlaceholder: 'whatsapp-api-token',
    phone: {
      avatar: 'WA',
      name: 'WhatsApp Provider',
      subtitle: 'Channel setup',
      lead: { text: 'Copy the API token from your WhatsApp provider dashboard.', time: '11:03', tone: 'incoming' },
      quickActions: [
        { title: 'Create Sender', subtitle: 'Prepare a WhatsApp sender' },
        { title: 'Generate Token', subtitle: 'Issue a channel API credential' },
      ],
      outgoing: { text: 'I want the token saved before Hermes goes live.', time: '11:05', tone: 'outgoing' },
      reply: { text: 'Paste the API token in the launch flow and continue to pricing.', time: '11:06', tone: 'incoming' },
      composer: 'Paste WhatsApp API token',
    },
  },
}

export const initialGuideInputs: Record<GuideChannel, string> = {
  telegram: '',
  discord: '',
  whatsapp: '',
}

export const initialAuthForm: AuthFormState = {
  name: '',
  email: '',
  password: '',
}

export const initialCreateUserForm: CreateUserFormState = {
  name: '',
  email: '',
  password: '',
  role: 'operator',
}

export { annualBillingMultiplier }
