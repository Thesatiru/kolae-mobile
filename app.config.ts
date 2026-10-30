import type { ConfigContext, ExpoConfig } from 'expo/config';

// Configuração do app (antes app.json). Em TypeScript para ler variáveis de ambiente:
// a chave do Google Maps para Android NUNCA fica escrita no repositório. Ela vem de
// GOOGLE_MAPS_ANDROID_API_KEY, variável do EAS no environment "preview" (eas.json).
// Sem ela o mapa do APK fica cinza; no Expo Go não precisa.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Kolae',
  slug: 'kolae-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'kolae',
  userInterfaceStyle: 'automatic',
  ios: {
    icon: './assets/expo.icon',
    infoPlist: {},
  },
  android: {
    package: 'br.com.kolae.app',
    adaptiveIcon: {
      backgroundColor: '#0084FF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'server',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0084FF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
        dark: {
          backgroundColor: '#121417',
        },
      },
    ],
    'expo-secure-store',
    'expo-localization',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          // Com o R8 ligado, o APK de release fechava ao abrir: ele removia a classe gerada
          // do Room do WorkManager ("Failed to create an instance of ... WorkDatabase").
          enableMinifyInReleaseBuilds: false,
          enableShrinkResourcesInReleaseBuilds: false, // só funciona junto com a minificação
        },
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'O Kolae usa suas fotos para você anexar imagens nos posts da Comunidade.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'O Kolae usa sua localização para mostrar as quadras perto de você e a distância até cada uma.',
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {
      asyncRoutes: {
        web: true,
      },
    },
    eas: {
      projectId: '8c448852-a439-4b3e-a5b2-d90d271ac858',
    },
  },
  owner: 'satiru',
});
