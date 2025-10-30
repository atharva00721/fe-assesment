export type PokemonListItem = { name: string; url: string };
export type PokemonType = { type: { name: string } };
export type PokemonAbility = { ability: { name: string }; is_hidden: boolean };
export type PokemonStat = { stat: { name: string }; base_stat: number };
export type PokemonMove = { move: { name: string } };
export type PokemonDetail = {
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
  sprites: any;
};
export type PokemonSpecies = {
  gender_rate: number;
  capture_rate: number;
  hatch_counter: number;
  egg_groups: { name: string }[];
  growth_rate?: { name: string };
  habitat?: { name: string } | null;
  evolution_chain?: { url: string } | null;
};
export type EvolutionNode = { species: { name: string; url: string }; evolves_to: EvolutionNode[] };
export type EvolutionChain = { chain: EvolutionNode };


