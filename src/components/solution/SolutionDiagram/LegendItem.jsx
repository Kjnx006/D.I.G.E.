export default function LegendItem({ marker, label }) {
  return (
    <div className="flex items-center gap-2 border border-endfield-gray-light bg-endfield-gray/60 px-2 py-1.5">
      {marker}
      <span>{label}</span>
    </div>
  );
}
