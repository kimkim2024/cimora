import { useEffect, useRef, useState } from "react";
import GameCharacter from "./GameCharacter";
import { gameAbilities } from "./data/game";
import "./Game.css";

const colors = [
  "#ffc735",
  "#ec729e",
  "#bca4ff",
  "#82ddce",
  "#ff795d",
  "#a8b9e7",
];
const panels = {
  scenes: {
    title: "SCENE DEMOS",
    label: "WORLDS WORTH EXPLORING",
    text: "Explore environments, lighting, and the mood of your next game.",
    image: "/images/worlds.png",
  },
  events: {
    title: "STUDIO EVENTS",
    label: "YOUR NEXT CREATIVE CHALLENGE",
    text: "Upcoming creative challenges will appear here. No events are open yet.",
    image: "",
  },
  posters: {
    title: "POSTER GALLERY",
    label: "GIVE YOUR WORLD A FACE",
    text: "Explore a visual direction for your game’s key art. Concept artwork preview.",
    image: "/images/cimora-game-cover-16x9.png",
  },
  discord: {
    title: "JOIN OUR DISCORD",
    label: "THE COMMUNITY IS COMING",
    text: "The official channel invitation has not been connected yet. Check back soon.",
    image: "",
  },
  projects: {
    title: "YOUR PROJECTS",
    label: "PROJECT WORKSPACE",
    text: "The project page is not connected to this preview yet. Your selected specialist is ready for the future workspace.",
    image: "",
  },
};
type Panel = keyof typeof panels;
function PreviewDialog({ panel, close }: { panel: Panel; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const content = panels[panel];
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      className="gb-dialog"
      ref={ref}
      aria-labelledby="preview-title"
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <button className="gb-close" onClick={close} aria-label="Close preview">
        ×
      </button>
      <small>{content.label}</small>
      <h2 id="preview-title">{content.title}</h2>
      {content.image ? (
        <img src={content.image} alt={content.title + " concept preview"} />
      ) : (
        <div className="gb-empty">
          ◇
          <span>
            {panel === "events" ? "NEXT CHAPTER / COMING SOON" : "COMING SOON"}
          </span>
        </div>
      )}
      <p>{content.text}</p>
      {content.image && (
        <small>CONCEPT PREVIEW · NOT A VERIFIED GENERATED RESULT</small>
      )}
    </dialog>
  );
}
function Landscape() {
  return (
    <div className="gb-landscape" aria-hidden="true">
      <div className="gb-sun" />
      <div className="gb-ridge gb-ridge-far" />
      <div className="gb-ridge gb-ridge-near" />
      <div className="gb-water" />
      <div className="gb-gate">
        <i />
        <i />
        <b />
        <em />
      </div>
      <div className="gb-mist" />
      <div className="gb-grain" />
    </div>
  );
}
export default function Game() {
  const [selected, setSelected] = useState(0);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [paused, setPaused] = useState(false);
  const ability = gameAbilities[selected];
  useEffect(() => {
    document.title = "Game Builder — Cimora Studio";
  }, []);
  return (
    <div className={"gb-page" + (paused ? " gb-paused" : "")}>
      <section
        className="gb-lobby"
        id="cover"
        aria-label="Game Builder creative lobby"
      >
        <Landscape />
        <header className="gb-topbar">
          <a href="/" className="gb-brand">
            <b>◈</b>
            <span>
              CIMORA<small>GAME BUILDER</small>
            </span>
          </a>
          <nav aria-label="Game Builder navigation">
            <a className="gb-active" href="#cover">
              LOBBY
            </a>
            <a href="#operators">CHARACTERS</a>
            <a href="#showcase">GALLERY</a>
          </nav>
          <div className="gb-tools">
            <span>AI CREATIVE STUDIO</span>
            <button
              onClick={() => setPaused(!paused)}
              aria-pressed={paused}
              aria-label={
                paused
                  ? "Resume background animation"
                  : "Pause background animation"
              }
            >
              {paused ? "▶" : "Ⅱ"}
            </button>
            <a href="/" aria-label="Cimora home">
              ⌂
            </a>
          </div>
        </header>
        <main className="gb-lobby-grid">
          <aside className="gb-left" aria-label="Explore the studio">
            <button
              className="gb-scene-card"
              onClick={() => setPanel("scenes")}
            >
              <span className="gb-tag">EXPLORE</span>
              <div className="gb-mini-landscape">
                <span />
              </div>
              <div className="gb-card-foot">
                <strong>SCENE DEMOS</strong>
                <span>↗</span>
              </div>
            </button>
            <button
              className="gb-event-card"
              onClick={() => setPanel("events")}
            >
              <small>WHAT’S NEXT / STUDIO EVENTS</small>
              <strong>
                MAKE YOUR
                <br />
                NEXT MOVE.
              </strong>
              <span>EXPLORE EVENTS ↗</span>
            </button>
            <button
              className="gb-poster-card"
              onClick={() => setPanel("posters")}
            >
              <div>
                <small>THE ART OF POSSIBILITY</small>
                <strong>
                  POSTER
                  <br />
                  GALLERY
                </strong>
                <span>VIEW COLLECTION ↗</span>
              </div>
              <img src="/images/cimora-game-cover-16x9.png" alt="" />
            </button>
          </aside>
          <div className="gb-stage">
            <div className="gb-nameplate">
              <span>0{selected + 1}</span>
              <div>
                <strong>{ability.role}</strong>
                <small>CIMORA / CREATOR SPECIALIST</small>
              </div>
            </div>
            <div className="gb-character">
              <GameCharacter
                color={colors[selected]}
                variant={selected}
              />
            </div>
            <a className="gb-yellow gb-select" href="#operators">
              CHOOSE YOUR CHARACTER <span>↓</span>
            </a>
          </div>
          <aside className="gb-right">
            <button className="gb-discord" onClick={() => setPanel("discord")}>
              <span>◉</span>
              <strong>
                JOIN OUR
                <br />
                DISCORD
              </strong>
              <small>FIND YOUR CREATIVE PEOPLE ↗</small>
            </button>
            <nav className="gb-section-nav" aria-label="Explore Game Builder">
              <a href="#results">
                <small>01 / LEARN</small>HOW TO MAKE A GAME <span>↗</span>
              </a>
              <a href="#tech">
                <small>02 / DISCOVER</small>PRODUCT FEATURES <span>↗</span>
              </a>
              <a href="#showcase">
                <small>03 / GET INSPIRED</small>CREATIONS <span>↗</span>
              </a>
            </nav>
            <div className="gb-start">
              <p>YOUR IDEA. YOUR NEXT WORLD.</p>
              <button
                className="gb-yellow"
                onClick={() => setPanel("projects")}
              >
                <small>LET’S MAKE IT REAL</small>START CREATING <span>↗</span>
              </button>
              <span>AI CONCEPTS · CHARACTERS · GAME ASSETS</span>
            </div>
          </aside>
        </main>
        <div className="gb-lobby-footer">
          <div>
            <h1>IMAGINE YOUR NEXT GAME.</h1>
            <p>Explore ideas. Create visuals. Bring your world together.</p>
          </div>
          <span>ANIMATED SCENE STUDY / 3D PLACEHOLDER</span>
          <a href="#operators">EXPLORE THE STUDIO ↓</a>
        </div>
      </section>
      <section className="gb-section" id="operators">
        <div className="gb-heading">
          <div>
            <small>01 / THE CREATIVE ROSTER</small>
            <h2>
              CHOOSE YOUR
              <br />
              <em>CHARACTER.</em>
            </h2>
          </div>
          <p>
            Different skills. One creative canvas.
            <br />
            Find the specialist for your next idea.
          </p>
        </div>
        <div className="gb-roster">
          {gameAbilities.map((item, index) => (
            <button
              key={item.role}
              aria-pressed={index === selected}
              aria-controls="gb-specialist-details"
              onClick={() => setSelected(index)}
            >
              <span>0{index + 1}</span>
              <div className="gb-portrait" style={{ color: colors[index] }}>
                {["◇", "✦", "▧", "⌖", "ϟ", "⬡"][index]}
              </div>
              <strong>{item.english}</strong>
              <small>
                {selected === index ? "SELECTED ✓" : "SELECT SPECIALIST ↗"}
              </small>
            </button>
          ))}
        </div>
        <article className="gb-specialist" id="gb-specialist-details">
          <div>
            <small>CURRENT SPECIALIST / 0{selected + 1}</small>
            <h3>{ability.role}</h3>
            <p>{ability.desc}</p>
          </div>
          <div>
            <small>START WITH</small>
            <p>{ability.input}</p>
            <small>CREATE</small>
            <p>{ability.outputs.join(" / ")}</p>
          </div>
          <a className="gb-text-link" href="#cover">
            VIEW IN LOBBY ↑
          </a>
        </article>
      </section>
      <section className="gb-section gb-journey" id="results">
        <div className="gb-heading">
          <div>
            <small>02 / FROM AN IDEA TO A WORLD</small>
            <h2>
              MAKE THE
              <br />
              <em>FIRST MOVE.</em>
            </h2>
          </div>
          <p>
            Your game starts with a possibility.
            <br />
            Give it a shape, then take it further.
          </p>
        </div>
        <div className="gb-steps">
          {[
            {
              title: "FIND YOUR IDEA",
              text: "Explore worlds, mechanics, and visual references. Shape a clear concept on your canvas.",
              out: "CONCEPT + MOODBOARD",
            },
            {
              title: "SEE IT IN MOTION",
              text: "Develop characters, scenes, and storyboards. Visualize the experience before building it.",
              out: "VISUALS + DEMO DIRECTION",
            },
            {
              title: "BRING IT TO CODE",
              text: "Take your assets and specifications into your coding tool to develop and test a playable prototype.",
              out: "CONTINUE IN YOUR CODING TOOL",
            },
          ].map((step, i) => (
            <article key={step.title}>
              <span>0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <small>{step.out}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="gb-section" id="tech">
        <div className="gb-heading">
          <div>
            <small>03 / YOUR CREATIVE TOOLKIT</small>
            <h2>
              LESS FRICTION.
              <br />
              <em>MORE POSSIBILITY.</em>
            </h2>
          </div>
        </div>
        <div className="gb-features">
          <article>
            <span>01 / ORGANIZE</span>
            <h3>
              One canvas.
              <br />
              The whole picture.
            </h3>
            <p>
              Keep references, characters, and environments together. Build
              connections between your ideas.
            </p>
            <div
              className="gb-canvas-demo"
              aria-label="Conceptual canvas illustration"
            >
              <b>REFERENCE</b>
              <i>→</i>
              <b>CHARACTER</b>
              <i>→</i>
              <b>WORLD</b>
            </div>
          </article>
          <article>
            <span>02 / EXPLORE</span>
            <h3>
              A direction for
              <br />
              every creative task.
            </h3>
            <p>
              Explore concepts, characters, interfaces, visual guides, effects,
              and assets through specialist workflows.
            </p>
            <a href="#operators">MEET THE SPECIALISTS ↗</a>
          </article>
        </div>
      </section>
      <section className="gb-section" id="showcase">
        <div className="gb-heading">
          <div>
            <small>04 / A GLIMPSE OF WHAT’S POSSIBLE</small>
            <h2>
              WORLDS WAITING
              <br />
              <em>TO HAPPEN.</em>
            </h2>
          </div>
          <p>
            Concept artwork and visual studies.
            <br />A starting point for your imagination.
          </p>
        </div>
        <div className="gb-showcase">
          <button onClick={() => setPanel("scenes")}>
            <img
              src="/images/worlds.png"
              alt="Environment concept study"
              loading="lazy"
            />
            <span>
              WORLD EXPLORATION <b>↗</b>
            </span>
          </button>
          <button onClick={() => setPanel("posters")}>
            <img
              src="/images/cimora-game-cover-16x9.png"
              alt="Game key art concept"
              loading="lazy"
            />
            <span>
              KEY ART & CHARACTERS <b>↗</b>
            </span>
          </button>
        </div>
      </section>
      <footer className="gb-footer">
        <a className="gb-brand" href="/">
          ◈ CIMORA STUDIO
        </a>
        <p>YOUR NEXT WORLD STARTS WITH YOU.</p>
        <a href="#cover">BACK TO LOBBY ↑</a>
      </footer>
      {panel && <PreviewDialog panel={panel} close={() => setPanel(null)} />}
    </div>
  );
}
