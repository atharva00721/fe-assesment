import Hero from "@/components/landing/Hero";
import UnderTheHood from "@/components/landing/UnderTheHood";


export default function Home() {
  return (
    <div className="flex max-w-7xl mx-auto border-x relative min-h-screen w-full flex-col bg-background text-foreground">
      {/* Vertical border lines */}
      <div className="block w-px h-full border-l border-border absolute top-0 left-6 z-10"></div>
      <div className="block w-px h-full border-r border-border absolute top-0 right-6 z-10"></div>
      <Hero />
      {/* <UseCase /> */}
      <UnderTheHood />
    </div>
  );
}
