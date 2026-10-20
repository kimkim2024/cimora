import { useEffect, useState } from "react";
import s from "./Anime.module.css";
import {
  CreationSteps,
  NavigationLinks,
  RewardDays,
  SelectionGrid,
} from "./components/CreativeSections";
import { animeAbilities as paths } from "./data/anime";
import { rewardLabels as rewards } from "./data/rewards";

function Placeholder({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={`${s.placeholder} ${className}`}>
      <span aria-hidden="true">＋</span>
      <strong>{label}</strong>
      <small>ARTWORK COMING SOON</small>
      <span aria-hidden="true">＋</span>
    </div>
  );
}
function AnimeHero() {
  return (
    <section className={s.hero} id="home">
      <div className={s.heroMeta}>
        <span>01 / ANIME CREATOR</span>
        <span>ORIGINAL CHARACTERS. NEW POSSIBILITIES.</span>
      </div>
      <Placeholder label="ANIME CHARACTERS + WORLD" className={s.heroArt} />
      <div className={s.heroCopy}>
        <p className={s.eyebrow}>YOUR ORIGINALS. YOUR FAVORITES.</p>
        <h1>
          BRING YOUR
          <br />
          CHARACTERS TO LIFE.
        </h1>
        <p>
          Create original characters. Reimagine your favorites. Turn them into
          art, anime shorts, cosplay looks, and virtual avatars.
        </p>
        <a className={s.cta} href="#roles">
          CHOOSE YOUR ABILITY ↓
        </a>
      </div>
      <span className={s.heroIndex} aria-hidden="true">
        AN / 01
      </span>
    </section>
  );
}

