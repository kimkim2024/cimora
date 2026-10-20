import { useEffect } from 'react';
import SiteNavigation from './components/SiteNavigation';
import PricingSection, { type PricingPlan } from './components/ui/pricing-section';
import './Pricing.css';

const plans: PricingPlan[] = [
  {
    title: 'Free', price: 'Free', priceDescription: 'Every story starts here.',
    description: 'A little space for your next big idea.',
    features: ['Free tier', 'Credit amount to be confirmed', 'Plan details coming soon'],
    buttonText: 'Free plan', disabled: true,
  },
  {
    title: 'Hobbyist', price: '$9.99', priceDescription: 'USD · One-time payment',
    description: 'Make room for experiments, discoveries, and personal projects.',
    features: ['One-time credit pack', 'No subscription', 'Credit amount to be confirmed'],
    buttonText: 'Coming soon', disabled: true,
  },
  {
    title: 'Pro creator', price: '$29.99', priceDescription: 'USD · One-time payment',
    description: 'For creators building their next distinctive body of work.',
    features: ['One-time credit pack', 'No subscription', 'Credit amount to be confirmed'],
    buttonText: 'Coming soon', disabled: true, featured: true,
  },
  {
    title: 'Studio elite', price: '$79.99', priceDescription: 'USD · One-time payment',
    description: 'A bigger stage for ambitious creative work.',
    features: ['One-time credit pack', 'No subscription', 'Credit amount to be confirmed'],
    buttonText: 'Coming soon', disabled: true,
  },
].map((plan, index) => ({ ...plan, artwork: <div className={`pricing-gems pricing-gems-${index + 1}`}>{Array.from({ length: index + 1 }, (_, gem) => <img key={gem} src="/meika/gem.webp" alt="" width={40} height={48} />)}</div> }));

export default function Pricing() {
  useEffect(() => { document.title = 'Pricing — Cimora Studio'; }, []);
  return <div className="pricing-page">
    <SiteNavigation />
    <main>
      <PricingSection plans={plans} onSelect={() => {}} eyebrow=""
        title="A little spark. A whole new world."
        description="Start with an idea. Find the credit pack for what comes next. One-time top-ups, with no subscription."
        footer={<><div><h2>Unique Request</h2><p>Are you looking for something custom? Don't hesitate to contact us, and we'll help brainstorm your product to success.</p></div><button type="button" className="pricing-request-button" disabled title="Contact details coming soon">Let's Talk</button></>} />
      <p className="pricing-availability">Pricing preview · Credit amounts and plan benefits are being finalized. Purchases are not available yet.</p>
    </main>
    <footer className="pricing-footer"><a href="/">CIMORA STUDIO</a><span>Made for the worlds you imagine.</span><a href="/projects">Explore the workspace ↗</a></footer>
  </div>;
}
