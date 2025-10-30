import { parseIdFromUrl } from "./utils";
import type { EvolutionChain, EvolutionNode } from "./types";

export function getFirstEvolutionPath(chain: EvolutionChain | null | undefined) {
  const path: { id: string; name: string }[] = [];
  let node: EvolutionNode | undefined | null = chain?.chain;
  const seen = new Set<string>();
  while (node) {
    const id = parseIdFromUrl(node.species.url);
    const name = node.species.name;
    if (id && !seen.has(id)) {
      path.push({ id, name });
      seen.add(id);
    }
    node = Array.isArray(node.evolves_to) && node.evolves_to.length > 0 ? node.evolves_to[0] : null;
  }
  return path;
}

export function renderEvolutionRow(path: { id: string; name: string }[]) {
  if (!path.length) return 'Not available';
  const pieces = path.map((s, i) => {
    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${s.id}.png`;
    const title = s.name.charAt(0).toUpperCase() + s.name.slice(1).replace(/-/g, ' ');
    const card = `<figure class="flex flex-col items-center"><img src="${img}" alt="${title}" width="96" height="96" /><figcaption class="mt-1 text-sm">${title}</figcaption></figure>`;
    const sep = i < path.length - 1 ? '<span class="mx-2 text-lg text-slate-400">→</span>' : '';
    return card + sep;
  }).join("");
  return `<div class="flex flex-wrap items-center gap-4">${pieces}</div>`;
}


