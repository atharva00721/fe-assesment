import type { QA } from "./questions/schema";

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

import { capitalizeWords } from "./questions/utils";
import { fetchPokemonList, fetchDetailsBatch, fetchSpeciesFor, fetchChainsFor } from "./questions/parse";
import { getFirstEvolutionPath, renderEvolutionRow } from "./questions/compute";
import { formatBasicQA, formatDetailedQA } from "./questions/format";

// NOTE: server-only; no 'use client' here
export async function fetchServerQuestions(limit = 1300): Promise<QA[]> {
  try {
    // Strategy: Fetch details for first 200 Pokémon (most popular), basic data for rest
    const detailedLimit = 200;
    const allPokemon = await fetchPokemonList(limit);
    const detailedPokemon: PokemonDetail[] = [];
    for (let i = 0; i < Math.min(detailedLimit, allPokemon.length); i += 50) {
      const batch = allPokemon.slice(i, i + 50);
      detailedPokemon.push(...(await fetchDetailsBatch(batch)));
    }
    const speciesList = await fetchSpeciesFor(detailedPokemon);
    const chainList = await fetchChainsFor(speciesList);

    const detailedResults = detailedPokemon.map((pokemon: PokemonDetail, idx: number) => {
      const evoPath = getFirstEvolutionPath(chainList[idx]);
      const evoRow = renderEvolutionRow(evoPath);
      return { id: String(pokemon.id), ...formatDetailedQA(pokemon, speciesList[idx], evoRow) };
    });

    const basicResults = allPokemon.slice(detailedLimit).map((pokemon: PokemonListItem) => formatBasicQA(pokemon));
    return [...detailedResults, ...basicResults];
  } catch (error) {
    console.error("Failed to fetch Pokémon:", error);
  }

  return [];
}

// Lightweight titles for fast search (1 HTTP call + in-process cache)
let titleCache:
  | { at: number; data: Array<{ question: string }> }
  | null = null;

export async function fetchServerQuestionTitles(limit = 1300): Promise<Array<{ question: string }>> {
  const TTL = 3600_000; // 1 hour
  if (titleCache && Date.now() - titleCache.at < TTL) {
    return titleCache.data;
  }

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
    {
      cache: "force-cache",
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!res.ok) return [];

  const data = await res.json();

  const results = Array.isArray(data?.results)
    ? data.results.map((p: PokemonListItem) => ({
      question: `Who is ${capitalizeWords(p.name)}?`,
    }))
    : [];

  titleCache = { at: Date.now(), data: results };
  return results;
}


