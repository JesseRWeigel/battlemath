#!/usr/bin/env python3
"""Generate themed battle backgrounds for BattleMath using FLUX.1-schnell."""

import torch
from diffusers import FluxPipeline
from pathlib import Path
from PIL import Image
import gc

OUTPUT_DIR = Path(__file__).parent.parent / "src" / "assets" / "images" / "backgrounds"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

STYLE = (
    "cartoon game background, colorful children's game art, "
    "2D digital illustration, wide panoramic landscape, no characters, "
    "no text, soft lighting, vibrant colors, 16:9 aspect ratio"
)

BACKGROUNDS = {
    "bg_addition": (
        f"a sunny flower meadow with rolling green hills, warm golden "
        f"sunlight, scattered wildflowers, blue sky with fluffy clouds, "
        f"cheerful and inviting atmosphere, {STYLE}"
    ),
    "bg_subtraction": (
        f"a magical snowy mountain landscape, ice crystals sparkling, "
        f"northern lights in pale blue sky, frozen lake, pine trees "
        f"covered in snow, cool serene atmosphere, {STYLE}"
    ),
    "bg_multiplication": (
        f"an enchanted purple forest with glowing mushrooms, magical "
        f"particles floating in the air, twisted ancient trees with "
        f"purple and violet foliage, mystical atmosphere, {STYLE}"
    ),
    "bg_division": (
        f"an underground crystal cave with glowing teal and emerald "
        f"crystals, stalactites, underground river reflecting light, "
        f"magical glowing minerals, mysterious atmosphere, {STYLE}"
    ),
}


def main():
    print("Loading FLUX.1-schnell pipeline...")
    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-schnell",
        torch_dtype=torch.bfloat16,
    )
    pipe.enable_model_cpu_offload()

    for name, prompt in BACKGROUNDS.items():
        print(f"\n--- Generating {name} ---")

        for variant in range(2):
            seed = hash(name) + variant + 1000
            generator = torch.Generator("cpu").manual_seed(abs(seed) % (2**32))

            image = pipe(
                prompt=prompt,
                num_inference_steps=4,
                guidance_scale=0.0,
                height=768,
                width=1360,  # ~16:9
                generator=generator,
            ).images[0]

            # Save full res
            out_path = OUTPUT_DIR / f"{name}_v{variant}.png"
            image.save(out_path)
            print(f"  Saved: {out_path}")

            # Also save web-optimized version (1280x720, compressed JPEG)
            web = image.resize((1280, 720), Image.LANCZOS)
            web_path = OUTPUT_DIR / f"{name}_v{variant}_web.jpg"
            web.save(web_path, "JPEG", quality=80)
            print(f"  Web version: {web_path}")

        gc.collect()
        torch.cuda.empty_cache()

    print("\n=== All backgrounds generated! ===")
    print(f"Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
