import React, { Suspense } from 'react';
import Providers from './Providers';
import '../styles/globals.css';

export const metadata = {
  title: 'Element Pay',
  description: 'crypto to local currency and vice versa',
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
          <main><Suspense> {children}</Suspense></main>
        </Providers>
      </body>
    </html>
  );
}
