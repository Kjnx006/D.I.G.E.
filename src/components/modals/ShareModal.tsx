import { useCallback, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Modal from '../ui/Modal';
import ModalHeader from '../ui/ModalHeader';

export interface ShareModalProps {
  show: boolean;
  shareUrl: string;
  onClose: () => void;
  onCopy: () => void;
  onShare: () => void;
  closeOnBackdrop?: boolean;
}

export default function ShareModal({
  show,
  shareUrl,
  onClose,
  onCopy,
  onShare,
  closeOnBackdrop = false,
}: ShareModalProps) {
  const { t } = useI18n();
  const firstLinkRef = useRef<HTMLInputElement | null>(null);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const selectLinkText = useCallback((el: HTMLInputElement | null) => {
    if (!el || typeof window === 'undefined') return;
    el.select();
  }, []);

  useEffect(() => {
    if (!show) return;
    const handle = window.requestAnimationFrame(() => {
      if (!firstLinkRef.current) return;
      firstLinkRef.current.focus();
      selectLinkText(firstLinkRef.current);
    });
    return () => window.cancelAnimationFrame(handle);
  }, [show, selectLinkText]);

  if (!show) return null;

  return (
    <Modal
      show={show}
      onClose={onClose}
      closeOnBackdrop={closeOnBackdrop}
      ariaLabelledby="share-modal-title"
      contentClassName="!p-4 sm:!p-5 max-w-xl gap-2.5"
    >
      <ModalHeader id="share-modal-title" icon="share" title={t('shareLinkTitle')} />

      <div className="space-y-2">
        <input
          ref={firstLinkRef}
          type="text"
          readOnly
          aria-label={t('shareLinkLabel')}
          value={shareUrl || ''}
          onClick={(e) => selectLinkText(e.currentTarget)}
          onFocus={(e) => selectLinkText(e.currentTarget)}
          className="w-full bg-endfield-black/80 border border-endfield-yellow/40 px-3 py-2 text-[11px] sm:text-sm text-endfield-yellow/90 font-mono leading-snug break-all focus:border-endfield-yellow focus:outline-none shadow-[0_0_0_1px_rgba(255,250,0,0.08),0_12px_30px_rgba(0,0,0,0.45)] text-center"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button onClick={onCopy} variant="primary">
          <Icon name="content_copy" />
          {t('copyLink')}
        </Button>

        <Button
          onClick={onShare}
          disabled={!canShare}
          variant="none"
          className={`border border-endfield-gray-light ${
            canShare
              ? 'bg-endfield-gray hover:border-endfield-yellow text-endfield-text-light hover:text-endfield-yellow'
              : 'bg-endfield-gray/40 text-endfield-text/40 cursor-not-allowed'
          }`}
        >
          <Icon name="ios_share" />
          {t('shareSystem')}
        </Button>
      </div>

      {!canShare && <p className="text-xs text-endfield-text/60">{t('shareUnavailable')}</p>}

      <Button onClick={onClose} variant="secondary" fullWidth>
        {t('close')}
      </Button>
    </Modal>
  );
}
