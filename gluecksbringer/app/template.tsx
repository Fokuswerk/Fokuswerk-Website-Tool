/**
 * Wird bei jedem Seitenwechsel neu gerendert – dadurch blendet der Inhalt
 * beim Navigieren ruhig auf, statt hart umzuspringen.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
