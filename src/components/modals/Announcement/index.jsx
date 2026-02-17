import { useEffect, useState } from 'react';
import { useI18n } from '../../../i18n';
import { announcementLocales } from '../../../i18n/announcement/locales';
import {
  ANNOUNCEMENT_ID,
  CHANGELOG_ID,
  ANNOUNCEMENT_DISMISSED_KEY,
  ANNOUNCEMENT_VIEWED_KEY,
  CHANGELOG_VIEWED_KEY,
} from '../../../utils/announcement';
import Icon from '../../ui/Icon';
import AnnouncementBody from './AnnouncementBody';
import ChangelogBody from './ChangelogBody';

const QQ_GROUP_URL = 'https://qm.qq.com/q/zL6wp3emTQ';

export function shouldShowAnnouncement() {
  const dismissedId = localStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY);
  return dismissedId !== ANNOUNCEMENT_ID;
}

export function hasUnreadAnnouncement() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ANNOUNCEMENT_VIEWED_KEY) !== ANNOUNCEMENT_ID;
}

export function hasUnreadChangelog() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(CHANGELOG_VIEWED_KEY) !== CHANGELOG_ID;
}

export function hasUnreadAnnouncementOrChangelog() {
  return hasUnreadAnnouncement() || hasUnreadChangelog();
}

export default function Announcement({ show, initialTab = 'announcement', onClose }) {
  const { t, locale } = useI18n();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [announcementUnread, setAnnouncementUnread] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ANNOUNCEMENT_VIEWED_KEY) !== ANNOUNCEMENT_ID;
  });
  const [changelogUnread, setChangelogUnread] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CHANGELOG_VIEWED_KEY) !== CHANGELOG_ID;
  });

  useEffect(() => {
    if (show) {
      setActiveTab(initialTab);
    }
  }, [show, initialTab]);

  useEffect(() => {
    if (!show) return;
    if (announcementUnread && initialTab === 'announcement') {
      setAnnouncementUnread(false);
      localStorage.setItem(ANNOUNCEMENT_VIEWED_KEY, ANNOUNCEMENT_ID);
    }
  }, [show, announcementUnread, initialTab]);

  useEffect(() => {
    if (!show) return;
    if (changelogUnread && initialTab === 'changelog') {
      setChangelogUnread(false);
      localStorage.setItem(CHANGELOG_VIEWED_KEY, CHANGELOG_ID);
    }
  }, [show, changelogUnread, initialTab]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, ANNOUNCEMENT_ID);
    }
    setDontShowAgain(false);
    onClose();
  };

  if (!show) return null;

  const localeContent = announcementLocales[locale] || announcementLocales.en;
  const announcementBlocks = localeContent?.announcement?.blocks || [];
  const changelogSections = localeContent?.changelog?.sections || [];
  const isAnnouncement = activeTab === 'announcement';

  return (
    <div className="fixed inset-0 bg-endfield-black/95 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="bg-endfield-gray border border-endfield-yellow/30 p-6 max-w-xl w-full relative h-[90vh] flex flex-col">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-endfield-gray-light">
          <Icon name={isAnnouncement ? 'campaign' : 'history'} className="text-endfield-yellow" />
          <h2 className="text-base font-bold text-endfield-text-light uppercase tracking-wider">
            {isAnnouncement ? t('announcement') : t('changelog')}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('announcement');
              if (announcementUnread) {
                setAnnouncementUnread(false);
                localStorage.setItem(ANNOUNCEMENT_VIEWED_KEY, ANNOUNCEMENT_ID);
              }
            }}
            className={`relative h-9 border text-sm tracking-wider transition-colors ${
              isAnnouncement
                ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                : 'text-endfield-text-light border-endfield-gray-light hover:border-endfield-text'
            }`}
          >
            {t('announcement')}
            {announcementUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('changelog');
              if (changelogUnread) {
                setChangelogUnread(false);
                localStorage.setItem(CHANGELOG_VIEWED_KEY, CHANGELOG_ID);
              }
            }}
            className={`relative h-9 border text-sm tracking-wider transition-colors ${
              !isAnnouncement
                ? 'text-endfield-yellow border-endfield-yellow bg-endfield-yellow/10'
                : 'text-endfield-text-light border-endfield-gray-light hover:border-endfield-text'
            }`}
          >
            {t('changelog')}
            {changelogUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        <div className="text-sm text-endfield-text-light leading-relaxed mb-6 overflow-y-auto scrollbar-gutter-stable flex-1 pr-2">
          {isAnnouncement ? (
            <AnnouncementBody blocks={announcementBlocks} />
          ) : (
            <ChangelogBody sections={changelogSections} />
          )}
        </div>

        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none group">
          <div className="relative w-4 h-4 border border-endfield-gray-light group-hover:border-endfield-yellow transition-colors flex items-center justify-center">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {dontShowAgain && (
              <Icon name="check" className="text-endfield-yellow" />
            )}
          </div>
          <span className="text-sm text-endfield-text group-hover:text-endfield-text-light transition-colors">{t('dontShowAgain')}</span>
        </label>

        {locale === 'zh' && (
          <a
            href={QQ_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center gap-2 h-10 bg-endfield-gray/60 border border-endfield-yellow/30 hover:border-endfield-yellow transition-colors text-endfield-yellow text-sm"
          >
            <Icon name="group" />
            <span>{t('joinQQGroup')}</span>
          </a>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 w-full h-10 min-h-10 bg-endfield-yellow hover:bg-endfield-yellow-glow text-endfield-black font-bold tracking-wider transition-all flex items-center justify-center gap-2 text-sm"
        >
          {t('understood')}
        </button>
      </div>
    </div>
  );
}
