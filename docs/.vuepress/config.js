module.exports = {
  title: 'Geek Instructables',
  base: '/',
  head: [
    ['link', { rel: "icon", href: "/favicon.png"}],
  ],
  themeConfig: {
    sidebar: [
      '/',
      '/exclude-branch-github-action/',
      '/expose-local-service/',
      '/nodemcu-bmp280/',
      '/nodemcu-connect-mqtt/',
      '/nodemcu-connect-to-wifi/',
      '/nodemcu-deep-sleep/',
      '/nodemcu-i2c-lcd/',
    ],
    repo: 'jesusgn90/geek-instructables',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: false,
    nextLinks: false,
    prevLinks: false
  },
  plugins: [
    ['disqus', {
      shortname: 'geek-instructables'
    }],
    ['@vuepress/medium-zoom', {
      selector: 'img',
      margin: 16
    }],
    [
      'social-share',
      {
        networks: ['twitter', 'facebook', 'reddit', 'telegram', 'linkedin'],
        autoQuote: true,
        noGlobalSocialShare: true,
      },
    ],
    /*
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-86686337-2' // UA-00000000-0
      }
    ]
    */
  ]
}
