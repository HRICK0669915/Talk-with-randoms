import './globals.css';

export const metadata = {
  title: 'Anonymous Chat',
  description: 'Random 1-on-1 text chat',
  verification: {
    google: 'PASTE_YOUR_COPIED_GOOGLE_STRING_HERE',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
