#!/usr/bin/env python3
"""
VoiceGeneratorIA — CLI Text-to-Speech via ElevenLabs
Usage: python voice.py "ton texte ici"
"""

import json
import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional

import typer
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs import save

load_dotenv()

app = typer.Typer(help="Generateur de voix rap via ElevenLabs")

DEFAULT_VOICE_ID = os.getenv("DEFAULT_VOICE_ID") or "JBFqnCBsd6RMkjVDRZzb"
OUTPUT_DIR = Path(os.getenv("OUTPUT_DIR", "output"))
PRESETS_FILE = Path("presets.json")


def get_client() -> ElevenLabs:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        typer.echo("[ERREUR] ELEVENLABS_API_KEY manquante. Copie .env.example en .env et ajoute ta clé.", err=True)
        raise typer.Exit(1)
    return ElevenLabs(api_key=api_key)


def slugify(text: str, max_len: int = 30) -> str:
    slug = text.lower().replace(" ", "_")
    slug = "".join(c for c in slug if c.isalnum() or c == "_")
    return slug[:max_len]


def log_history(text: str, voice_id: str, output_path: Path, preset: Optional[str] = None):
    with open("history.log", "a") as f:
        timestamp = datetime.now().isoformat()
        preset_info = f" | preset={preset}" if preset else ""
        f.write(f"{timestamp} | voice={voice_id}{preset_info} | file={output_path} | text={text[:80]}\n")


def load_preset(name: str) -> dict:
    if not PRESETS_FILE.exists():
        typer.echo(f"[ERREUR] Aucun fichier presets.json trouvé.", err=True)
        raise typer.Exit(1)
    presets = json.loads(PRESETS_FILE.read_text())
    if name not in presets:
        typer.echo(f"[ERREUR] Preset '{name}' introuvable. Presets dispo : {', '.join(presets.keys())}", err=True)
        raise typer.Exit(1)
    return presets[name]


@app.command()
def generate(
    text: Optional[str] = typer.Argument(None, help="Texte a convertir en voix"),
    file: Optional[Path] = typer.Option(None, "--file", "-f", help="Fichier .txt source"),
    voice: str = typer.Option(DEFAULT_VOICE_ID, "--voice", "-v", help="Voice ID ElevenLabs"),
    preset: Optional[str] = typer.Option(None, "--preset", "-pr", help="Nom du preset (presets.json)"),
    name: Optional[str] = typer.Option(None, "--name", "-n", help="Nom du fichier output (sans extension)"),
    stability: float = typer.Option(0.40, "--stability", min=0.0, max=1.0, help="Stabilite vocale (0.0-1.0)"),
    similarity: float = typer.Option(0.05, "--similarity", min=0.0, max=1.0, help="Similarite (0.0-1.0)"),
    style: float = typer.Option(0.05, "--style", min=0.0, max=1.0, help="Style expressif (0.0-1.0)"),
    speed: float = typer.Option(1.0, "--speed", min=0.7, max=1.2, help="Vitesse (0.7-1.2)"),
    play: bool = typer.Option(False, "--play", "-p", help="Lire le fichier apres generation"),
):
    """Genere un fichier audio depuis un texte ou un fichier."""

    # Récupère le texte
    if file:
        if not file.exists():
            typer.echo(f"[ERREUR] Fichier introuvable : {file}", err=True)
            raise typer.Exit(1)
        content = file.read_text(encoding="utf-8").strip()
    elif text:
        content = text.strip()
    else:
        typer.echo("[ERREUR] Fournis un texte ou un fichier (--file).", err=True)
        raise typer.Exit(1)

    # Applique le preset si fourni (écrase les valeurs par défaut)
    if preset:
        p = load_preset(preset)
        voice = p.get("voice_id", voice)
        stability = p.get("stability", stability)
        similarity = p.get("similarity", similarity)
        style = p.get("style", style)
        speed = p.get("speed", speed)

    # Prépare l'output
    OUTPUT_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = name if name else f"{timestamp}_{slugify(content)}"
    output_path = OUTPUT_DIR / f"{filename}.mp3"

    # Génère
    client = get_client()
    typer.echo(f"Génération... voice={voice} | stability={stability} similarity={similarity} style={style} speed={speed}")

    audio = client.text_to_speech.convert(
        voice_id=voice,
        text=content,
        model_id="eleven_multilingual_v2",
        voice_settings={
            "stability": stability,
            "similarity_boost": similarity,
            "style": style,
            "use_speaker_boost": False,
            "speed": speed,
        },
    )

    save(audio, str(output_path))
    log_history(content, voice, output_path, preset)

    typer.echo(f"[OK] {output_path}")

    if play:
        _play_audio(output_path)


