export type NewsStory = {
  title: string;
  date: string;
  description: string;
  src: string;
  url: string;
};

export function News({ newsStories }: { newsStories: NewsStory[] }) {
  return (
    <section className="p-10 min-h-120 w-full flex flex-col gap-5">
      <h2 className="text-3xl">Featured news</h2>
      <ul className="w-full flex flex-row gap-1">
        {newsStories.map((nS) => (
          <NewsStory newsStory={nS}></NewsStory>
        ))}
      </ul>
    </section>
  );
}

function NewsStory({ newsStory }: { newsStory: NewsStory }) {
  const { title, date, description, src, url } = newsStory;
  // There are lots of ways to do the key, it just has to be unique per story
  return (
    <li key={url} className="w-full border p-5">
      <div className="border w-full aspect-square mb-3">Image goes here</div>
      <p>{date}</p>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p>{description}</p>
    </li>
  );
}
