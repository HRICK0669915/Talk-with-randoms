import './globals.css';

export const metadata = {
  title: 'Talk with randoms (TWR)',
  description: '100% Anonymous 1-on-1 Chat',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
