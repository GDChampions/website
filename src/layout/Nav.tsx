import { Link, NavLink } from "react-router";
import { cn } from "../utils/cn";

import championsIcon from "../assets/promo/menu_icon.png";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/install", label: "Install" },
  { to: "/news", label: "News" },
  { to: "/competitive", label: "Competitive" },
];

// header with logo and page links and some basic visual animation.
export function Nav() {
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith("access_token="))
        ?.split("=")
        .slice(1)
        .join("=");

      if (!token) {
          setAuthenticated(false);
          return;
      }

      fetch("http://localhost:41010/verify", {
          method: "POST",
          headers: {
              Authorization: `Bearer ${token}`,
          },
      })
          .then((res) => setAuthenticated(res.ok))
          .catch(() => setAuthenticated(false));
  }, []);

  return (
    <nav className="w-full flex items-center gap-10 py-3 px-10 bg-base-medium font-lexend">
      <Link to="/" className="transition hover:scale-105">
        <img className="h-12 drop-shadow-lg" src={championsIcon} />
      </Link>
      <ul className="flex gap-8 text-xl font-semibold">
        {links.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn("text-base-text/70 transition hover:text-base-text", {
                  "text-accent-pink hover:text-accent-pink": isActive,
                })
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <Link
          className="ml-auto text-xl font-semibold"
          to={authenticated ? "/dashboard" : "/login"}
      >
          {authenticated ? "Dashboard" : "Sign in"}
      </Link>
    </nav>
  );
}
