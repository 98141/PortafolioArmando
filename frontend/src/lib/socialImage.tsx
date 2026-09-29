import { ImageResponse } from "next/og";
import { getPublicSiteSettings } from "./publicSiteSettings";
import { resolvePublicProfile } from "./publicProfile";

export async function createSocialImage() {
  const profile = resolvePublicProfile(await getPublicSiteSettings());
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: "100%", height: "100%", background: "#080c18", color: "#f4f4f5", padding: "80px", borderLeft: "16px solid #22d3ee" }}>
      <div style={{ display: "flex", color: "#67e8f9", fontSize: 24, letterSpacing: 4, marginBottom: 36 }}>PORTAFOLIO PROFESIONAL</div>
      <div style={{ display: "flex", fontSize: 76, lineHeight: 1.1, marginBottom: 32 }}>{profile.fullName.slice(0, 60)}</div>
      <div style={{ display: "flex", color: "#c4b5fd", fontSize: 32, lineHeight: 1.35 }}>{profile.professionalTitle.slice(0, 120)}</div>
      <div style={{ display: "flex", marginTop: 48, color: "#a1a1aa", fontSize: 24 }}>Proyectos · Decisiones técnicas · Aprendizajes</div>
    </div>, { width: 1200, height: 630 });
}
