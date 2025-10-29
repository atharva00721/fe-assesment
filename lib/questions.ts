export type QA = {
  id: string;
  question: string;
  answer: string;
};

type PokemonListItem = {
  name: string;
  url: string;
};

type PokemonType = {
  type: { name: string };
};

type PokemonAbility = {
  ability: { name: string };
  is_hidden: boolean;
};

type PokemonStat = {
  stat: { name: string };
  base_stat: number;
};

type PokemonMove = {
  move: { name: string };
};

type PokemonDetail = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience?: number;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  held_items?: { item: { name: string } }[];
  species: { name: string; url: string };
  sprites: {
    front_default?: string;
    back_default?: string;
    front_shiny?: string;
    back_shiny?: string;
    front_female?: string;
    front_shiny_female?: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
        front_shiny?: string;
      };
      home?: {
        front_default?: string;
        front_shiny?: string;
        front_female?: string;
        front_shiny_female?: string;
      };
      dream_world?: {
        front_default?: string;
        front_female?: string;
      };
    };
  };
};

type PokemonSpecies = {
  gender_rate: number; // -1 genderless, else 0..8 (12.5% increments female)
  capture_rate: number;
  hatch_counter: number;
  egg_groups: { name: string }[];
  growth_rate?: { name: string };
  habitat?: { name: string } | null;
  evolution_chain?: { url: string } | null;
};

type EvolutionNode = {
  species: { name: string; url: string };
  evolves_to: EvolutionNode[];
};

type EvolutionChain = {
  chain: EvolutionNode;
};

// Helper to capitalize pokemon names properly
function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseIdFromUrl(url: string): string {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? match[1] : '';
}

async function pMap<T, R>(items: T[], concurrency: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length) as unknown as R[];
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, Math.max(1, items.length)) }, async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) break;
      results[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return results;
}

