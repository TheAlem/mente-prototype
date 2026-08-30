import "./globals.css";

export const metadata = {
  title: "MENTE | Orientación en salud mental",
  description: "Orientación, educación y acceso a recursos de salud mental.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
