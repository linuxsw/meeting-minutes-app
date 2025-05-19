module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja'],
    localeDetection: true,
  },
  ns: ['common', 'home', 'upload', 'review', 'templates', 'aiConfig'],
  defaultNS: 'common',
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
}
