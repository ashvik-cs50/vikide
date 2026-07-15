// Wrapper that groups all landing section components into a single default-exported chunk
import {
  StatsBar,
  CodePreviewSection,
  CTASection,
  LanguagesSection,
  TestimonialsSection,
  PricingSection,
  CommunityStats,
} from './LandingSections';

export { StatsBar, CodePreviewSection, CTASection, LanguagesSection, TestimonialsSection, PricingSection, CommunityStats };

export default function LandingView() {
  return (
    <>
      <StatsBar />
      <CodePreviewSection />
      <CTASection />
      <LanguagesSection />
      <TestimonialsSection />
      <PricingSection />
      <CommunityStats />
    </>
  );
}
