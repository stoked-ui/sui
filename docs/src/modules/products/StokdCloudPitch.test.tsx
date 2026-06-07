import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect } from 'chai';
import StokdCloudPitch from './StokdCloudPitch';
import {
  STOKD_CLOUD_APP_URL,
  stokdCloudHero,
  stokdCloudPillars,
  stokdCloudTrustItems,
  stokdCloudComparisonRows,
  stokdCloudFeatures,
  stokdCloudPricingTiers,
  stokdCloudDocLinks,
} from './stokdCloudContent';

describe('stokdCloudContent — value proposition coverage', () => {
  it('hero pitches the core value prop: agents that remember why the code exists', () => {
    expect(`${stokdCloudHero.headlinePart1} ${stokdCloudHero.headlinePart2}`).to.match(
      /remember.*why your code exists/i,
    );
    expect(stokdCloudHero.subheading).to.match(/spec/i);
    expect(stokdCloudHero.badge).to.match(/Claude/i);
    expect(stokdCloudHero.badge).to.match(/Codex/i);
    expect(stokdCloudHero.badge).to.match(/Gemini/i);
  });

  it('has the two pillars: an enforced spec (axioms) and decision history', () => {
    expect(stokdCloudPillars).to.have.length(2);
    const allPillarText = stokdCloudPillars
      .map((p) => `${p.tag} ${p.title} ${p.description} ${p.points.join(' ')}`)
      .join(' ');
    expect(allPillarText).to.match(/axiom/i);
    expect(allPillarText).to.match(/governance gate|enforced/i);
    expect(allPillarText).to.match(/git why|decision history|why every line/i);
    stokdCloudPillars.forEach((pillar) => {
      expect(pillar.points.length).to.be.greaterThan(2);
    });
  });

  it('covers the governance trust story: work model, acceptance criteria, isolation, HITL', () => {
    expect(stokdCloudTrustItems.length).to.be.at.least(4);
    const trustText = stokdCloudTrustItems.map((t) => `${t.title} ${t.description}`).join(' ');
    expect(trustText).to.match(/acceptance criteria/i);
    expect(trustText).to.match(/worktree/i);
    expect(trustText).to.match(/spend|budget/i);
    expect(trustText).to.match(/approve|you steer|in control/i);
  });

  it('contrasts a raw coding agent with the same agent on Stokd', () => {
    expect(stokdCloudComparisonRows.length).to.be.at.least(6);
    stokdCloudComparisonRows.forEach((row) => {
      expect(row.raw).to.be.a('string').that.is.not.empty;
      expect(row.stokd).to.be.a('string').that.is.not.empty;
    });
  });

  it('lists the platform feature set', () => {
    expect(stokdCloudFeatures.length).to.be.at.least(8);
    const featureText = stokdCloudFeatures.map((f) => `${f.title} ${f.description}`).join(' ');
    expect(featureText).to.match(/TDD|red\/green/i);
    expect(featureText).to.match(/GitHub/i);
    expect(featureText).to.match(/observability|real-time/i);
  });

  it('shows both pricing tiers with current pricing', () => {
    expect(stokdCloudPricingTiers).to.have.length(2);
    const [personal, organization] = stokdCloudPricingTiers;
    expect(personal.price).to.contain('$20');
    expect(organization.price).to.contain('$10');
    stokdCloudPricingTiers.forEach((tier) => {
      expect(tier.href).to.contain(STOKD_CLOUD_APP_URL);
      expect(tier.features.length).to.be.greaterThan(2);
    });
  });

  it('links every doc page under the stokd-cloud product docs path', () => {
    expect(stokdCloudDocLinks.length).to.be.at.least(4);
    stokdCloudDocLinks.forEach((doc) => {
      expect(doc.href).to.match(/^\/products\/stokd-cloud\/docs\//);
    });
  });

  it('points the primary CTA at the production app', () => {
    expect(STOKD_CLOUD_APP_URL).to.equal('https://stokd.cloud');
  });
});

describe('<StokdCloudPitch />', () => {
  it('renders the full sales pitch markup', () => {
    const markup = renderToStaticMarkup(<StokdCloudPitch />);

    // Hero value prop
    expect(markup).to.contain(stokdCloudHero.headlinePart2);
    // Both pillars render
    stokdCloudPillars.forEach((pillar) => {
      expect(markup).to.contain(pillar.title);
    });
    // Comparison rows render
    expect(markup).to.contain(stokdCloudComparisonRows[0].stokd);
    // Pricing renders
    expect(markup).to.contain('$20');
    // Primary CTA target
    expect(markup).to.contain(STOKD_CLOUD_APP_URL);
    // Docs links
    expect(markup).to.contain('/products/stokd-cloud/docs/overview/');
  });
});
