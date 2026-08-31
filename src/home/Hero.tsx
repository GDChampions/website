export function Hero() {
  const buttonClassName = "border p-3 text-lg";

  return (
    <header className="h-200 border flex flex-col items-center justify-center gap-6">
      <hgroup className="contents">
        <div className="aspect-square h-36 border">Logo</div>
        <h1 className="text-6xl">GD Champions</h1>
        <p className="text-xl">A Geometry Dash mod for real-time ranked competitive play.</p>
      </hgroup>
      <nav className="flex flex-row gap-3">
        <button className={buttonClassName}>Install</button>
        <button className={buttonClassName}>Leaderboard</button>
      </nav>
    </header>
  );
}
