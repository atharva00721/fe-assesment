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
  sprites: {
    front_default?: string;
    other?: {
      'official-artwork'?: {
        front_default?: string;
      };
    };
  };
};

// Helper to capitalize pokemon names properly
function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

      // Map detailed Pokémon
      const detailedResults = detailedPokemon.map((pokemon: PokemonDetail) => {
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
        const sprite = pokemon.sprites?.front_default;

        return {
          id: String(pokemon.id),
          question: `What is ${capitalizeWords(pokemon.name)}?`,
          answer: `# ${capitalizeWords(pokemon.name)}
*Pokédex #${pokemon.id}*

## Official Artwork
![${capitalizeWords(pokemon.name)}](${officialArtwork || sprite})

## Basic Info
- **Type:** ${types}
- **Height:** ${pokemon.height / 10}m
- **Weight:** ${pokemon.weight / 10}kg
- **Base Experience:** ${pokemon.base_experience || 'Unknown'}

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


