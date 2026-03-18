#!/usr/bin/env python3
"""Generate sound effects for BattleMath using MusicGen (already cached)."""

import torch
import numpy as np
from scipy.io import wavfile
from transformers import AutoProcessor, MusicgenForConditionalGeneration
from pathlib import Path
import subprocess
import gc

OUTPUT_DIR = Path(__file__).parent.parent / "src" / "assets" / "sounds"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# MusicGen works best for short musical phrases and SFX
SOUNDS = {
    "correct": {
        "prompt": "cheerful ascending chime, bright bell reward sound, happy major chord",
        "duration_tokens": 256,  # ~1 second
    },
    "wrong": {
        "prompt": "soft gentle low boop, single muted note, calm neutral tone",
        "duration_tokens": 128,  # ~0.5 second
    },
    "enemy_defeat": {
        "prompt": "cartoon pop explosion whoosh, quick descending sweep",
        "duration_tokens": 200,  # ~0.8 second
    },
    "streak_milestone": {
        "prompt": "exciting power-up sound, ascending electronic tones, achievement fanfare",
        "duration_tokens": 256,  # ~1 second
    },
    "victory_fanfare": {
        "prompt": "triumphant victory fanfare, brass and bells celebration jingle, major key",
        "duration_tokens": 1024,  # ~4 seconds
    },
    "star_earned": {
        "prompt": "magical sparkle ding, twinkling bell single note, bright star sound",
        "duration_tokens": 150,  # ~0.6 second
    },
}


def convert_to_mp3(wav_path: Path, mp3_path: Path):
    """Convert WAV to MP3 using ffmpeg with loudness normalization."""
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(wav_path),
            "-af", "loudnorm,silenceremove=1:0:-40dB:0:0:-40dB",
            "-ar", "44100", "-b:a", "128k",
            str(mp3_path),
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        wav_path.unlink()  # Remove WAV after conversion
    else:
        print(f"  Warning: ffmpeg failed for {wav_path}: {result.stderr[:200]}")


def main():
    print("Loading MusicGen-medium pipeline (cached)...")
    processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
    model = MusicgenForConditionalGeneration.from_pretrained(
        "facebook/musicgen-medium",
        torch_dtype=torch.float16,
    ).to("cuda")

    sample_rate = model.config.audio_encoder.sampling_rate
    print(f"Sample rate: {sample_rate}")

    for name, config in SOUNDS.items():
        print(f"\n--- Generating {name} ---")
        print(f"  Prompt: {config['prompt'][:60]}...")

        for variant in range(3):
            inputs = processor(
                text=[config["prompt"]],
                padding=True,
                return_tensors="pt",
            ).to("cuda")

            with torch.no_grad():
                audio_values = model.generate(
                    **inputs,
                    max_new_tokens=config["duration_tokens"],
                    do_sample=True,
                    temperature=1.0 + (variant * 0.1),  # slight variation
                )

            # audio_values shape: [batch, channels, samples]
            audio = audio_values[0].cpu().float().numpy()
            # Normalize to int16 range
            audio_int16 = (audio / np.max(np.abs(audio)) * 32767).astype(np.int16)
            # If stereo, transpose to (samples, channels)
            if audio_int16.ndim == 2:
                audio_int16 = audio_int16.T

            # Save as WAV
            wav_path = OUTPUT_DIR / f"{name}_v{variant}.wav"
            wavfile.write(str(wav_path), sample_rate, audio_int16)

            # Convert to MP3
            mp3_path = OUTPUT_DIR / f"{name}_v{variant}.mp3"
            convert_to_mp3(wav_path, mp3_path)
            print(f"  Saved: {mp3_path}")

        gc.collect()
        torch.cuda.empty_cache()

    print("\n=== All sounds generated! ===")
    print(f"Output: {OUTPUT_DIR}")
    print("Review variants and pick the best one for each sound.")


if __name__ == "__main__":
    main()
