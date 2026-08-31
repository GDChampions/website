import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

// Wrapper containing components that should appear on every single page
export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}
