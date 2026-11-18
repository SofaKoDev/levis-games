# Audio and illustration review checklist

Open http://localhost:5178/sound-lab/library-review.html. Select a word and listen to every numbered stage. Use the WAV links to save individual recordings. New words remain excluded from the game until you approve them; SUN retains its earlier approval.

## For each word

- [ ] Each isolated sound matches the displayed phoneme, rather than its letter name.
- [ ] Blended consonants have no added “uh” or “eh.” The owner-approved standalone P and G demonstrations deliberately say /pə/ (“puh”) and /ɡə/ (“guh”); these are never used in connected blends or natural words. Their introduction changes have not been applied. Stops such as /p t k b d g/ are brief releases, not artificial sustained sounds.
- [ ] Continuants such as /s f m n/ are audible and long enough to recognize. Check /n/ especially.
- [ ] Short vowels match the intended American English word; no accidental long vowels.
- [ ] Each partial blend contains exactly the highlighted phonemes in order. No extra vowel, missing consonant, or accidental whole word.
- [ ] Connected blend and natural word agree. The introduction deliberately plays separated phonemes with pauses; it is not a connected blend.
- [ ] Back replays the previous stage; Next reaches the illustration only after the whole word, then starts another word.
- [ ] The original illustration is understandable and appropriate. Explain function words, actions, names, and alternate senses with an adult.
- [ ] Only after all checks, select the approval checkbox. Reload the game to use the reviewed word.

## Higher-priority listening

- **stop:** /s/ + /t/ + /ɑ/ + /p/. The /st/ partial blend must not become “stuh.”
- **green:** /ɡ/ + /ɹ/ + /i/ + /n/. The /gr/ partial blend must not become “gurr.” Two e letters share one /i/ sound; g and r remain separate.
- **see, me:** two phonemes, with /i/ as a long-e sound; do not split ee.
- **am, up, on:** two phonemes, beginning with the vowel.
- **eggs:** /ɛ/ + /ɡ/ + /z/. Double g shares one /ɡ/; final s is voiced /z/.
- **jam:** j represents the affricate /dʒ/, one phoneme.
- **dog, on, eggs:** confirm accent-specific vowel choices. SUN’s short /ʌ/ is reused for cup and up.
- **Sam:** a proper name; generic original child illustration, not the book character. Red is a name in the consulted Hop on Pop description; the picture uses the color sense.
- **box, fox:** X is one combined /ks/ lesson step. Candidate recordings are installed; review the isolated X, partial blend, full blend, whole word, and original illustration before approving either word.

## What is and is not verified

Automated checks cover file presence, PCM format, non-silence, clipping, hashes, phoneme grouping, navigation, shuffle behavior, and the approval gate. They cannot certify human pronunciation. All newly generated audio remains pending your listening review. If a clip fails, leave its word unapproved and report the word and stage; do not approve it just to expand the rotation.

Approvals live only in this browser’s local storage, tied to exact word data, audio hashes, and illustration hashes. Changing assets invalidates that approval. Clearing browser data removes approvals. This does not publish anything. To persist approved decisions into source later, request that explicitly.

The generation script runs only during development. Playback uses bundled local WAV files, without API calls or keys. Existing SUN recordings and their approval files are retained.
