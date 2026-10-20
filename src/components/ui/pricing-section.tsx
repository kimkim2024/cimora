import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cva } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { ArrowUpRight, Diamond, Sparkles } from 'lucide-react';
import './pricing-section.css';

const buttonVariants = cva('pricing-button', {
  variants: { variant: { primary: 'pricing-button-primary', outline: 'pricing-button-outline' } },
  defaultVariants: { variant: 'primary' },
});

export interface PricingPlan {
  title: string;
  price: string;
  priceDescription: string;
  description: string;
  features: string[];
  buttonText: string;
  imageSrc?: string;
  imageAlt?: string;
  artwork?: React.ReactNode;
  featured?: boolean;
  disabled?: boolean;
}

interface PricingSectionProps {
  plans: PricingPlan[];
  onSelect: (index: number) => void;
  eyebrow?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export default function PricingSection({ plans, onSelect, eyebrow = 'Pricing plans', title = 'More room for your imagination.', description, footer }: PricingSectionProps) {
  const reducedMotion = useReducedMotion();
  return <section className="pricing-section" aria-labelledby="pricing-title">
    <header className="pricing-intro">
      {eyebrow && <p className="pricing-eyebrow"><Diamond aria-hidden="true" />{eyebrow}</p>}
      <h1 id="pricing-title">{title}</h1>
      {description && <p className="pricing-description">{description}</p>}
    </header>
    <div className={`pricing-grid${plans.length === 4 ? ' pricing-grid-four' : ''}`}>
      {plans.map((plan, index) => <motion.article key={plan.title}
        className={`pricing-card${plan.featured ? ' pricing-card-featured' : ''}`}
        initial="rest" whileHover={reducedMotion ? undefined : 'hover'}
        variants={{ rest: { y: 0, scale: 1 }, hover: { y: -5, scale: 1.015 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <div>
          <div className="pricing-card-header">
            <h2>{plan.title}</h2>
            <div className="pricing-price"><strong>{plan.price}</strong><span>{plan.priceDescription}</span></div>
            {(plan.imageSrc || plan.artwork) && <motion.div className="pricing-artwork" aria-hidden={plan.artwork ? true : undefined}
              variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.1, rotate: -5 } }}>
              {plan.artwork || <img src={plan.imageSrc} alt={plan.imageAlt || plan.title} width={96} height={96} loading="lazy" />}
            </motion.div>}
          </div>
          <p className="pricing-card-description">{plan.description}</p>
          <ul>{plan.features.map(feature => <li key={feature}>{plan.featured ? <Sparkles aria-hidden="true" /> : <Diamond aria-hidden="true" />}<span>{feature}</span></li>)}</ul>
        </div>
        <button type="button" className={buttonVariants({ variant: plan.featured ? 'primary' : 'outline' })} disabled={plan.disabled} onClick={() => onSelect(index)}>{plan.buttonText}</button>
      </motion.article>)}
    </div>
    {footer && <div className="pricing-request">{footer}</div>}
  </section>;
}

export function PricingLink({ children, href }: { children: React.ReactNode; href: string }) {
  return <Slot className={buttonVariants({ variant: 'outline' })}><a href={href}>{children}<ArrowUpRight aria-hidden="true" /></a></Slot>;
}
