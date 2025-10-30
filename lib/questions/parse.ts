import { pMap } from "./utils";
import type { PokemonDetail, PokemonListItem, PokemonSpecies, EvolutionChain } from "./types";

export async function fetchPokemonList(limit: number) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  });
  const data = await res.json();
  return Array.isArray(data.results) ? (data.results as PokemonListItem[]) : [];
}

export async function fetchDetailsBatch(items: PokemonListItem[]) {
  const results = await Promise.all(
    items.map(async (p) => {
      try {
        const res = await fetch(p.url, { cache: "force-cache", next: { revalidate: 3600 } });
        return (await res.json()) as PokemonDetail;
      } catch {
        return null;
      }
    })
  );
  return results.filter((p): p is PokemonDetail => p !== null);
}

export async function fetchSpeciesFor(details: PokemonDetail[]) {
  return pMap<PokemonDetail, PokemonSpecies | null>(details, 25, async (pokemon) => {
    try {
      const url = pokemon?.species?.url;
      if (!url) return null;
      const r = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } });
      if (!r.ok) return null;
      return (await r.json()) as PokemonSpecies;
    } catch {
      return null;
    }
  });
}

export async function fetchChainsFor(speciesList: (PokemonSpecies | null)[]) {
  return pMap<PokemonSpecies | null, EvolutionChain | null>(speciesList, 25, async (sp) => {
    try {
      const url = sp?.evolution_chain?.url;
      if (!url) return null;
      const r = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } });
      if (!r.ok) return null;
      return (await r.json()) as EvolutionChain;
    } catch {
      return null;
    }
  });
}


