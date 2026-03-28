import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
export const metadata = {
  title: "Luminary — Your life, before it happens.",
  description: "AI-powered personalized astrology readings from your exact birth chart.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin:0, padding:0, fontFamily:"'DM Sans',sans-serif", background:"#F3EDE3", display:"flex", justifyContent:"center", minHeight:"100vh" }}>
        <div style={{ maxWidth:420, width:"100%", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
