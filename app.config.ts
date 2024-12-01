export default {
  name: 'featheroom',
  slug: 'featheroom',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    infoPlist: {
      ExpoLocalization_supportsRTL: true,
    },
    bundleIdentifier: 'dev.srizan.featheroom',
    googleServicesFile:
      process.env.GOOGLE_SERVICES_IOS ?? './lib/GoogleService-Info.plist',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'dev.srizan.featheroom',
    googleServicesFile:
      process.env.GOOGLE_SERVICES_ANDROID ?? './lib/google-services.json',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    'expo-localization',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supportsRTL: true,
    router: {
      origin: false,
    },
    eas: {
      projectId: '9f2ea3eb-cf10-41ea-9593-6b558928b21d',
    },
  },
  owner: 'srizan10',
}
