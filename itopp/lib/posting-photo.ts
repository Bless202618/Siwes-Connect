// Deterministic cover photo per posting — cropped from the approved
// design screens (workshop for engineering trades, office for all else).
// Local files, ~30KB each: safe for low-bandwidth networks.
export function postingPhoto(departments: string[], id: string): string {
  const engineering = departments.some((d) =>
    d.toLowerCase().includes("engineer")
  );
  if (engineering) return "/postings/photo-1.jpg";
  const tech = departments.some((d) =>
    /computer|software|information|data|cyber|statistic|math/i.test(d)
  );
  if (tech) return "/postings/photo-2.jpg";
  let h = 0;
  for (const ch of id) h = (h + ch.charCodeAt(0)) % 2;
  return h === 0 ? "/postings/photo-1.jpg" : "/postings/photo-2.jpg";
}
