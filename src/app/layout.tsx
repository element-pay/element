import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'Crypto Exchange',
  description: 'Buy and sell cryptocurrency',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}