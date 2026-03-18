#!/usr/bin/env python3
"""Generate chibi character sprites for BattleMath using FLUX.1-schnell."""

import torch
from diffusers import FluxPipeline
from pathlib import Path
import gc

OUTPUT_DIR = Path(__file__).parent.parent / "src" / "assets" / "images" / "characters"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Consistent style prefix for all characters
STYLE = (
    "chibi cartoon game sprite, cute kawaii style, big head small body, "
    "bright vibrant colors, clean lines, white background, full body, "
    "centered, children's game art, 2D digital illustration, no text"
)

CHARACTERS = {
    # Hero poses
    "hero_idle": (
        f"a cheerful young warrior kid with blue cape and wooden sword, "
        f"standing ready pose, confident smile, blue and silver armor, "
        f"{STYLE}"
    ),
    "hero_attack": (
        f"a cheerful young warrior kid with blue cape swinging wooden sword, "
        f"action attack pose, determined expression, blue and silver armor, "
        f"motion lines, {STYLE}"
    ),
    "hero_victory": (
        f"a cheerful young warrior kid with blue cape, arms raised in "
        f"celebration, happy excited expression, blue and silver armor, "
        f"stars and sparkles around, {STYLE}"
    ),
    "hero_hurt": (
        f"a young warrior kid with blue cape stumbling backwards, "
        f"surprised expression, blue and silver armor, small impact stars, "
        f"{STYLE}"
    ),

    # Enemy: Addition - Flame Pup
    "enemy_addition": (
        f"a cute small fire puppy creature, warm orange and red flames, "
        f"playful happy expression, round fluffy body with flame tail, "
        f"game enemy character, {STYLE}"
    ),

    # Enemy: Subtraction - Frost Sprite
    "enemy_subtraction": (
        f"a cute small ice fairy sprite creature, light blue and white, "
        f"mischievous grin, crystalline wings, snowflake patterns, "
        f"game enemy character, {STYLE}"
    ),

    # Enemy: Multiplication - Slime King
    "enemy_multiplication": (
        f"a cute bouncy purple slime monster with a tiny gold crown, "
        f"happy squished expression, translucent purple jelly body, "
        f"game enemy character, {STYLE}"
    ),

    # Enemy: Division - Rock Golem
    "enemy_division": (
        f"a cute small stone golem creature, brown and gray rocky body, "
        f"gentle expression, mossy patches, cracked stone texture, "
        f"game enemy character, {STYLE}"
    ),
}


def main():
    print("Loading FLUX.1-schnell pipeline...")
    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-schnell",
        torch_dtype=torch.bfloat16,
    )
    pipe.enable_model_cpu_offload()

    for name, prompt in CHARACTERS.items():
        print(f"\n--- Generating {name} ---")
        print(f"Prompt: {prompt[:80]}...")

        # Generate 3 variants, pick best manually later
        for variant in range(3):
            seed = hash(name) + variant
            generator = torch.Generator("cpu").manual_seed(abs(seed) % (2**32))

            image = pipe(
                prompt=prompt,
                num_inference_steps=4,  # schnell is fast
                guidance_scale=0.0,  # schnell doesn't use guidance
                height=768,
                width=768,
                generator=generator,
            ).images[0]

            out_path = OUTPUT_DIR / f"{name}_v{variant}.png"
            image.save(out_path)
            print(f"  Saved: {out_path}")

        # Clear VRAM between characters
        gc.collect()
        torch.cuda.empty_cache()

    print("\n=== All characters generated! ===")
    print(f"Output: {OUTPUT_DIR}")
    print("Review variants and pick the best one for each character.")


if __name__ == "__main__":
    main()
