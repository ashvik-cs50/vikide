// src/App.tsx

import { useEffect, useMemo, useState } from "react";
import { ThemePicker } from "./Theme";

type Page =
  | "home"
  | "learn"
  | "resources"
  | "login"
  | "ide";

const socials = {
  instagram: "https://www.instagram.com/timmi_dev_1/",
  youtube: "https://www.youtube.com/@TimmiDev1",
  discord: "https://discord.gg/cFqCXHWSp",
  github: "https://github.com/ashvik-cs50/vikide",
};

const example = `get name What is your name?
say Hello vari,name!

getIn age How old are you?
i age >= 13
  say Welcome to VIK!
enif`;

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="logo"
      onClick={onClick}
      aria-label="VIK home"
    >
      <span>VIK</span>
      <i>•</i>
    </button>
  );
}

function Nav({
  page,
  go,
}: {
  page: Page;
  go: (page: Page) => void;
}) {
  return (
    <header className="nav">
      <Logo onClick={() => go("home")} />

      <nav>
        <button
          className={page === "home" ? "active" : ""}
          onClick={() => go("home")}
        >
          Home
        </button>

        <button
          className={page === "learn" ? "active" : ""}
          onClick={() => go("learn")}
        >
          Learn
        </button>

        <button
          className={page === "resources" ? "active" : ""}
          onClick={() => go("resources")}
        >
          Resources
        </button>

        <button
          className={page === "ide" ? "active" : ""}
          onClick={() => go("ide")}
        >
          IDE
        </button>
      </nav>

      <div className="nav-right">
        <ThemePicker />

        <button
          className="btn btn-small"
          onClick={() => go("login")}
        >
          Sign in
        </button>
      </div>
    </header>
  );
}

function Hero({ go }: { go: (page: Page) => void }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            VIK 4.0 · LEARN BY CREATING
          </div>

          <h1>
            Code that feels
            <br />
            <span>like you.</span>
          </h1>

          <p>
            VIK is a simple programming language and learning
            platform built to make coding easier to understand,
            experiment with, and actually enjoy.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => go("ide")}
            >
              Launch VIK IDE →
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => go("learn")}
            >
              Explore VIK
            </button>
          </div>

          <div className="hero-note">
            <span>●</span> No pricing walls. Just learn, build and
            create.
          </div>
        </div>

        <div className="editor-card">
          <div className="editor-top">
            <span className="dots">● ● ●</span>
            <span>hello.vik</span>
            <span>VIK</span>
          </div>

          <div className="editor-body">
            {example.split("\n").map((line, index) => (
              <div className="code-line" key={index}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <code>{line || " "}</code>
              </div>
            ))}
          </div>

          <div className="editor-bottom">
            <span>VIK Script</span>
            <span className="run">● Ready</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <span className="eyebrow">WHY VIK</span>

            <h2>Small syntax. Big ideas.</h2>
          </div>

          <p>
            Everything is designed around the idea that beginners
            should spend more time creating and less time fighting
            syntax.
          </p>
        </div>

        <div className="feature-grid">
          <article>
            <span className="feature-number">01</span>

            <h3>Simple syntax</h3>

            <p>
              Readable commands make your first programs feel
              familiar instead of intimidating.
            </p>
          </article>

          <article>
            <span className="feature-number">02</span>

            <h3>Build anything</h3>

            <p>
              Start with tiny experiments and grow toward real
              projects, games and tools.
            </p>
          </article>

          <article>
            <span className="feature-number">03</span>

            <h3>Learn by creating</h3>

            <p>
              VIK turns concepts into things you can actually see,
              change and share.
            </p>
          </article>
        </div>
      </section>

      <section className="language-section">
        <div>
          <span className="eyebrow">THE LANGUAGE</span>

          <h2>VIK Script is readable on purpose.</h2>

          <p>
            Plain-English commands help new programmers understand
            what their code is doing without hiding the fundamentals.
          </p>

          <button
            className="text-btn"
            onClick={() => go("learn")}
          >
            See the syntax →
          </button>
        </div>

        <pre>
          <code>{example}</code>
        </pre>
      </section>

      <section className="stats">
        <div>
          <strong>01</strong>
          <span>simple language</span>
        </div>

        <div>
          <strong>∞</strong>
          <span>things to build</span>
        </div>

        <div>
          <strong>100%</strong>
          <span>creator-focused</span>
        </div>

        <div>
          <strong>VIK</strong>
          <span>made for curious minds</span>
        </div>
      </section>

      <section className="cta">
        <span className="eyebrow">READY?</span>

        <h2>
          Make something weird.
          <br />
          Make something yours.
        </h2>

        <button
          className="btn btn-primary"
          onClick={() => go("ide")}
        >
          Open the IDE →
        </button>
      </section>
    </main>
  );
}

