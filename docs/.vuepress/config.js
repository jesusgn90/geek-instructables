module.exports = {
  title: 'Geek Instructables',
  base: '/',
  head: [
    ['link', { rel: "icon", href: "/favicon.png"}],
  ],
  themeConfig: {
    sidebar: [
      '/',
      '/expose-local-service/',
      '/nodemcu-deep-sleep/',
    ],
    repo: 'jesusgn90/geek-instructables',
    docsDir: 'docs',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    nextLinks: false,
    prevLinks: false
  },
  plugins: [
    ['@vuepress/medium-zoom', {
      selector: 'img',
      margin: 16
    }],
  ]
}
