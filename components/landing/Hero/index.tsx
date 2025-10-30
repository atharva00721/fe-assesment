import React from "react";
import { Button } from "../../ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <section id="hero" className="max-w-7xl w-full mx-auto relative">
      <div className="relative flex flex-col items-center w-full px-6">
        <div className="absolute inset-0 z-0 w-full">
          {/* Updated background gradient with image colors */}
          <div className="absolute inset-0 z-0 h-[600px] md:h-[90svh] w-full [background:radial-gradient(130%_140%_at_50%_10%,#ffffff_0%,#f1f1f1_45%,#ec4899_100%)] rounded-b-xl"></div>

          {/* radial-gradient(130% 140% at 50% 10%, #18181b 40%, #8b5cf6 100%) */}
        </div>
      </div>
      {/* Hero Content Above Video */}
      <div className="relative z-10 pt-32 max-w-3xl mx-auto h-full w-full flex flex-col gap-10 items-center justify-center">
        {/* Provided badge link */}
        {/* <a
          href="https://chat.raccoonai.tech"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="border border-border bg-accent rounded-md text-sm h-8 px-3 flex items-center gap-2 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-rocket w-4 h-4"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
            </svg>
            Introducing CodeBased
          </p>
        </a> */}
        {/* Existing hero content */}
        <div className="flex flex-col items-center mt-20 justify-center gap-5">
          <h1 className="instrument-serif-regular-italic text-5xl md:text-4xl lg:text-5xl xl:text-6xl  tracking-tight text-balance text-center text-foreground w-[80%]">
            AI Chat with Nested Comments.
          </h1>
          <p className="text-base hidden sm:block md:text-lg text-center font-medium text-balance leading-relaxed tracking-tight text-foreground max-md:w-[60%]">
            Next.js 16 app with SSR questions, autocomplete search, and a multi-level
            comments system using optimistic updates and voting.
          </p>
          <p className="text-base sm:hidden md:text-lg text-center font-medium text-balance leading-relaxed tracking-tight text-foreground w-[60%]">
            SSR questions, autocomplete, nested comments with optimistic updates.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <Button
            asChild
          >
            <Link href="/chat">Open Chat</Link>
          </Button>
        </div>
      </div>
      {/* Video/Image Section */}
      <div className="relative px-6 sm:px-24 sm:p-10 mt-10 sm:mt-12">
        <div className="relative size-full shadow-xl rounded-2xl overflow-hidden">
          <div className="relative block dark:hidden">
            <div className="group relative cursor-pointer">
              <img
                src="/"
                alt=" "
                width={1920}
                height={1080}
                className="w-full transition-all duration-200 ease-out group-hover:brightness-[0.8] isolate "
                style={{
                  background:
                    "linear-gradient(120deg, rgba(236,72,153,0.12) 0%, rgba(255,255,255,0.15) 100%)",
                }}
              />
              <div className="absolute isolate inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
                {/* Updated play button accent gradient */}
                <div className="flex size-28 items-center justify-center rounded-full bg-[from-[#6c6cff]/20 to-[#ACC3F7]/15] backdrop-blur-md">
                  <div className="relative flex size-20 scale-100 items-center justify-center rounded-full bg-[linear-gradient(to_right, #6c6cff, #ACC3F7)] shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-play size-8 scale-100 fill-white text-foreground transition-transform duration-200 ease-out group-hover:scale-105"
                      style={{
                        filter:
                          "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
                      }}
                    >
                      <polygon points="6 3 20 12 6 21 6 3"></polygon>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative hidden dark:block">
            <div className="group relative cursor-pointer"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