function Learn({ go }: { go: (page: Page) => void }) {
  const lessons = [
    [
      "01",
      "Output",
      "say Hello!",
      "Show text to the user.",
    ],
    [
      "02",
      "Input",
      "get name What is your name?",
      "Ask for a value.",
    ],
    [
      "03",
      "Variables",
      "set score = 10",
      "Store information.",
    ],
    [
      "04",
      "Conditions",
      "i age >= 13",
      "Make decisions.",
    ],
    [
      "05",
      "Arrays",
      "ar colors = red,green,blue",
      "Keep multiple values.",
    ],
    [
      "06",
      "Calculations",
      "calc double = age m 2",
      "Work with numbers.",
    ],
  ];

  return (
    <main className="page-shell">
      <span className="eyebrow">LEARN VIK</span>

      <h1>
        Start simple.
        <br />
        <span>Go anywhere.</span>
      </h1>

      <p className="lead">
        VIK Script uses a small set of readable building blocks.
        Learn one concept at a time, then combine them into projects.
      </p>

      <div className="learn-grid">
        {lessons.map(([number, title, code, description]) => (
          <article key={number}>
            <span>{number}</span>

            <h3>{title}</h3>

            <code>{code}</code>

            <p>{description}</p>
          </article>
        ))}
      </div>

      <div className="center-actions">
        <button
          className="btn btn-primary"
          onClick={() => go("ide")}
        >
          Try it in the IDE →
        </button>
      </div>
    </main>
  );
}

function Resources({ go }: { go: (page: Page) => void }) {
  const saveExample = () => {
    localStorage.setItem("vik-example", example);
    go("ide");
  };

  return (
    <main className="page-shell">
      <span className="eyebrow">RESOURCES</span>

      <h1>
        Everything you need
        <br />
        <span>to start building.</span>
      </h1>

      <div className="resource-grid">
        <article>
          <span>VIK SCRIPT</span>

          <h3>Language reference</h3>

          <p>
            Keep the core commands nearby while experimenting.
          </p>

          <button
            className="text-btn"
            onClick={() => go("learn")}
          >
            Open reference →
          </button>
        </article>

        <article>
          <span>EXAMPLE</span>

          <h3>Starter program</h3>

          <p>
            Load a small VIK program directly into the local IDE.
          </p>

          <button
            className="text-btn"
            onClick={saveExample}
          >
            Open example →
          </button>
        </article>

        <article>
          <span>SOURCE</span>

          <h3>VIK on GitHub</h3>

          <p>
            Explore the project source and follow development.
          </p>

          <a
            className="text-btn"
            href={socials.github}
            target="_blank"
            rel="noreferrer"
          >
            Open GitHub →
          </a>
        </article>
      </div>
    </main>
  );
}

