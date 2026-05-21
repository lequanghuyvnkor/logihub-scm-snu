/**
 * LogiHub root — redirects to the full Decision Engine UI.
 *
 * The complete 14-page app (PRD v1.0) lives at /LogiHub.html and is served
 * directly from the Next.js public/ directory as a self-contained React
 * prototype (CDN React 18 + Babel standalone). This server component performs
 * an instant redirect so visiting "/" always opens the right experience.
 */
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/LogiHub.html");
}
