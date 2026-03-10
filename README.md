# VoiceGeneratorIA

Génère des voix via ElevenLabs directement depuis ton terminal. Une commande, un `.mp3`.

---

## Installation

### 1. Cloner le projet

```bash
git clone <repo>
cd VoicegeneratorIA
```

### 2. Créer l'environnement Python

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

### 3. Configurer la clé API

```bash
cp .env.example .env
```

Ouvre `.env` et remplace `your_api_key_here` par ta clé ElevenLabs :

```
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxx
DEFAULT_VOICE_ID=WeAAwKYcS06VmXw086yZ
OUTPUT_DIR=output
```

> Ta clé API est sur `elevenlabs.io` → Développeurs → Clés API

### 4. Ajouter la commande globale (optionnel mais recommandé)

```bash
echo 'alias voice="/chemin/vers/VoicegeneratorIA/.venv/bin/voice"' >> ~/.zshrc
source ~/.zshrc
```

Remplace `/chemin/vers/` par le chemin absolu du projet (`pwd` pour le trouver).

---

## Utilisation

### Mode interactif (recommandé)

```bash
voice run
```

Le script te guide pas à pas :
1. Entre ton texte
2. Choisis un preset
3. Nom du fichier (optionnel)
4. Lecture automatique après génération

### Génération directe

```bash
voice generate "ton texte ici"
voice generate "ton texte ici" --preset dark
voice generate "ton texte ici" --preset narrator --name intro_v1 --play
```

### Depuis un fichier .txt

```bash
voice generate --file couplet1.txt --preset default --name couplet1
```

---

## Presets

| Preset | Usage | Stabilité | Style | Vitesse |
|---|---|---|---|---|
| `default` | Base de travail, neutre | 0.40 | 0.0 | 1.1 |
| `dark` | Version sombre, expressive | 0.20 | 0.60 | 0.9 |
| `narrator` | Narration froide, posée | 0.65 | 0.10 | 0.9 |
| `hook` | Hook énergique | 0.30 | 0.40 | 1.1 |

Les presets sont dans `presets.json` — modifie-les ou ajoutes-en librement.

---

## Paramètres manuels

```bash
voice generate "texte" \
  --voice <voice_id> \
  --stability 0.40 \
  --similarity 0.05 \
  --style 0.0 \
  --speed 1.1 \
  --name mon_fichier \
  --play
```

| Flag | Défaut | Description |
|---|---|---|
| `--voice` / `-v` | Victoria | Voice ID ElevenLabs |
| `--preset` / `-pr` | — | Charge un preset |
| `--stability` | 0.40 | 0.0 = variable / 1.0 = robotique |
| `--similarity` | 0.05 | Fidélité à la voix source |
| `--style` | 0.0 | 0.0 = neutre / 1.0 = exagéré |
| `--speed` | 1.1 | 0.7 = lent / 1.2 = rapide |
| `--name` / `-n` | auto | Nom du fichier output |
| `--file` / `-f` | — | Fichier .txt source |
| `--play` / `-p` | false | Lire après génération |

---

## Commandes utiles

```bash
# Lister les voix disponibles sur ton compte
voice list-voices

# Lister les presets configurés
voice list-presets

# Aide
voice --help
voice generate --help
```

---

## Structure du projet

```
VoicegeneratorIA/
├── voice.py          — script principal
├── presets.json      — profils vocaux
├── pyproject.toml    — config package Python
├── requirements.txt  — dépendances
├── .env              — clé API (non versionné)
├── .env.example      — template à copier
├── output/           — fichiers générés (non versionné)
├── history.log       — historique des générations (non versionné)
├── CONTEXT.md        — vision & DA du projet
├── ROADMAP.md        — phases de développement
└── TASKS.md          — liste de tâches
```

---

## Ajouter un preset

Dans `presets.json` :

```json
{
  "mon_preset": {
    "voice_id": "WeAAwKYcS06VmXw086yZ",
    "stability": 0.30,
    "similarity": 0.05,
    "style": 0.50,
    "speed": 1.0,
    "description": "description courte"
  }
}
```

---

## Dépendances

- Python 3.10+
- [elevenlabs](https://github.com/elevenlabs/elevenlabs-python)
- [python-dotenv](https://github.com/theskumar/python-dotenv)
- [typer](https://github.com/tiangolo/typer)
