"use client";



const UnderTheHood = () => (
  <section
    id="under-the-hood"
    className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto relative px-5 md:px-10 border-y"
  >
    <div className="border-x mx-5 md:mx-10 relative">
      <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-border bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-border bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>

      <div className="absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-primary/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]"></div>
      <div className="border-b w-full h-full p-10 md:p-14">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center gap-2">
          <h2 className="instrument-serif-regular text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance">
            How this assignment works
          </h2>
          <p className="text-muted-foreground text-center text-balance font-medium">
            Hybrid SSR/CSR: questions render on the server, while autocomplete and nested comments hydrate on the client with caching and optimistic UX.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full">
        <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">

          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">Server-rendered Questions</h3>
            <p className="text-muted-foreground">Initial questions are pre-rendered for fast load and SEO.</p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">
          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">Autocomplete Search</h3>
            <p className="text-muted-foreground">Server-first results, debounced input, keyboard navigation, and highlighted matches.</p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">
          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">AI-style Chat</h3>
            <p className="text-muted-foreground">Selected questions render as chat messages; sticky headings track the active question while scrolling.</p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">
          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">Nested Comments</h3>
            <p className="text-muted-foreground">4+ levels, CRUD, optimistic updates, votes, and sorting powered by TanStack Query.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden w-full">
        <div className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">
          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">Optimistic Updates</h3>
            <p className="text-muted-foreground">Create, edit, and delete comments instantly with rollback on error for smooth UX.</p>
          </div>
        </div>
        <div className="flex flex-col items-start justify-end min-h-[200px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-border before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-border after:content-[''] group cursor-pointer max-h-[400px] group border-b">
          <div className="flex-1 flex-col gap-2 p-6">
            <h3 className="text-lg tracking-tighter font-semibold">Sorting & Voting</h3>
            <p className="text-muted-foreground">Vote up/down and sort threads by newest, oldest, or most voted in real time.</p>
          </div>
        </div>

      </div>
    </div>
  </section>
);

export default UnderTheHood;
