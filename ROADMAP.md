# VoiceGeneratorIA — Roadmap

## Phase 1 — MVP Terminal (v0.1)
> Objectif : générer un fichier audio depuis le terminal en une commande

- [ ] Setup projet Python (`venv`, `requirements.txt`)
- [ ] Gestion de la clé API via `.env` (python-dotenv)
- [ ] Commande de base : `python voice.py "mon texte ici"`
- [ ] Output `.mp3` dans un dossier `/output` avec nom auto (timestamp)
- [ ] Choix de voix via flag `--voice`
- [ ] Documentation d'installation dans `README.md`

## Phase 2 — Contrôle Artistique (v0.2)
> Objectif : affiner le rendu vocal pour coller à la DA

- [ ] Flags pour les paramètres ElevenLabs : `--stability`, `--similarity`, `--style`
- [ ] Input depuis fichier texte : `--file lyrics.txt`
- [ ] Listage des voix disponibles : `python voice.py --list-voices`
- [ ] Profils de voix pré-configurés (ex: `--preset dark`, `--preset narrator`)
- [ ] Sauvegarde des presets dans un fichier `presets.json`

## Phase 3 — Workflow Studio (v0.3)
> Objectif : s'intégrer dans un flow de production musicale réel

- [ ] Lecture automatique du fichier généré après export (via `mpv` ou `afplay` macOS)
- [ ] Mode batch : générer plusieurs textes depuis un fichier structuré (JSON/YAML)
- [ ] Nommage personnalisé de l'output : `--name intro_couplet1`
- [ ] Historique des générations dans un fichier `history.log`
- [ ] Support multilingue : détection automatique de la langue

## Phase 4 — Interface Optionnelle (v1.0)
> Objectif : wrapper léger si besoin d'un accès rapide hors terminal

- [ ] TUI (Terminal UI) interactive avec `rich` ou `textual`
- [ ] Preview des voix avec un texte test standard
- [ ] Export par lot depuis le TUI
- [ ] Intégration possible dans un workflow n8n ou script shell DAW

---

## Notes

- Priorité absolue : rapidité d'exécution et qualité audio
- Pas d'interface web prévue — le terminal reste le core
- Compatibilité macOS first, Linux secondaire
