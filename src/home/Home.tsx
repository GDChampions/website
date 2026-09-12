import { Hero } from "./Hero";
import { News, type NewsStory } from "./News";

// In the final version, these stories will be pulled from some endpoint. hardcoded for now
const newsStories: NewsStory[] = [
  {
    title: "The rizzler just rizzed up Livvy Dunne",
    date: "8/31/2026",
    description:
      "lorem ipsum dolor sit amet consectetur adipiscing elit soluta et quo et quidem in et ullamco reprehenderit qui est atque magna possimus.",
    src: "n/a",
    url: "rizzler",
  },
  {
    title: "67 meme made illegal in 30 states",
    date: "8/30/2026",
    description: "voluptatum corrupti voluptas quibusdam voluptas non in id imperdiet minim cupidatat qui elit sint aute.",
    src: "n/a",
    url: "six-seven",
  },
  {
    title:
      "Study shows playing Counter-Strike actually makes people LESS racist",
    date: "8/29/2026",
    description: "cum cillum est temporibus mollit deleniti ea dolore placeat culpa quod molestias praesentium.",
    src: "n/a",
    url: "racism",
  },
];

export function Home() {
  return (
    <main className="contents">
      <Hero></Hero>
      <News newsStories={newsStories}></News>
    </main>
  );
}
