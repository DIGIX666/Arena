# Avatar Ready Player Me

Pour utiliser votre avatar Ready Player Me :

1. Allez sur https://readyplayer.me/
2. Créez votre avatar personnalisé
3. Téléchargez le fichier .glb de votre avatar
4. Placez le fichier dans le dossier `/public/` avec le nom `avatar.glb`
5. Ou modifiez le chemin dans le composant Avatar de `/src/app/profile/page.js`

## Format supporté
- Format : .glb (GLTF Binary)
- Optimisé pour le web
- Animations incluses

## Personnalisation
Vous pouvez modifier la taille, position et animation de l'avatar en éditant les propriétés dans le composant Avatar :
- `scale={2.5}` : Taille de l'avatar
- `position={[0, -1.5, 0]}` : Position (x, y, z)
- Rotation animée avec `useFrame`
