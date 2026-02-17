const LinkStyle = 'text-endfield-yellow hover:text-endfield-yellow-glow underline underline-offset-2 transition-colors';
const HeadingStyle = 'text-endfield-yellow font-bold mt-4 mb-2';
const ListStyle = 'list-disc list-inside space-y-1 text-endfield-text';

const CONTENT_LINKS = {
  tutorial: 'https://www.bilibili.com/video/BV1mjZwBaEXi',
  github: 'https://github.com/djkcyl/D.I.G.E.',
  issues: 'https://github.com/djkcyl/D.I.G.E./issues',
};

function RenderContentSegments({ segments = [], blockIndex }) {
  return segments.map((segment, segmentIndex) => {
    const key = `${blockIndex}-${segmentIndex}`;
    const href = segment.link ? CONTENT_LINKS[segment.link] : null;
    if (href) {
      return (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={LinkStyle}>
          {segment.text}
        </a>
      );
    }
    return <span key={key}>{segment.text}</span>;
  });
}

export default function AnnouncementBody({ blocks = [] }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h3 key={`heading-${index}`} className={HeadingStyle}>
              {block.text}
            </h3>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className={ListStyle}>
              {(block.items || []).map((item, itemIndex) => (
                <li key={`item-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={`paragraph-${index}`} className={block.className || 'mb-3'}>
              {block.segments ? <RenderContentSegments segments={block.segments} blockIndex={index} /> : block.text}
            </p>
          );
        }

        return null;
      })}
    </>
  );
}
