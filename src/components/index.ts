// Components index

// Hero components (Google Gemini analyzer)
export { default as HeroAnalyzer } from './Hero/HeroAnalyzer';
export { HeroForm } from './Hero/HeroForm';
export { HeroResults } from './Hero/HeroResults';
export { AnalysisProgress } from './AnalysisProgress';

// Error handling
export { ErrorBoundary, CardErrorFallback, DashboardErrorFallback, PageErrorFallback } from './ErrorBoundary/index';

// Auth components
export { default as LoginForm } from './auth/LoginForm';
export { default as RegisterForm } from './auth/RegisterForm';

// Admin components
export { AdminGuard } from './admin/AdminGuard';
export { UserTable } from './admin/UserTable';
export { StatsCard } from './admin/StatsCard';

// Dashboard components
export { SubscriptionCard } from './dashboard/SubscriptionCard';
export { LimitReachedModal } from './dashboard/LimitReachedModal';

// Reusable UI components
export { default as SEOScoreDisplay } from './SEOScoreDisplay';
export { default as SEOChecklist } from './SEOChecklist';
export { default as RewritePanel } from './RewritePanel';
export { default as RewriteButton } from './RewriteButton';
export { default as RevisionTitleConcordancy } from './RevisionTitleConcordancy';

// Layout components
export { default as Header } from './Header';
export { default as HeaderClient } from './HeaderClient';
export { default as MobileMenu } from './MobileMenu';
export { default as Footer } from './Footer';

// MFA components
export { MFAEnrollDialog } from './MFAEnrollDialog';
export { MFASettings } from './MFASettings';
export { MFAVerifyDialog } from './MFAVerifyDialog';

// Marketing/Landing components
export { default as ExampleShowcase } from './landing/ExampleShowcase';
export { default as ImageAltShowcase } from './landing/ImageAltShowcase';
export { default as StatsSection } from './landing/StatsSection';

// Matomo Analytics
export { default as MatomoTagManager } from './MatomoTagManager';
