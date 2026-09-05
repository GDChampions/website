import { useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import championsLogo from "../assets/home/hero/champions_logo.webp";
import initialHeroVideo from "../assets/home/hero/hero_initial.mp4";
import loopingHeroVideo from "../assets/home/hero/hero_loop.mp4";

export function Hero() {
  const loopingVideo = useRef<HTMLVideoElement>(null);
  const [loopingVideoIsPlaying, setLoopingVideoIsPlaying] = useState(false);

  return (
    <header className="relative h-176 flex flex-col items-center justify-center gap-6 bg-cover text-center">
      {/* Initial video. Plays once and then hides itself */}
      <video
        playsInline
        autoPlay
        muted
        className={cn("absolute inset-0 object-cover -z-20 size-full", {
          hidden: loopingVideoIsPlaying,
        })}
        src={initialHeroVideo}
        onEnded={() => {
          void loopingVideo.current?.play();
        }}
      ></video>
      {/* Looping video. Plays forever after first video finishes */}
      <video
        ref={loopingVideo}
        playsInline
        loop
        muted
        className={cn("absolute inset-0 object-cover -z-20 size-full", {
          hidden: !loopingVideoIsPlaying,
        })}
        src={loopingHeroVideo}
        onPlay={() => {
          setLoopingVideoIsPlaying(true);
        }}
      ></video>
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10" />
      <hgroup className="contents">
        <h1 className="w-xl aspect-504/205 drop-shadow-2xl">
          <img
            className="object-contain"
            src={championsLogo}
            alt="Champions"
          ></img>
        </h1>
        <p className="text-2xl font-bold text-white">
          Competitive Geometry Dash is here. Play now!
        </p>
      </hgroup>
      <nav className="flex flex-row gap-5">
        <Button color="pink">Install</Button>
        <Button color="yellow">Leaderboard</Button>
      </nav>
    </header>
  );
}

function Button({
  color,
  children,
}: {
  color: "yellow" | "pink";
  children: ReactNode;
}) {
  return (
    // Actual button, with border on bottom and left
    <button
      className={cn(
        "font-lexend overflow-hidden relative p-5 text-3xl font-semibold rounded-md drop-shadow-lg border-t-3 border-l-3 border-base-text/20 transition hover:scale-102",
        { "bg-accent-pink text-accent-pink-text": color === "pink" },
        { "bg-accent-yellow text-accent-yellow-text": color === "yellow" },
      )}
    >
      {/* Border on bottom and right */}
      <span className="absolute inset-0 border-r-3 border-b-3 rounded-br-md opacity-70" />
      {/* Gradient */}
      <span
        className={cn(
          "absolute inset-0 bg-linear-to-r opacity-50",
          {
            "from-accent-pink to-accent-purple": color === "pink",
          },
          { "from-accent-yellow to-accent-orange": color === "yellow" },
        )}
      />
      {/* Visible button text */}
      <span className="absolute -top-0.75 -left-0.75 bottom-0 right-0 flex items-center justify-center text-shadow-sm">
        {children}
      </span>
      {/* Hover overlay */}
      <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition" />
      {/* Invisible button text (needs to be here so that the button is the correct size) */}
      <span className="opacity-0 pointer-events-none">{children}</span>
    </button>
  );
}
