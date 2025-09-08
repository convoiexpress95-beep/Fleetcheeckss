# Importer vos 85 images véhicule dans Supabase Storage

1) Ouvrez le Dashboard Supabase > Storage > Create bucket `vehicle-assets` (public). Si déjà créé, passez.
2) Dans le bucket `vehicle-assets`, créez un dossier `catalog/`.
3) Glissez-déposez vos 85 images dans `vehicle-assets/catalog/` (formats webp/png/jpg). Nommez-les clairement (ex: `peugeot_208.webp`).
4) Dans l’interface Web /missions/new, cliquez sur "Choisir dans le catalogue" et sélectionnez l’image.

Notes
- Les images sont publiquement lisibles (policy configurée). L’URL publique est: {SUPABASE_URL}/storage/v1/object/public/vehicle-assets/{image_path}
- Vous pouvez aussi renseigner manuellement le champ texte avec `catalog/nom_de_fichier.webp`.
- Pour organiser par marque, créez des sous-dossiers: `catalog/peugeot/208.webp` et utilisez le picker en ajustant prefix si besoin.