// NOTE: server-only; no 'use client' here
export async function fetchServerQuestions(limit = 1300): Promise<QA[]> {
  try {
    // Strategy: Fetch details for first 200 Pokémon (most popular), basic data for rest
    const detailedLimit = 200; // Get full details for first 200 (most searched)

    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
      {
        cache: "force-cache",
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      const allPokemon = data.results;

      // Fetch detailed data for first 200 in batches of 50
      const detailedPokemon: PokemonDetail[] = [];
      for (let i = 0; i < Math.min(detailedLimit, allPokemon.length); i += 50) {
        const batch = allPokemon.slice(i, i + 50);
        const promises = batch.map(async (p: PokemonListItem) => {
          try {
            const res = await fetch(p.url, { cache: "force-cache", next: { revalidate: 3600 } });
            return await res.json() as PokemonDetail;
          } catch {
            return null;
          }
        });
        const results = await Promise.all(promises);
        detailedPokemon.push(...results.filter((p): p is PokemonDetail => p !== null));
      }

      // Fetch species and evolution chains for detailed Pokémon (cached)
      const speciesList = await pMap<PokemonDetail, PokemonSpecies | null>(detailedPokemon, 25, async (pokemon) => {
        try {
          const url = pokemon?.species?.url;
          if (!url) return null;
          const r = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } });
          if (!r.ok) return null;
          return await r.json() as PokemonSpecies;
        } catch {
          return null;
        }
      });

      const chainList = await pMap<(PokemonSpecies | null), EvolutionChain | null>(speciesList, 25, async (sp) => {
        try {
          const url = sp?.evolution_chain?.url;
          if (!url) return null;
          const r = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } });
          if (!r.ok) return null;
          return await r.json() as EvolutionChain;
        } catch {
          return null;
        }
      });

      const getFirstEvolutionPath = (chain: EvolutionChain | null | undefined) => {
        const path: { id: string; name: string }[] = [];
        let node: EvolutionNode | undefined | null = chain?.chain;
        const seen = new Set<string>();
        while (node) {
          const id = parseIdFromUrl(node.species.url);
          const name = capitalizeWords(node.species.name);
          if (id && !seen.has(id)) {
            path.push({ id, name });
            seen.add(id);
          }
          node = Array.isArray(node.evolves_to) && node.evolves_to.length > 0 ? node.evolves_to[0] : null;
        }
        return path;
      };

      // Map detailed Pokémon
      const detailedResults = detailedPokemon.map((pokemon: PokemonDetail, idx: number) => {
        const types = pokemon.types.map((t: PokemonType) => capitalizeWords(t.type.name)).join(', ');
        const abilities = pokemon.abilities
          .map((a: PokemonAbility) => {
            const name = capitalizeWords(a.ability.name);
            return a.is_hidden ? `${name} (Hidden)` : name;
          })
          .join(', ');

        const stats = pokemon.stats.map((s: PokemonStat) => ({ name: capitalizeWords(s.stat.name), value: s.base_stat }));
        const totalStats = stats.reduce((sum: number, s: { value: number }) => sum + s.value, 0);

        const moves = pokemon.moves.slice(0, 8).map((m: PokemonMove) => capitalizeWords(m.move.name)).join(', ');
        const officialArtwork = pokemon.sprites?.other?.['official-artwork']?.front_default;
        const officialArtworkShiny = pokemon.sprites?.other?.['official-artwork']?.front_shiny;
        const sprite = pokemon.sprites?.front_default;
        const defaultSpriteUrl = sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        const shinySpriteUrl = pokemon.sprites?.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`;
        const backSpriteUrl = pokemon.sprites?.back_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemon.id}.png`;
        const backShinySpriteUrl = pokemon.sprites?.back_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${pokemon.id}.png`;
        const homeFront = pokemon.sprites?.other?.home?.front_default;
        const homeShiny = pokemon.sprites?.other?.home?.front_shiny;
        const dreamWorld = pokemon.sprites?.other?.dream_world?.front_default;

        const heldItems = (pokemon.held_items && pokemon.held_items.length)
          ? pokemon.held_items.map(h => capitalizeWords(h.item.name)).join(', ')
          : 'None';

        const species = speciesList[idx];
        const chain = chainList[idx];
        const genderRate = species?.gender_rate;
        const femalePct = typeof genderRate === 'number' && genderRate >= 0 ? (genderRate * 12.5) : null;
        const genderText = genderRate === -1
          ? 'Genderless'
          : typeof femalePct === 'number'
            ? `♂ ${(100 - femalePct).toFixed(1).replace(/\.0$/, '')}% / ♀ ${femalePct.toFixed(1).replace(/\.0$/, '')}%`
            : 'Unknown';

        const eggGroups = species?.egg_groups?.map(g => capitalizeWords(g.name)).join(', ') || 'Unknown';
        const captureRate = typeof species?.capture_rate === 'number' ? String(species.capture_rate) : 'Unknown';
        const hatchCounter = typeof species?.hatch_counter === 'number' ? `${species.hatch_counter} cycles (~${species.hatch_counter * 255} steps)` : 'Unknown';
        const growthRate = species?.growth_rate?.name ? capitalizeWords(species.growth_rate.name) : 'Unknown';
        const habitat = species?.habitat?.name ? capitalizeWords(species.habitat.name) : 'Unknown';

        const evoPath = getFirstEvolutionPath(chain);
        const evoRow = evoPath.length
          ? (() => {
            const pieces = evoPath.map((s, i) => {
              const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.id}.png`;
              const card = `<figure class="flex flex-col items-center"><img src="${img}" alt="${s.name}" width="96" height="96" /><figcaption class="mt-1 text-sm">${s.name}</figcaption></figure>`;
              const sep = i < evoPath.length - 1 ? '<span class="mx-2 text-lg text-slate-400">→</span>' : '';
              return card + sep;
            }).join("");
            return `<div class="flex flex-wrap items-center gap-4">${pieces}</div>`;
          })()
          : 'Not available';

        return {
          id: String(pokemon.id),
          question: `Who is ${capitalizeWords(pokemon.name)}?`,
          answer: `# ${capitalizeWords(pokemon.name)}
*Pokédex #${pokemon.id}*

## Official Artwork
![${capitalizeWords(pokemon.name)}](${officialArtwork || sprite})

## Sprites
<div class="flex flex-wrap items-center gap-4">
  <figure class="flex flex-col items-center">
    <img src="${defaultSpriteUrl}" alt="${capitalizeWords(pokemon.name)} Front" width="72" height="72" />
    <figcaption class="mt-1 text-xs text-slate-500">Front</figcaption>
  </figure>
  <figure class="flex flex-col items-center">
    <img src="${shinySpriteUrl}" alt="${capitalizeWords(pokemon.name)} Shiny" width="72" height="72" />
    <figcaption class="mt-1 text-xs text-slate-500">Shiny</figcaption>
  </figure>
  <figure class="flex flex-col items-center">
    <img src="${backSpriteUrl}" alt="${capitalizeWords(pokemon.name)} Back" width="72" height="72" />
    <figcaption class="mt-1 text-xs text-slate-500">Back</figcaption>
  </figure>
  <figure class="flex flex-col items-center">
    <img src="${backShinySpriteUrl}" alt="${capitalizeWords(pokemon.name)} Back Shiny" width="72" height="72" />
    <figcaption class="mt-1 text-xs text-slate-500">Back Shiny</figcaption>
  </figure>
  ${homeFront ? `<figure class="flex flex-col items-center"><img src="${homeFront}" alt="${capitalizeWords(pokemon.name)} Home" width="72" height="72" /><figcaption class="mt-1 text-xs text-slate-500">Home</figcaption></figure>` : ''}
  ${homeShiny ? `<figure class="flex flex-col items-center"><img src="${homeShiny}" alt="${capitalizeWords(pokemon.name)} Home Shiny" width="72" height="72" /><figcaption class="mt-1 text-xs text-slate-500">Home Shiny</figcaption></figure>` : ''}
  ${officialArtworkShiny ? `<figure class="flex flex-col items-center"><img src="${officialArtworkShiny}" alt="${capitalizeWords(pokemon.name)} Artwork Shiny" width="72" height="72" /><figcaption class="mt-1 text-xs text-slate-500">Artwork Shiny</figcaption></figure>` : ''}
  ${dreamWorld ? `<figure class="flex flex-col items-center"><img src="${dreamWorld}" alt="${capitalizeWords(pokemon.name)} Dream World" width="72" height="72" /><figcaption class="mt-1 text-xs text-slate-500">Dream World</figcaption></figure>` : ''}
</div>

## Evolution
${evoRow}

## Basic Info
- **Type:** ${types}
- **Height:** ${pokemon.height / 10}m
- **Weight:** ${pokemon.weight / 10}kg
- **Base Experience:** ${pokemon.base_experience || 'Unknown'}
- **Held Items:** ${heldItems}

## Species Data
- **Gender:** ${genderText}
- **Egg Groups:** ${eggGroups}
- **Capture Rate:** ${captureRate}
- **Hatch Counter:** ${hatchCounter}
- **Growth Rate:** ${growthRate}
- **Habitat:** ${habitat}

## Abilities
${abilities}

## Base Stats (Total: ${totalStats})
| Stat | Value |
|------|-------|
| HP | ${stats[0].value} |
| Attack | ${stats[1].value} |
| Defense | ${stats[2].value} |
| Sp. Attack | ${stats[3].value} |
| Sp. Defense | ${stats[4].value} |
| Speed | ${stats[5].value} |

## Notable Moves
${moves}${pokemon.moves.length > 8 ? ` *(+${pokemon.moves.length - 8} more)*` : ''}
`,
        };
      });

      // Map remaining Pokémon with basic data only
      const basicResults = allPokemon.slice(detailedLimit).map((pokemon: PokemonListItem) => {
        const urlParts = pokemon.url.split('/');
        const pokemonId = urlParts[urlParts.length - 2];
        const pokemonName = capitalizeWords(pokemon.name);
        const officialArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

        return {
          id: pokemonId,
          question: `What is ${pokemonName}?`,
          answer: `# ${pokemonName}
*Pokédex #${pokemonId}*

![${pokemonName}](${officialArtwork})

This is **${pokemonName}**, Pokédex number ${pokemonId}.

For detailed stats and information, visit [PokéAPI](${pokemon.url}).
`,
        };
      });

      return [...detailedResults, ...basicResults];
    }
  } catch (error) {
    console.error("Failed to fetch Pokémon:", error);
  }

  return [];
}


