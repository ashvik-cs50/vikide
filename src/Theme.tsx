import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import "./Theme.css";

export type ThemeId =
  | "neon"
  | "aurora"
  | "ocean"
  | "sunset"
  | "violet"
  | "forest"
  | "light"
  | "midnight";

export const themes: {
  id: ThemeId;
  name: string;
  description: string;
}[] = [
  {
    id: "neon",
    name: "Neon VIK",
    description: "The original VIK look",
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Mint, cyan and violet",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Teal, blue and indigo",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Orange, amber and pink",
  },
  {
    id: "violet",
    name: "Violet",
    description: "Purple, cyan and pink",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Green, teal and warm yellow",
  },
  {
    id: "light",
    name: "Light",
    description: "Bright white with VIK green",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep dark with electric accents",
  },
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: typeof themes;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem("vik-theme") as ThemeId | null;

    if (saved && themes.some((theme) => theme.id === saved)) {
      return saved;
    }

    return "neon";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;

    localStorage.setItem("vik-theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      themes,
      setTheme: (next: ThemeId) => setThemeState(next),
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export function ThemePicker() {
  const { theme, themes: allThemes, setTheme } = useTheme();

  return (
    <div className="theme-picker">
      <span className="theme-picker-label">Theme</span>

      <select
        value={theme}
        onChange={(event) =>
          setTheme(event.target.value as ThemeId)
        }
        aria-label="Choose VIK theme"
      >
        {allThemes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
            {item.id === "neon" ? " — ORIGINAL" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}