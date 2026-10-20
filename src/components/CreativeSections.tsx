import { useEffect, useRef, type ReactNode } from "react";
import { rewardLabels } from "../data/rewards";

/** Shared selection semantics; each page keeps its approved card presentation. */
export function SelectionGrid<T>({
  items,
  selected,
  onSelect,
  label,
  controls,
  className,
  buttonClass,
  selectedClass = "selected",
  itemLabel,
  children,
}: {
  items: readonly T[];
  selected: number;
  onSelect: (index: number) => void;
  label: string;
  controls?: string;
  className?: string;
  buttonClass?: string;
  selectedClass?: string;
  itemLabel: (item: T, index: number) => string;
  children: (item: T, index: number) => ReactNode;
}) {
  return (
    <div className={className} role="group" aria-label={label}>
      {items.map((item, index) => (
        <button
          key={itemLabel(item, index)}
          type="button"
          className={`${buttonClass || ""} ${selected === index ? selectedClass : ""}`}
          aria-label={itemLabel(item, index)}
          aria-controls={controls}
          aria-pressed={selected === index}
          onClick={() => onSelect(index)}
        >
          {children(item, index)}
        </button>
      ))}
    </div>
  );
}
export type JourneyStep = {
  title: ReactNode;
  text: string;
  label: string;
  visual: ReactNode;
  takeaway?: string;
  external?: boolean;
};
export function CreationSteps({
  steps,
  className,
  cardClass,
  externalClass,
  titleLevel = 3,
}: {
  steps: JourneyStep[];
  className: string;
  cardClass?: string;
  externalClass?: string;
  titleLevel?: 2 | 3;
}) {
  const Heading = titleLevel === 2 ? "h2" : "h3";
  return (
    <ol className={className}>
      {steps.map((step, index) => (
        <li
          key={index}
          className={`${cardClass || ""} ${step.external ? externalClass || "" : ""}`}
        >
          <header>
            <span>
              <b>{String(index + 1).padStart(2, "0")}</b>
            </span>
            <small>{step.label}</small>
          </header>
          {step.visual}
          <Heading>{step.title}</Heading>
          <p>{step.text}</p>
          {step.takeaway && (
            <footer>
              <small>
                {step.external ? "CONTINUE IN YOUR CODING TOOL" : "TAKE AWAY"}
              </small>
              <strong>{step.takeaway}</strong>
            </footer>
          )}
        </li>
      ))}
    </ol>
  );
}
export function RewardDays({
  selected,
  onSelect,
  className,
  selectedClass,
  pendingLabel = "",
}: {
  selected: number;
  onSelect: (day: number) => void;
  className: string;
  selectedClass?: string;
  pendingLabel?: string;
}) {
  return (
    <SelectionGrid
      items={rewardLabels}
      selected={selected}
      onSelect={onSelect}
      className={className}
      selectedClass={selectedClass}
      label="Daily login rewards"
      itemLabel={(reward, index) =>
        `Day ${index + 1}: ${reward || "To be announced"}`
      }
    >
      {(reward, index) => (
        <>
          <small>DAY</small>
          <b>{index + 1}</b>
          <span>{reward || pendingLabel}</span>
        </>
      )}
    </SelectionGrid>
  );
}
export function NavigationLinks({
  items,
  active,
  className,
  activeClass,
}: {
  items: { label: string; href: string }[];
  active: string;
  className?: string;
  activeClass?: string;
}) {
  return (
    <div className={className}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className={item.label === active ? activeClass : undefined}
          aria-current={item.label === active ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
export function ExampleDialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="equipmentDialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        className="dialogClose"
        aria-label="Close viewer"
        onClick={onClose}
      >
        ×
      </button>
      <div className="dialogBody">{children}</div>
    </dialog>
  );
}
