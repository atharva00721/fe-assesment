"use client";


type Feature = {
  title: string;
  description: string;
};

const baseContainerClasses =
  "flex flex-col items-start justify-end min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b";

function FeatureCard({ title, description }: Feature) {
  return (
    <div className={baseContainerClasses}>
      <div className="flex-1 flex-col gap-2 p-6">
        <h3 className="text-lg tracking-tighter font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

const topFeatures: Feature[] = [
  {
    title: "Server-rendered Questions",
    description: "Initial questions are pre-rendered for fast load and SEO.",
  },
  {
    title: "Autocomplete Search",
    description:
      "Server-first results, debounced input, keyboard navigation, and highlighted matches.",
  },
  {
    title: "AI-style Chat",
    description:
      "Selected questions render as chat messages; sticky headings track the active question while scrolling.",
  },
  {
    title: "Nested Comments",
    description:
      "4+ levels, CRUD, optimistic updates, votes, and sorting powered by TanStack Query.",
  },
];

const bottomFeatures: Feature[] = [
  {
    title: "Optimistic Updates",
    description:
      "Create, edit, and delete comments instantly with rollback on error for smooth UX.",
  },
  {
    title: "Sorting & Voting",
    description:
      "Vote up/down and sort threads by newest, oldest, or most voted in real time.",
  },
];

const UnderTheHood = () => (
  <section
    id="under-the-hood"
    className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto relative px-5 md:px-10 border-y"
  >
    <div className="border-x mx-5 md:mx-10 relative">
      <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-border bg-size-[10px_10px] bg-[repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-border bg-size-[10px_10px] bg-[repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

      <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-size-[10px_10px] bg-[repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-size-[10px_10px] bg-[repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="border-b w-full h-full p-10 md:p-14">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-2">
          <h2 className="instrument-serif-regular text-3xl md:text-4xl font-medium tracking-titter text-center text-balance">
            How this works
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Hybrid SSR/CSR: questions render on the server, while autocomplete and nested comments hydrate on the client with caching and optimistic UX.
            <br />Includes questions on 1000+ Pokémon information.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full">
        {topFeatures.map((feature: Feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full">
        {bottomFeatures.map((feature: Feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  </section>
);

export default UnderTheHood;
