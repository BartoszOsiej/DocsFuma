import { JetBrains_Mono } from 'next/font/google';
import { Provider } from '@/components/provider';
import './global.css';

const mono = JetBrains_Mono({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={mono.className + " dark"} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-[#050505] text-[#E8E6E3]">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
