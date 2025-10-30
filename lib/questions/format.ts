import { capitalizeWords } from "./utils";
import type { PokemonAbility, PokemonDetail, PokemonListItem, PokemonMove, PokemonSpecies, PokemonStat } from "./types";

export function formatDetailedQA(
  pokemon: PokemonDetail,
  species: PokemonSpecies | null | undefined,
  evoRow: string
) {
  const types = pokemon.types.map(t => capitalizeWords(t.type.name)).join(', ');
  const abilities = pokemon.abilities
    .map(a => {
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

  return {
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
`
  };
}

export function formatBasicQA(pokemon: PokemonListItem) {
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
}


