// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Databanken',
  tagline: 'Cursus databanken en SQL',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  // Eigen domein op de root (zie static/CNAME), dus niet meer het github.io-adres.
  url: 'https://databanken.apload.be',
  // Op een eigen domein staat de site op de root, dus baseUrl is '/', niet '/cursus-databanken/'.
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'StephaneVanRossem02', // GitHub-gebruiker/organisatie.
  projectName: 'cursus-databanken', // Naam van de GitHub-repo.

  onBrokenLinks: 'throw',

  // Instellingen voor de oefening-assistent (databanken-tutor). Zie
  // src/components/OefeningAssistent/config.js voor alle opties en standaardwaarden.
  // workerUrl wijst naar de Cloudflare Worker die de modeloplossing server-side bij de
  // prompt plakt. Zolang die niet gedeployd is, valt de assistent terug op een
  // rechtstreekse Gemini-aanroep zonder oplossing (dat is bewust).
  customFields: {
    oefeningAssistent: {
      workerUrl:
        process.env.OEFENING_ASSISTENT_WORKER_URL ||
        'https://oefening-assistent-databanken.stephanevanrossem2.workers.dev',
    },
    // Vrijgavecodes voor de modeloplossingen (component Modeloplossing), EEN CODE PER LABO.
    // Deel de code van een labo pas met studenten wanneer je dat labo wil vrijgeven.
    // Wijzig gerust een waarde hieronder. Let op: dit is een lichte afscherming
    // (client-side), geen harde beveiliging. Een code ontgrendelt enkel dat ene labo,
    // en blijft daarna open op het toestel van de student.
    oplossing: {
      codes: {
        '01': 'mango-47',
        '02': 'vlinder-83',
        '03': 'kiwi-29',
        '04': 'anker-61',
        '05': 'druif-15',
        '06': 'tulp-90',
        '07': 'kompas-38',
        '08': 'pinguin-72',
        '09': 'kaneel-54',
        '10': 'wafel-26',
        '11': 'klaver-88',
        '12': 'haven-33',
        '13': 'ster-46',
        '14': 'lelie-19',
        '15': 'kabel-77',
        '16': 'peper-52',
        '17': 'wolk-64',
        '18': 'gember-31',
        '19': 'raket-95',
        '20': 'otter-28',
        '21': 'kwarts-70',
      },
    },
  },

  // .md-bestanden als CommonMark verwerken (niet MDX), zodat losse `<` en `{`
  // in prozatekst en SQL-codevoorbeelden de build niet breken.
  markdown: {
    format: 'detect',
    mermaid: true,
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: ['docs', 'oefeningen'],
        docsDir: ['docs', 'oefeningen'],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
      }),
    ],
  ],

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Tweede docs-instantie voor de labo's/oefeningen (aparte navbar-tab).
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'oefeningen',
        path: 'oefeningen',
        routeBasePath: 'oefeningen',
        sidebarPath: './sidebarsOefeningen.js',
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.svg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Databanken',
        logo: {
          alt: 'Logo Databanken',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Cursus',
          },
          {
            type: 'docSidebar',
            sidebarId: 'oefeningenSidebar',
            docsPluginId: 'oefeningen',
            position: 'left',
            label: 'Oefeningen',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Inhoud',
            items: [
              {
                label: 'Cursus',
                to: '/docs/',
              },
              {
                label: 'Oefeningen',
                to: '/oefeningen/',
              },
            ],
          },
          {
            title: 'Naslag',
            items: [
              {
                label: 'MySQL-documentatie',
                href: 'https://dev.mysql.com/doc/',
              },
              {
                label: 'SQL-referentie (W3Schools)',
                href: 'https://www.w3schools.com/sql/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cursus Databanken.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
        additionalLanguages: ['sql'],
      },
    }),
};

export default config;