function AnimeRoleSelector({
  role,
  setRole,
  setFeature,
}: {
  role: number;
  setRole: (index: number) => void;
  setFeature: (index: number) => void;
}) {
  const selected = paths[role];
  return (
    <section className={s.specialists} id="roles" aria-labelledby="role-title">
      <div className={s.sectionTop}>
        <h2 id="role-title">CHOOSE YOUR SPECIALIST</h2>
        <span>04 CREATIVE DIRECTIONS</span>
      </div>
      <div className={s.roleLayout}>
        <aside className={s.roster}>
          <div className={s.panelLabel}>
            YOUR ABILITIES <span>04</span>
          </div>
          <SelectionGrid
            items={paths}
            selected={role}
            onSelect={setRole}
            label="Choose a creator specialist"
            controls="anime-details"
            className={s.roleGrid}
            selectedClass={s.selected}
            itemLabel={(path) => path.name}
          >
            {(path, i) => (
              <>
                <span className={s.avatar}>
                  0{i + 1}
                  <small>
                    PORTRAIT
                    <br />
                    COMING SOON
                  </small>
                </span>
                <strong>{path.name}</strong>
              </>
            )}
          </SelectionGrid>
          <p>
            ONE CHARACTER.
            <br />A NEW WAY TO CREATE.
          </p>
        </aside>
        <article className={s.details} id="anime-details">
          <Placeholder label="DEMO VIDEO" className={s.video} />
          <p className={s.eyebrow}>CORE ABILITY / 0{role + 1}</p>
          <h3>{selected.name}</h3>
          <p>{selected.desc}</p>
          <div className={s.detailRow}>
            <small>START WITH</small>
            <p>{selected.input}</p>
          </div>
          <div className={s.detailRow}>
            <small>DELIVERABLES</small>
            <div className={s.tags}>
              {selected.outputs.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          {role === 3 && (
            <p className={s.note}>
              Live2D is in exploration. Model generation and rigging
              capabilities are still being evaluated.
            </p>
          )}
          <a href="#tools" className={s.cta} onClick={() => setFeature(role)}>
            EXPLORE ABILITY ↗
          </a>
        </article>
        <div className={s.figure}>
          <span className={s.figureNumber}>0{role + 1}</span>
          <Placeholder label={selected.format} />
          <div className={s.figureCaption}>
            {selected.role}
            <span>ARTWORK PLACEHOLDER</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimeJourney() {
  return (
    <section className={s.journey} aria-labelledby="journey-title">
      <div className={s.heading}>
        <p className={s.eyebrow}>A SIMPLE CREATIVE JOURNEY</p>
        <h2 id="journey-title">FROM CHARACTER TO CREATION</h2>
        <p>Imagine it. Explore it. Make it yours.</p>
      </div>
      <CreationSteps
        className={s.steps}
        steps={[
          {
            title: "START WITH A CHARACTER",
            text: "Start with an original idea, a favorite character, or your own portrait.",
            label: "CIMORA / ANIME",
            visual: (
              <div className={s.stepGraphic} aria-hidden="true">
                <span>✧</span>
                <small>IDEA / REFERENCE / PORTRAIT</small>
              </div>
            ),
          },
          {
            title: "CHOOSE YOUR EXPRESSION",
            text: "Explore a style, outfit, scene, or story. Find the direction that brings your character to life.",
            label: "CIMORA / ANIME",
            visual: (
              <div className={s.stepGraphic} aria-hidden="true">
                <span>◈</span>
                <small>STYLE / SCENE / STORY</small>
              </div>
            ),
          },
          {
            title: "MAKE IT YOURS",
            text: "Refine character art, anime shorts, cosplay portraits, or avatar concepts for your next creation.",
            label: "YOUR CREATION",
            visual: (
              <div className={s.stepGraphic} aria-hidden="true">
                <span>↗</span>
                <small>CREATE / REFINE / SHARE</small>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}

function AnimeFeatures({
  feature,
  setFeature,
  setNotice,
}: {
  feature: number;
  setFeature: (index: number) => void;
  setNotice: (notice: string) => void;
}) {
  const detail = paths[feature];
  return (
    <section className={s.tools} id="tools" aria-labelledby="tools-title">
      <div className={s.sectionTop}>
        <h2 id="tools-title">FIND YOUR STARTING POINT</h2>
        <span>TOOLS + TEMPLATES</span>
      </div>
      <SelectionGrid
        items={paths}
        selected={feature}
        onSelect={setFeature}
        className={s.toolTabs}
        label="Choose a workflow"
        controls="template-detail"
        itemLabel={(path) => path.name}
      >
        {(path, i) => (
          <>
            {path.name}
            <span>0{i + 1}</span>
          </>
        )}
      </SelectionGrid>
      <div id="template-detail" className={s.toolDetail}>
        <div>
          <p className={s.eyebrow}>INPUT / YOUR REFERENCES</p>
          <Placeholder
            label={
              feature === 2 ? "PORTRAIT + CHARACTER REFERENCE" : detail.input
            }
          />
        </div>
        <div>
          <p className={s.eyebrow}>OUTPUT / {detail.name.toUpperCase()}</p>
          <Placeholder label={detail.format} />
        </div>
      </div>
      <div className={s.templateGrid}>
        {detail.templates.map((title, i) => (
          <article key={title}>
            <span className={s.templateNo}>0{i + 1}</span>
            <small>{detail.name.toUpperCase()} / TEMPLATE</small>
            <h3>{title}</h3>
            <button
              onClick={() =>
                setNotice(`${title} — template preview coming soon.`)
              }
            >
              PREVIEW TEMPLATE ↗
            </button>
          </article>
        ))}
      </div>
      {feature === 3 && (
        <p className={s.note}>
          Avatar concept previews only. Live2D delivery capabilities are not yet
          confirmed.
        </p>
      )}
    </section>
  );
}

function AnimeRewards({
  day,
  setDay,
}: {
  day: number;
  setDay: (index: number) => void;
}) {
  return (
    <section className={s.rewards} id="rewards" aria-labelledby="reward-title">
      <div className={s.rewardLayout}>
        <div>
          <p className={s.eyebrow}>CIMORA / DAILY LOGIN EVENT</p>
          <h2 id="reward-title">
            7 DAYS.
            <br />
            MORE TO CREATE.
          </h2>
          <p>
            Explore your daily rewards.
            <br />
            One account across Anime, Game, and Comic.
          </p>
        </div>
        <Placeholder label="ANIME REWARD SCENE" />
        <div className={s.rewardDetail}>
          <small>DAY {day + 1} / 7</small>
          <b>{rewards[day] || "TO BE ANNOUNCED"}</b>
          <p>
            {rewards[day]
              ? `Log in on Day ${day + 1} to receive ${rewards[day]?.toLowerCase()}.`
              : "The Day 5 reward is being finalized."}
          </p>
          <span>REWARD PREVIEW</span>
        </div>
      </div>
      <RewardDays
        selected={day}
        onSelect={setDay}
        className={s.days}
        selectedClass={s.selected}
        pendingLabel="TBA"
      />
    </section>
  );
}

function AnimeNavigation({ preview }: { preview: () => void }) {
  return (
    <header className={s.nav}>
      <a className={s.brand} href="/">
        CIMORA<small>STUDIO / ANIME</small>
      </a>
      <nav aria-label="Main navigation">
        <NavigationLinks
          className={s.navLinks}
          active="ANIME"
          items={[
            { label: "ANIME", href: "/anime" },
            { label: "GAME DESIGN", href: "/reference-operators.html" },
            { label: "COMIC", href: "/comic" },
            { label: "SHOWCASE", href: "/#showcase" },
          ]}
        />
      </nav>
      <button className={s.cta} onClick={preview}>
        OPEN STUDIO ↗
      </button>
    </header>
  );
}

function AnimeFooter({
  preview,
  setNotice,
}: {
  preview: () => void;
  setNotice: (notice: string) => void;
}) {
  return (
    <footer className={s.footer}>
      <div className={s.footerInvite}>
        <h2>
          YOUR NEXT CHARACTER
          <br />
          STARTS HERE.
        </h2>
        <button className={s.cta} onClick={preview}>
          OPEN STUDIO ↗
        </button>
      </div>
      <div className={s.footerLinks}>
        <a className={s.brand} href="/">
          CIMORA<small>ONE INFINITE CANVAS.</small>
        </a>
        <div>
          <strong>CREATE</strong>
          <a href="/anime">Anime Creator</a>
          <a href="/reference-operators.html">Game Builder</a>
          <a href="/comic">Comic Artist</a>
        </div>
        <div>
          <strong>EXPLORE</strong>
          <a href="#roles">Abilities</a>
          <a href="#tools">Templates</a>
          <a href="#rewards">Login rewards</a>
        </div>
        <div>
          <strong>CONNECT</strong>
          {["Community", "Help & support", "Contact"].map((label) => (
            <button
              key={label}
              onClick={() => setNotice(`${label} — destination coming soon.`)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className={s.legal}>
        <span>© {new Date().getFullYear()} CIMORA STUDIO</span>
        <a href="#home">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}

export default function Anime() {
  const [role, setRole] = useState(0),
    [feature, setFeature] = useState(0),
    [day, setDay] = useState(0),
    [notice, setNotice] = useState("");
  useEffect(() => {
    document.title = "Anime Creator — Cimora Studio";
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  const preview = () =>
    setNotice("Preview only — the studio entrance is not connected yet.");
  return (
    <div className={s.page}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <AnimeNavigation preview={preview} />
      <main id="main">
        <AnimeHero />
        <AnimeRoleSelector
          role={role}
          setRole={setRole}
          setFeature={setFeature}
        />
        <AnimeJourney />
        <AnimeFeatures
          feature={feature}
          setFeature={setFeature}
          setNotice={setNotice}
        />
        <AnimeRewards day={day} setDay={setDay} />
      </main>
      <AnimeFooter preview={preview} setNotice={setNotice} />
      {notice && (
        <div className={s.toast} role="status">
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