function Login({ go }: { go: (page: Page) => void }) {
  const [mode, setMode] = useState<"signin" | "signup">(
    "signin"
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    localStorage.setItem(
      "vik-user",
      JSON.stringify({
        name:
          name ||
          email.split("@")[0] ||
          "VIK User",
        email,
      })
    );

    go("ide");
  };

  const guest = () => {
    localStorage.setItem(
      "vik-user",
      JSON.stringify({
        name: "Guest",
        guest: true,
      })
    );

    go("ide");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">VIK ACCOUNT</span>

        <h1>
          {mode === "signin"
            ? "Welcome back."
            : "Create your VIK account."}
        </h1>

        <div className="tabs">
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>

          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Username

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="yourname"
              />
            </label>
          )}

          <label>
            Email

            <input
              type="email"
              required={mode === "signin"}
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              required={mode === "signin"}
              placeholder="••••••••"
            />
          </label>

          <button
            className="btn btn-primary full"
            type="submit"
          >
            {mode === "signin"
              ? "Sign in"
              : "Create account"}{" "}
            →
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="btn btn-ghost full"
          onClick={guest}
        >
          Continue as guest
        </button>

        <p className="auth-note">
          Demo mode stores the session locally. Connect your real
          authentication provider when you are ready for production.
        </p>
      </div>
    </main>
  );
}

function IDE({ go }: { go: (page: Page) => void }) {
  const [code, setCode] = useState(
    () => localStorage.getItem("vik-example") || example
  );

  const [output, setOutput] = useState(
    "Ready. Your VIK program is loaded."
  );

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("vik-user") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vik-example", code);
  }, [code]);

  const run = () => {
    setOutput(
      "✓ Program accepted by the VIK demo editor.\n\n" +
        code
          .split("\n")
          .filter(Boolean)
          .map((line) => "› " + line)
          .join("\n")
    );
  };

  return (
    <main className="ide-page">
      <div className="ide-header">
        <div>
          <span className="eyebrow">VIK IDE</span>

          <h1>
            {user?.name
              ? `Hey, ${user.name}.`
              : "VIK Workspace"}
          </h1>
        </div>

        <button
          className="btn btn-ghost"
          onClick={() => go("home")}
        >
          ← Site
        </button>
      </div>

      <div className="ide-layout">
        <section className="ide-editor">
          <div className="ide-title">
            <span>main.vik</span>
            <span>VIK Script</span>
          </div>

          <textarea
            spellCheck={false}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <div className="ide-actions">
            <button
              className="btn btn-primary"
              onClick={run}
            >
              ▶ Run
            </button>

            <button
              className="btn btn-ghost"
              onClick={() => setCode("")}
            >
              Clear
            </button>
          </div>
        </section>

        <section className="ide-output">
          <div className="ide-title">
            <span>Output</span>
            <span>Console</span>
          </div>

          <pre>{output}</pre>
        </section>
      </div>
    </main>
  );
}

function Footer({ go }: { go: (page: Page) => void }) {
  return (
    <footer>
      <div className="footer-main">
        <div>
          <Logo onClick={() => go("home")} />

          <p>Learn. Create. Code.</p>
        </div>

        <div>
          <b>Sitemap</b>

          <button onClick={() => go("home")}>
            Home
          </button>

          <button onClick={() => go("learn")}>
            Learn
          </button>

          <button onClick={() => go("resources")}>
            Resources
          </button>

          <button onClick={() => go("ide")}>
            IDE
          </button>
        </div>

        <div>
          <b>Socials</b>

          <a
            href={socials.instagram}
            target="_blank"
            rel="noreferrer"
          >
            Instagram ↗
          </a>

          <a
            href={socials.youtube}
            target="_blank"
            rel="noreferrer"
          >
            YouTube ↗
          </a>

          <a
            href={socials.discord}
            target="_blank"
            rel="noreferrer"
          >
            Discord ↗
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 VIK</span>
        <span>Built by TimmiDev</span>
      </div>
    </footer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("home");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [page]);

  const go = (nextPage: Page) => {
    setPage(nextPage);
  };

  return (
    <div className="app">
      <Nav page={page} go={go} />

      {page === "home" && <Hero go={go} />}
      {page === "learn" && <Learn go={go} />}
      {page === "resources" && <Resources go={go} />}
      {page === "login" && <Login go={go} />}
      {page === "ide" && <IDE go={go} />}

      <Footer go={go} />
    </div>
  );
}