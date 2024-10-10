import React from 'react';
import Providers from './Providers';
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
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