@app.command(name="run")
def run_interactive():
    """Mode interactif : entre ton texte et genere directement."""
    presets = json.loads(PRESETS_FILE.read_text()) if PRESETS_FILE.exists() else {}
    preset_names = list(presets.keys())

    typer.echo("\n── VoiceGeneratorIA ──────────────────────")
    if preset_names:
        typer.echo(f"  Presets : {', '.join(preset_names)}")
    typer.echo("  Ctrl+C pour quitter\n")

    while True:
        try:
            content = typer.prompt("Texte").strip()
            if not content:
                continue

            preset_choice = typer.prompt(f"Preset [{preset_names[0] if preset_names else 'default'}]", default=preset_names[0] if preset_names else "default")
            name = typer.prompt("Nom du fichier (optionnel, Enter pour auto)", default="").strip() or None
            play = typer.confirm("Lire apres generation ?", default=True)

            # Charge le preset
            p = presets.get(preset_choice, {})
            voice = p.get("voice_id", DEFAULT_VOICE_ID)
            stability = p.get("stability", 0.40)
            similarity = p.get("similarity", 0.05)
            style = p.get("style", 0.0)
            speed = p.get("speed", 1.1)

            # Output
            OUTPUT_DIR.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = name if name else f"{timestamp}_{slugify(content)}"
            output_path = OUTPUT_DIR / f"{filename}.mp3"

            # Génère
            client = get_client()
            typer.echo(f"\nGénération...")

            audio = client.text_to_speech.convert(
                voice_id=voice,
                text=content,
                model_id="eleven_multilingual_v2",
                voice_settings={
                    "stability": stability,
                    "similarity_boost": similarity,
                    "style": style,
                    "use_speaker_boost": False,
                    "speed": speed,
                },
            )

            save(audio, str(output_path))
            log_history(content, voice, output_path, preset_choice)
            typer.echo(f"[OK] {output_path}\n")

            if play:
                _play_audio(output_path)

        except (KeyboardInterrupt, EOFError):
            typer.echo("\nBye.")
            break


@app.command(name="quota")
def quota():
    """Affiche les credits ElevenLabs restants."""
    client = get_client()
    user = client.user.get()
    sub = user.subscription

    used = sub.character_count
    limit = sub.character_limit
    remaining = limit - used
    percent_used = (used / limit * 100) if limit else 0

    bar_len = 30
    filled = int(bar_len * used / limit) if limit else 0
    bar = "█" * filled + "░" * (bar_len - filled)

    typer.echo(f"\n── Quota ElevenLabs ───────────────────────")
    typer.echo(f"  Plan       : {sub.tier}")
    typer.echo(f"  Utilisés   : {used:,} / {limit:,} caractères")
    typer.echo(f"  Restants   : {remaining:,} caractères")
    typer.echo(f"  [{bar}] {percent_used:.1f}%")
    typer.echo()


@app.command(name="list-voices")
def list_voices():
    """Liste toutes les voix disponibles sur ton compte ElevenLabs."""
    client = get_client()
    voices = client.voices.get_all()
    typer.echo(f"\n{'NOM':<30} {'VOICE ID':<30} {'CATEGORIE'}")
    typer.echo("-" * 75)
    for v in voices.voices:
        category = v.category or "-"
        typer.echo(f"{v.name:<30} {v.voice_id:<30} {category}")
    typer.echo()


@app.command(name="list-presets")
def list_presets():
    """Liste tous les presets disponibles."""
    if not PRESETS_FILE.exists():
        typer.echo("Aucun preset trouvé. Crée presets.json.")
        return
    presets = json.loads(PRESETS_FILE.read_text())
    typer.echo(f"\n{'PRESET':<20} {'VOICE':<25} {'STAB':>6} {'SIM':>6} {'STYLE':>6} {'SPEED':>6}")
    typer.echo("-" * 75)
    for name, p in presets.items():
        typer.echo(
            f"{name:<20} {p.get('voice_id', '-'):<25} "
            f"{p.get('stability', '-'):>6} {p.get('similarity', '-'):>6} "
            f"{p.get('style', '-'):>6} {p.get('speed', '-'):>6}"
        )
    typer.echo()


def _play_audio(path: Path):
    """Lecture audio cross-platform."""
    if sys.platform == "darwin":
        subprocess.run(["afplay", str(path)])
    else:
        subprocess.run(["mpv", "--no-video", str(path)])


if __name__ == "__main__":
    app()
