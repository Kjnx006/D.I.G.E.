import { useI18n } from '../../i18n';
import { qaLocales } from '../../i18n/qa/locales';
import Icon from '../ui/Icon';
import ExpandableCard from '../ui/ExpandableCard';
import Modal from '../ui/Modal';

export default function QAModal({ show, onClose, closeOnBackdrop = false }) {
  const { t, locale } = useI18n();

  if (!show) return null;

  const localeContent = qaLocales[locale] || qaLocales.en;
  const qaItems = localeContent?.items || [];

  return (
    <Modal
      show={show}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabelledby="qa-modal-title"
      title={
        <>
          <Icon name="help_center" className="text-endfield-yellow" />
          <h2
            id="qa-modal-title"
            className="text-base font-bold text-endfield-text-light uppercase tracking-wider"
          >
            {t('qa')}
          </h2>
        </>
      }
      contentClassName="max-w-2xl max-h-[90vh]"
    >
      <div className="min-h-0 text-sm text-endfield-text-light leading-relaxed mb-6 overflow-y-auto scrollbar-gutter-stable flex-1 pr-2 space-y-2">
        {qaItems.map((item, index) => (
          <ExpandableCard key={`qa-${index}`} title={item.question} defaultOpen={index === 0}>
            <p className="text-endfield-text leading-relaxed pl-5">{item.answer}</p>
          </ExpandableCard>
        ))}
      </div>

      <button
        onClick={onClose}
        className="shrink-0 w-full h-10 min-h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
      >
        {t('close')}
      </button>
    </Modal>
  );
}
