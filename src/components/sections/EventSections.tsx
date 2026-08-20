import { FaqSection } from '@/components/faq/FaqSection';
import { SiteFooter } from '@/components/footer/SiteFooter';
import styles from './EventSections.module.css';

export function EventSections() {
  return (
    <div className={styles.sections}>
      <FaqSection />
      <SiteFooter />
    </div>
  );
}
