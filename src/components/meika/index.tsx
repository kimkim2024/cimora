import { useEffect, useId, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './meika.css';

export const meikaAsset = (name: string) => `/meika/${name}.webp`;

export function GameButton({ tone = 'blue', size = 'default', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'blue' | 'gold'; size?: 'default' | 'compact' | 'icon' }) {
  return <button type="button" className={`mk-button mk-button--${tone} mk-button--${size} ${className}`} {...props}>{size === 'default' && <span aria-hidden="true">✦</span>}<span className="mk-button-content">{children}</span>{size === 'default' && <span aria-hidden="true">✦</span>}</button>;
}

export function ResourceCounter({ icon, label, value, onAdd, iconAction }: { icon: string; label: string; value: string | number; onAdd?: () => void; iconAction?: { label: string; onClick: React.MouseEventHandler<HTMLButtonElement> } }) {
  return <div className="mk-resource">{iconAction ? <button type="button" className="mk-resource-icon-action" aria-label={iconAction.label} title={iconAction.label} onClick={iconAction.onClick}><img src={icon} alt="" /></button> : <img src={icon} alt="" />}<span className="mk-sr-only">{label}：</span><strong>{value}</strong>{onAdd && <button type="button" aria-label={`增加${label}`} onClick={onAdd}>✚</button>}</div>;
}

export function PlayerBadge({ name, avatar, level, progress, power, subtitle }: { name: string; avatar: string; level?: number; progress?: number; power?: string; subtitle?: ReactNode }) {
  return <div className="mk-player"><div className="mk-avatar"><img src={avatar} alt="" />{level !== undefined && <span>Lv.{level}</span>}</div><div><strong>{name}</strong>{progress !== undefined && <progress aria-label="等级进度" value={progress} max={100} />}{power && <small>✦ {power}</small>}{subtitle && <div className="mk-player-subtitle">{subtitle}</div>}</div></div>;
}

export function ModeCard({ title, subtitle, image, tag, progress, onClick, className = '' }: { title: string; subtitle: string; image: string; tag?: string; progress?: number; onClick: () => void; className?: string }) {
  return <button type="button" className={`mk-mode ${className}`} onClick={onClick}><img src={image} alt="" /><span className="mk-mode-copy">{tag && <em>{tag}</em>}<strong>{title}</strong><span>{subtitle}</span></span>{progress !== undefined && <progress aria-label={`${title}进度`} max={100} value={progress} />}</button>;
}

export function GameNavigation({ items, active, onSelect, label = '游戏导航' }: { items: { id: string; label: string; icon: string; notification?: boolean }[]; active: string; onSelect: (id: string) => void; label?: string }) {
  return <nav className="mk-nav" aria-label={label}>{items.map(item => <button type="button" key={item.id} aria-pressed={active === item.id} onClick={() => onSelect(item.id)}><img src={item.icon} alt="" /><span>{item.label}</span>{item.notification && <span className="mk-notification" aria-label="有新内容">!</span>}</button>)}</nav>;
}

export function RewardItem({ image, name, rarity = 'rare', quantity }: { image: string; name: string; rarity?: 'rare' | 'epic' | 'legendary'; quantity?: number }) {
  return <figure className={`mk-reward mk-reward--${rarity}`}><div><img src={image} alt={name} /></div><figcaption>{name}{quantity !== undefined && <strong>×{quantity}</strong>}</figcaption></figure>;
}

export function RewardDialog({ open, onClose, children, title = 'REWARD' }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return <dialog className="mk-dialog" ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="mk-dialog-content"><button className="mk-close" type="button" aria-label="关闭奖励" onClick={onClose}>×</button><h2 id={titleId}>{title}</h2><div className="mk-dialog-rewards">{children}</div><GameButton onClick={onClose}>收下奖励</GameButton><p>点击空白处或按 Esc 关闭</p></div></dialog>;
}
