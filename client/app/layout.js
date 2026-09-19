export const metadata = {
  title: 'Anonymous Chat',
  description: 'Random 1-on-1 text chat',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
