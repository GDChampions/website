import { useRef, useState } from "react";
import { cn } from "../utils/cn";

export function Hero() {
  const buttonClassName = "p-5 text-3xl bg-accent-purple text-accent-yellow font-semibold rounded-md";
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md -z-10" />
      <hgroup className="contents">
        <h1 className="w-xl aspect-504/205">
          <img
            className="object-contain"
            src="/src/assets/home/hero/full_logo.webp"
          ></img>
        </h1>
        <p className="text-2xl font-bold">
          A Geometry Dash mod for real-time ranked competitive play.
        </p>
      </hgroup>
      <nav className="flex flex-row gap-5">
        <button className={buttonClassName}>Install</button>
        <button className={buttonClassName}>Leaderboard</button>
      </nav>
    </header>
  );
}
