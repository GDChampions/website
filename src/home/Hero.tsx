import { useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

export function Hero() {
  const buttonClassName =
    "overflow-hidden relative p-5 text-3xl font-semibold rounded-md drop-shadow-lg border-t-3 border-l-3 border-base-text/30";
  const loopingVideo = useRef<HTMLVideoElement>(null);
  const [loopingVideoIsPlaying, setLoopingVideoIsPlaying] = useState(false);

  return (
    <header className="relative h-200 flex flex-col items-center justify-center gap-6 bg-cover text-center">
      {/* Initial video. Plays once and then hides itself */}
      <video
        playsInline
        autoPlay
        muted
        className={cn("absolute inset-0 object-cover -z-20 size-full", {
          hidden: loopingVideoIsPlaying,
        })}
        src="/src/assets/home/hero/hero_initial.mp4"
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
        src="/src/assets/home/hero/hero_loop.mp4"
        onPlay={() => {
          setLoopingVideoIsPlaying(true);
        }}
      ></video>
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xl -z-10" />
      <hgroup className="contents">
        <h1 className="w-xl aspect-504/205 drop-shadow-2xl">
          <img
            className="object-contain"
            src="/src/assets/home/hero/full_logo.webp"
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
    <button
      className={cn(
        "overflow-hidden relative p-5 text-3xl font-semibold rounded-md drop-shadow-lg border-t-3 border-l-3 border-base-text/30",
        { "bg-accent-pink text-accent-pink-text": color === "pink" },
        { "bg-accent-yellow text-accent-yellow-text": color === "yellow" },
      )}
    >
      <span className="absolute inset-0 border-r-3 border-b-3 rounded-br-md opacity-70" />
      <span
        className={cn(
          "absolute inset-0 bg-linear-to-r opacity-50",
          {
            "from-accent-pink to-accent-purple": color === "pink",
          },
          { "from-accent-yellow to-accent-orange": color === "yellow" },
        )}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
