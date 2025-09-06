# FleetCheck - Version Mobile Native

Cette application web peut être transformée en application mobile native pour iOS et Android grâce à Capacitor.

## Configuration Capacitor

Le projet est configuré avec Capacitor pour le développement mobile natif avec les fonctionnalités suivantes :

### Fonctionnalités Natives Intégrées

- 🔔 **Notifications Push Natives** - Système de notifications en temps réel
- 📍 **Géolocalisation Haute Précision** - Suivi GPS optimisé pour mobile
- 📱 **Interface Mobile Native** - Layout adaptatif pour iOS et Android
- 🎨 **Status Bar Personnalisée** - Thème cohérent avec l'application
- 🔄 **Hot Reload** - Développement en temps réel depuis le sandbox
- 📴 **Mode Hors Ligne** - Service Worker pour la mise en cache

### Plugins Capacitor Installés

```json
{
  "@capacitor/core": "Latest",
  "@capacitor/cli": "Latest", 
  "@capacitor/ios": "Latest",
  "@capacitor/android": "Latest",
  "@capacitor/splash-screen": "Latest",
  "@capacitor/status-bar": "Latest",
  "@capacitor/keyboard": "Latest",
  "@capacitor/push-notifications": "Latest",
  "@capacitor/local-notifications": "Latest",
  "@capacitor/geolocation": "Latest"
}
```

## Instructions de Déploiement Mobile

### Prérequis
- Node.js 16+ installé
- Git installé
- Pour iOS : macOS avec Xcode
- Pour Android : Android Studio

### Étapes pour Tester sur Appareil

1. **Exporter vers GitHub**
   - Cliquez sur le bouton "Export to Github" dans l'interface Lovable
   - Clonez votre repository : `git pull`

2. **Installation des Dépendances**
   ```bash
   npm install
   ```

3. **Ajouter les Plateformes**
   ```bash
   # Pour iOS
   npx cap add ios
   
   # Pour Android  
   npx cap add android
   ```

4. **Mise à Jour des Dépendances Natives**
   ```bash
   # iOS
   npx cap update ios
   
   # Android
   npx cap update android
   ```

5. **Build du Projet**
   ```bash
   npm run build
   ```

6. **Synchronisation avec les Plateformes**
   ```bash
   npx cap sync
   ```

7. **Lancement sur Appareil**
   ```bash
   # iOS (nécessite Xcode sur macOS)
   npx cap run ios
   
   # Android (nécessite Android Studio)
   npx cap run android
   ```

### Configuration Actuelle

- **App ID** : `app.lovable.2ef1e4e81315408abdf7f0957274267f`
- **App Name** : `FleetCheck`
- **Hot Reload URL** : `https://2ef1e4e8-1315-408a-bdf7-f0957274267f.lovableproject.com?forceHideBadge=true`

### Fonctionnalités Mobile Spécifiques

#### Géolocalisation Native
- Suivi GPS haute précision
- Calcul automatique de distance
- Sauvegarde des points de tracking
- Affichage des statistiques en temps réel

#### Notifications Push
- Intégration OneSignal (configurée)
- Notifications locales et push
- Actions personnalisées sur notifications
- Badges et sons natifs

#### Interface Adaptive
- Status bar thématisée
- Safe area handling pour encoche
- Optimisations tactiles
- Animations fluides 60fps

### Développement Continu

Pour développer l'app mobile :
1. Les modifications dans Lovable sont automatiquement visibles via Hot Reload
2. Après `git pull`, exécutez `npx cap sync` pour synchroniser les changements
3. Pas besoin de rebuilder constamment

### Support et Documentation

- [Blog Lovable Mobile Development](https://lovable.dev/blogs/TODO)
- [Documentation Capacitor](https://capacitorjs.com/docs)
- [Guides iOS](https://capacitorjs.com/docs/ios)
- [Guides Android](https://capacitorjs.com/docs/android)

### Performance

L'application est optimisée pour :
- Démarrage rapide (< 2s)
- Animations fluides 60fps
- Consommation batterie optimisée
- Cache intelligent des données
- Compression des images PWA