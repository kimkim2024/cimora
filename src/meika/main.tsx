import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { GameButton, GameNavigation, ModeCard, PlayerBadge, ResourceCounter, RewardDialog, RewardItem, meikaAsset as asset } from '../components/meika';
import './showcase.css';

const navigation = [
  { id: 'home', label: 'HOMEPAGE', icon: asset('home-icon') },
  { id: 'heroes', label: 'HEROES', icon: asset('heroes-icon'), notification: true },
  { id: 'summon', label: 'SUMMON', icon: asset('summon-icon') },
  { id: 'guild', label: 'COALITION', icon: asset('guild-icon') },
];
const references = [{ id: 'home', name: '主界面' }, { id: 'activity', name: '活动界面' }, { id: 'battle', name: '对战界面' }, { id: 'start', name: '进入游戏' }, { id: 'reward', name: '奖励获取' }];

function Showcase() {
  const [active, setActive] = useState('home');
  const [gems, setGems] = useState(3581);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [notice, setNotice] = useState('点击卡片、导航或宝箱，体验组件交互。');
  const [reference, setReference] = useState('home');
  const [claimed, setClaimed] = useState(false);
  const [matching, setMatching] = useState(false);
  const openReward = () => { setRewardOpen(true); };
  return <main className="mk-theme mk-showcase">
    <header className="mk-topbar"><a href="#preview" className="mk-brand"><span>✦</span> MEIKA <small>UI COLLECTION / 01</small></a><nav aria-label="展示页目录"><a href="#preview">场景预览</a><a href="#components">组件陈列</a><a href="#references">设计原稿</a></nav></header>
    <section className="mk-intro"><div><p>FANTASY GAME INTERFACE</p><h1>让冒险，从界面开始。</h1></div><span>原始 PSD 素材 × React 组件<br />蓝青玻璃 · 金色高光 · 英雄叙事</span></section>
    <section id="preview" className="mk-stage" aria-label="游戏大厅组件组合预览">
      <div className="mk-stage-header"><PlayerBadge name="Adventurer III" avatar={asset('avatar')} level={15} progress={64} power="1,548,461" /><div className="mk-wallet"><ResourceCounter icon={asset('coin')} label="金币" value="87.4k" onAdd={() => setNotice('金币计数器：可通过 onAdd 接入你的充值或奖励流程。')} /><ResourceCounter icon={asset('gem')} label="钻石" value={gems} onAdd={() => { setGems(value => value + 100); setNotice('演示：钻石增加 100。'); }} /><ResourceCounter icon={asset('key')} label="钥匙" value={12} /></div></div>
      <img className="mk-hero-art" src={asset('boar-rider')} alt="挥舞火焰战锤的野猪骑士" />
      <aside className="mk-shortcuts" aria-label="快捷入口">{[{ icon: 'mail-icon', label: 'MAIL' }, { icon: 'shop-icon', label: 'SHOP' }, { icon: 'friends-icon', label: 'FRIENDS' }].map(item => <button key={item.label} type="button" onClick={() => setNotice(`${item.label}：这是组件演示入口，可接入实际页面。`)}><img src={asset(item.icon)} alt="" /><span>{item.label}</span></button>)}</aside>
      <div className="mk-mode-grid"><ModeCard className="mk-featured" title={matching ? 'MATCHING…' : 'ISLAND BRAWL'} tag="TEAM ADVENTURE" subtitle={matching ? '演示匹配中 · 点击取消' : '组建你的队伍，开启岛屿对决'} image={asset('landscape')} progress={matching ? 80 : 0} onClick={() => { setMatching(value => !value); setNotice(matching ? '已取消演示匹配。' : '匹配状态演示，不会连接游戏服务器。'); }} /><ModeCard title="BATTLE" tag="SEASON 3" subtitle="SOLO / 单人挑战" image={asset('knight')} progress={65} onClick={() => setNotice('已选择单人挑战。这里可接入模式详情或匹配流程。')} /><ModeCard title="EVENT" tag="BALL WITCH" subtitle="限时活动" image={asset('witch')} onClick={openReward} /></div>
      <button type="button" className="mk-chest" onClick={openReward}><img src={asset('chest')} alt="" /><span><strong>HANG-UP REWARDS</strong><small>冒险间隙，也有收获</small></span></button>
      <div className="mk-stage-nav"><GameNavigation items={navigation} active={active} onSelect={id => { setActive(id); setNotice(`已切换到 ${navigation.find(item => item.id === id)?.label} 导航状态。`); }} /></div>
    </section>
    <p className="mk-status" role="status"><span aria-hidden="true">✦</span> {notice}</p>
    <section id="components" className="mk-components"><div className="mk-section-title"><p>THE BUILDING BLOCKS</p><h2>拆得开，也组合得起来。</h2><span>文字、数值、选中态与事件可配置；插画直接来自 PSD 图层。</span></div>
      <div className="mk-component-grid"><article><span className="mk-number">01 / ACTION</span><h3>主操作按钮</h3><div className="mk-button-row"><GameButton onClick={openReward}>START</GameButton><GameButton tone="gold" onClick={() => { setClaimed(true); setRewardOpen(true); }} disabled={claimed}>{claimed ? '已领取' : '领取奖励'}</GameButton><GameButton disabled>暂未解锁</GameButton></div><p>默认、悬停、按下、键盘焦点和禁用状态。</p></article>
      <article><span className="mk-number">02 / TREASURE</span><h3>道具与稀有度</h3><div className="mk-item-row"><RewardItem image={asset('key')} name="秘境钥匙" quantity={3} /><RewardItem image={asset('ring')} name="魔法戒指" rarity="epic" /><RewardItem image={asset('potion')} name="星辰药剂" rarity="legendary" /></div><p>蓝、紫、金三档表现，图标和数量独立传入。</p></article>
      <article><span className="mk-number">03 / IDENTITY</span><h3>玩家身份与资源</h3><PlayerBadge name="你的冒险者" avatar={asset('avatar')} level={28} progress={72} power="2,160,890" /><div className="mk-resource-example"><ResourceCounter icon={asset('gem')} label="钻石" value={gems} onAdd={() => setGems(value => value + 100)} /></div><p>支持动态数值、等级进度和资源增加事件。</p></article>
      <article><span className="mk-number">04 / FEEDBACK</span><h3>奖励反馈</h3><div className="mk-feedback-example"><img src={asset('crystal')} alt="蓝色星芒水晶" /><div><p>让关键时刻，有足够的仪式感。</p><GameButton onClick={openReward}>查看奖励弹窗</GameButton></div></div><p>原生模态框：焦点约束、Esc 关闭、关闭后恢复焦点。</p></article></div>
    </section>
    <section id="references" className="mk-references"><div className="mk-section-title"><p>THE ORIGINAL ARTWORK</p><h2>风格有出处，细节有依据。</h2><span>以下为原始设计稿预览；上方为组件组合示例。</span></div><div className="mk-reference-tabs" role="group" aria-label="选择原稿">{references.map(item => <button type="button" aria-pressed={reference === item.id} key={item.id} onClick={() => setReference(item.id)}>{item.name}</button>)}</div><img className="mk-reference-image" src={asset(`reference-${reference}`)} alt={references.find(item => item.id === reference)?.name} loading="lazy" /></section>
    <footer className="mk-footer"><strong>MEIKA / UI COLLECTION</strong><span>7 个可复用组件 · 原稿比例 2436 × 1125 · 当前使用系统替代字体</span></footer>
    <RewardDialog open={rewardOpen} onClose={() => setRewardOpen(false)}><RewardItem image={asset('crystal')} name="星芒水晶" quantity={1} /></RewardDialog>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Showcase /></StrictMode>);
