// Estende o app.json com o que não pode ficar no repositório.
// A chave do Google Maps (Maps SDK for Android) vem da variável GOOGLE_MAPS_API_KEY:
// no EAS, `eas env:create --name GOOGLE_MAPS_API_KEY --environment preview`. Sem ela o mapa
// do APK fica cinza; no Expo Go não precisa.
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY }],
  ],
});
