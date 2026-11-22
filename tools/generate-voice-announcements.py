"""Generate local en-US-JennyNeural MP3 announcements for Color Lab and Smoothie Station."""
import asyncio
import json
import re
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
VOICE = "en-US-JennyNeural"
RATE = "-8%"
CONCURRENCY = 8

ENUMERATE_JS = r"""
import { namedColors } from './src/colorNames.js';
import { presets } from './src/colorPresets.js';
import { ingredients } from './src/games/smoothie-station/ingredients.js';

const colors = [...new Set([...presets.map(p => p.name), ...namedColors.map(c => c.name)])].sort();
const smoothies = new Set([
  'Strawberry Banana Swirl',
  'Purple Monster',
  'Sunshine Shake',
  'Wiggly Goblin',
  'Dragon Berry Blast',
  'Rainbow Rocket',
]);
const descriptors = ['Pink', 'Golden', 'Purple', 'Green', 'Peachy'];
const topWords = ['Sunshine', 'Wiggly', 'Magic'];
for (const a of ingredients) {
  for (const w of topWords) {
    smoothies.add(`${a.name} ${w} Shake`);
    smoothies.add(`${a.name} ${w} Swirl`);
  }
  for (const b of ingredients) {
    if (a.id !== b.id) smoothies.add(`${a.name} ${b.name} Splash`);
  }
  for (const d of descriptors) {
    smoothies.add(`${d} ${a.name} Rocket`);
    smoothies.add(`${d} ${a.name} Splash`);
  }
}
console.log(JSON.stringify({ colors, smoothies: [...smoothies].sort() }));
"""


def voice_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")


def load_phrases():
    raw = subprocess.check_output(
        ["node", "--input-type=module", "-e", ENUMERATE_JS],
        cwd=ROOT,
        text=True,
    )
    data = json.loads(raw)

    jobs = []
    seen_colors = set()
    color_dir = ROOT / "color-lab" / "audio"
    color_dir.mkdir(parents=True, exist_ok=True)
    for name in data["colors"]:
        slug = voice_slug(name)
        assert slug not in seen_colors, f"Duplicate color slug: {slug} ({name})"
        seen_colors.add(slug)
        jobs.append((color_dir / f"{slug}.mp3", f"You made the color {name}!"))

    seen_smoothies = set()
    smoothie_dir = ROOT / "smoothie-station" / "audio"
    smoothie_dir.mkdir(parents=True, exist_ok=True)
    for name in data["smoothies"]:
        slug = voice_slug(name)
        assert slug not in seen_smoothies, f"Duplicate smoothie slug: {slug} ({name})"
        seen_smoothies.add(slug)
        spoken = (
            f"You made {name}!"
            if re.search(r"\bsmoothie$", name, re.I)
            else f"You made {name} Smoothie!"
        )
        jobs.append((smoothie_dir / f"{slug}.mp3", spoken))

    return jobs


async def synth_one(sem: asyncio.Semaphore, path: Path, text: str) -> bool:
    if path.exists() and path.stat().st_size > 1000:
        return False
    async with sem:
        for attempt in range(4):
            try:
                tmp = path.with_suffix(".mp3.tmp")
                comm = edge_tts.Communicate(text, voice=VOICE, rate=RATE)
                await comm.save(str(tmp))
                if tmp.stat().st_size < 1000:
                    raise RuntimeError(f"Generated file too small: {path.name}")
                tmp.replace(path)
                return True
            except Exception:
                if attempt == 3:
                    raise
                await asyncio.sleep(1.0 * (attempt + 1))
    return False


async def main():
    jobs = load_phrases()
    missing = [(p, t) for p, t in jobs if not (p.exists() and p.stat().st_size > 1000)]
    print(f"Total clips: {len(jobs)} | Generating: {len(missing)}", flush=True)
    if not missing:
        return
    sem = asyncio.Semaphore(CONCURRENCY)
    done = 0

    async def run_job(path: Path, text: str):
        nonlocal done
        await synth_one(sem, path, text)
        done += 1
        if done % 50 == 0 or done == len(missing):
            print(f"Generated {done}/{len(missing)} clips", flush=True)

    await asyncio.gather(*(run_job(p, t) for p, t in missing))
    print("All Jenny announcement clips complete.", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
