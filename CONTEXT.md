# VoiceGeneratorIA — Contexte du Projet

## Vision

Outil en ligne de commande pour générer des voix rap via ElevenLabs directement depuis le terminal.
L'objectif : un workflow ultra-rapide pour la production musicale, sans passer par une interface web.

## Direction Artistique (DA)

- **Esthétique** : futuriste, cyber, froid — inspiré drill / trap sombre / sci-fi
- **Usage** : voix de narration, intros/outros, hooks, spoken word, textes en feature IA
- **Ton** : robuste, précis, légèrement synthétique — pas du tout "assistant vocal grand public"
- **Langues cibles** : français (principal), anglais (secondaire)

## Stack Technique

- **Langage** : Python 3.14
- **API** : ElevenLabs — modèle `eleven_multilingual_v2`
- **CLI** : `typer`
- **Config** : `.env` pour la clé API et les préférences par défaut
- **Presets** : `presets.json` pour les profils vocaux réutilisables
- **Output** : fichiers `.mp3` dans `/output`, nommés automatiquement (timestamp + slug)
- **Historique** : `history.log` — chaque génération loguée

## Voix Principale

- **Victoria — Warm and calm** (`WeAAwKYcS06VmXw086yZ`)
- Catégorie : professional
- Réglages de référence : stability=0.40 / similarity=0.05 / style=0.05 / speed=1.0

## Presets Configurés

| Preset | Usage | stability | similarity | style | speed |
|---|---|---|---|---|---|
| `default` | Base de travail Victoria | 0.40 | 0.05 | 0.0 | 1.1 |
| `dark` | Version sombre, expressive | 0.20 | 0.05 | 0.60 | 0.9 |
| `narrator` | Narration froide, posée | 0.65 | 0.10 | 0.10 | 0.9 |
| `hook` | Hook énergique | 0.30 | 0.05 | 0.40 | 1.1 |

## Cas d'Usage Principaux

1. Générer une voix depuis un texte direct (inline)
2. Générer une voix depuis un fichier `.txt`
3. Choisir parmi les presets ou paramétrer manuellement
4. Lister les voix disponibles sur le compte ElevenLabs
5. Écouter le fichier généré directement depuis le terminal (`--play`)

## Philosophie

> Moins de clics, plus de flow. Le terminal comme studio.

Le script doit être aussi simple qu'un `cat` ou un `curl` — on tape, ça sort un `.mp3` prêt à être glissé dans le DAW.
