# VoiceGeneratorIA — Liste de Tâches

## Fait

- [x] Création du repo `VoicegeneratorIA`
- [x] Rédaction du contexte projet (`CONTEXT.md`)
- [x] Rédaction de la roadmap (`ROADMAP.md`)
- [x] Setup venv + `requirements.txt` + `pyproject.toml`
- [x] Gestion clé API via `.env`
- [x] Script principal `voice.py` avec typer
- [x] Commande `voice generate` (texte inline + fichier)
- [x] Flags `--stability`, `--similarity`, `--style`, `--speed`
- [x] Nommage automatique des fichiers (timestamp + slug)
- [x] Commande `voice list-voices`
- [x] Système de presets (`presets.json` + `--preset`)
- [x] Presets configurés : `default`, `dark`, `narrator`, `hook`
- [x] Voix par défaut : Victoria (`WeAAwKYcS06VmXw086yZ`)
- [x] Commande `voice list-presets`
- [x] Mode interactif `voice run`
- [x] Lecture auto `--play` (afplay macOS)
- [x] Logger chaque génération dans `history.log`
- [x] Alias shell global `voice` dans `.zshrc`
- [x] `README.md` complet (installation + usage)

---

## Reste à faire

### Phase 3 — Workflow Studio

- [ ] Mode batch : générer plusieurs textes depuis un fichier JSON/YAML (`voice batch tracks.json`)
- [ ] `voice --clipboard` : générer depuis le contenu du presse-papier

### Idées / Exploration

- [ ] Intégration Finder via Quick Action (macOS) — clic droit sur un `.txt` → génère le mp3
- [ ] Support voix clonées (voice IDs custom ElevenLabs)
- [ ] Affichage du quota restant après chaque génération (`voice quota`)
- [ ] TUI interactive avec `rich` ou `textual` (Phase 4)
