export function GameWordmark() {
  return (
    <svg
      viewBox="0 0 1128 100"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      fillRule="evenodd"
    >
      <path
        transform="translate(0 0)"
        d="M14 0H60V22H22V78H60V100H14L0 86V14Z"
      />
      <path
        transform="translate(76 0)"
        d="M0 0H48L64 16V46L52 58L68 100H43L27 62H22V100H0ZM22 20V42H42V20Z"
      />
      <path
        transform="translate(152 0)"
        d="M0 0H60V22H22V39H52V61H22V78H60V100H0Z"
      />
      <path
        transform="translate(228 0)"
        d="M14 0H50L64 14V100H42V62H22V100H0V14ZM22 22V42H42V22Z"
      />
      <path transform="translate(304 0)" d="M0 0H64V22H43V100H21V22H0Z" />
      <path
        transform="translate(380 0)"
        d="M0 0H60V22H22V39H52V61H22V78H60V100H0Z"
      />
      <path
        transform="translate(488 0)"
        d="M0 0H24L34 34L44 0H68L45 59V100H23V59Z"
      />
      <path
        transform="translate(564 0)"
        d="M14 0H50L64 14V86L50 100H14L0 86V14ZM22 22V78H42V22Z"
      />
      <path
        transform="translate(640 0)"
        d="M0 0H22V78H42V0H64V86L50 100H14L0 86Z"
      />
      <path
        transform="translate(716 0)"
        d="M0 0H48L64 16V46L52 58L68 100H43L27 62H22V100H0ZM22 20V42H42V20Z"
      />
      <path
        transform="translate(824 0)"
        d="M14 0H64V22H22V78H42V62H32V42H64V86L50 100H14L0 86V14Z"
      />
      <path
        transform="translate(900 0)"
        d="M14 0H50L64 14V100H42V62H22V100H0V14ZM22 22V42H42V22Z"
      />
      <path
        transform="translate(976 0)"
        d="M0 0H22L38 36L54 0H76V100H54V43L38 76L22 43V100H0Z"
      />
      <path
        transform="translate(1064 0)"
        d="M0 0H60V22H22V39H52V61H22V78H60V100H0Z"
      />
    </svg>
  );
}
export function ReferenceArt({
  box,
  className,
  meet = false,
}: {
  box: number[];
  className?: string;
  meet?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox={box.join(" ")}
      preserveAspectRatio={meet ? "xMidYMid meet" : "xMidYMid slice"}
    >
      <image
        href="/images/extraction-reference.jpg"
        width="1920"
        height="9069"
      />
    </svg>
  );
}
export function GameStepVisual({ index }: { index: number }) {
  return [
    <div key="concept" className="stepVisual conceptVisual" aria-hidden="true">
      <div className="conceptNote">
        <small>THE SEED</small>
        <b>
          A city above
          <br />
          the clouds.
        </b>
      </div>
      <div className="conceptTags">
        <span>WORLD</span>
        <span>CORE LOOP</span>
        <span>VISUAL STYLE</span>
      </div>
      <div className="conceptLine"></div>
      <div className="conceptOutput">GAME CONCEPT BRIEF ↗</div>
    </div>,
    <div key="video" className="stepVisual videoVisual" aria-hidden="true">
      <div className="demoFrame">
        <span>CONCEPT DEMO / 001</span>
        <div className="demoLandscape"></div>
        <b>▶</b>
        <small>YOUR GAME, IN MOTION.</small>
      </div>
      <div className="demoTimeline">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>,
    <div key="code" className="stepVisual codeVisual" aria-hidden="true">
      <div className="handoffFiles">
        <span>DEMO.mp4</span>
        <span>GAMEPLAY.md</span>
        <span>ASSETS /</span>
      </div>
      <div className="handoffArrow">↓</div>
      <div className="codeWindow">
        <small>AI CODING WORKSPACE</small>
        <code>
          <span>// Build from your concept</span>
          <br />
          player.move(input);
          <br />
          world.update();
          <br />
          <em>prototype.play();</em>
        </code>
      </div>
    </div>,
  ][index];
}
