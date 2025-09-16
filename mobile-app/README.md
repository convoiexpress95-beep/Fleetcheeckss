# FleetCheck Mobile - Application Convoyeurs

Application mobile React Native/Expo pour les convoyeurs sur le terrain.

## 🚀 Installation

1. **Installer les dépendances globales :**
```bash
npm install -g expo-cli @expo/cli
```

2. **Créer le projet Expo :**
```bash
npx create-expo-app FleetCheckMobile --template
cd FleetCheckMobile
```

3. **Installer les dépendances :**
```bash
npm install @supabase/supabase-js expo-location expo-camera expo-notifications expo-router react-native-maps @react-native-async-storage/async-storage expo-image-picker expo-document-picker expo-file-system expo-constants expo-device expo-battery react-native-elements react-native-vector-icons @tanstack/react-query react-native-paper react-native-toast-message expo-status-bar expo-splash-screen
```

4. **Copier les fichiers de configuration :**
   - Copier tous les fichiers de ce dossier dans votre projet Expo
   - Remplacer le contenu d'`App.js` par `App.tsx`

## 📱 Configuration

### 1. Supabase
- Modifier `config/supabase.ts` avec vos credentials
- L'URL et la clé sont déjà configurées pour votre projet

### 2. Permissions (app.json)
```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Cette app a besoin de votre localisation pour le suivi des missions."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Cette app a besoin d'accéder à votre appareil photo pour les photos de mission."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ]
  }
}
```

## 🛠 Développement

### Démarrer le serveur de développement :
```bash
npx expo start
```

### Scanner le QR code avec l'app Expo Go (iOS/Android)

## 📁 Structure du projet

```
src/
├── components/         # Composants UI
├── screens/           # Écrans de l'application
├── hooks/             # Hooks personnalisés
├── config/            # Configuration Supabase
├── types/             # Types TypeScript
├── utils/             # Fonctions utilitaires
└── navigation/        # Configuration navigation
```

## 🔧 Fonctionnalités

- **Tableau de bord** : Vue d'ensemble des missions
- **Missions** : Liste et détails des missions assignées
- **Inspection** : États des lieux avec photos GPS
- **Suivi GPS** : Localisation en temps réel
- **Contacts** : Gestion des contacts
- **Rapports** : Génération et consultation
- **Paramètres** : Configuration utilisateur

## 🔐 Authentification

L'application partage l'authentification avec l'app web via Supabase.
Les utilisateurs doivent être créés depuis l'interface web d'administration.

## 📡 Synchronisation

Toutes les données sont synchronisées en temps réel avec l'application web via Supabase :
- Missions
- États des lieux
- Photos
- Tracking GPS
- Rapports

## 🚀 Build Production

### Android
```bash
npx expo build:android
```

### iOS
```bash
npx expo build:ios
```

## 🔄 Mise à jour

### Over-the-air (OTA) updates
```bash
npx expo publish
```

## 📋 Notes importantes

- L'app nécessite une connexion internet pour fonctionner
- Les photos sont automatiquement uploadées vers Supabase Storage
- Le GPS fonctionne en arrière-plan pendant les missions actives
- L'application respecte les mêmes règles RLS que l'app web