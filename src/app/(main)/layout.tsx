import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            NYC Dining
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/restaurants" className="hover:text-primary transition-colors">
              Restaurants
            </Link>
            <Link href="/bookings" className="hover:text-primary transition-colors">
              My Bookings
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 NYC Restaurant Booking. Built with AI assistance.</p>
        </div>
      </footer>
    </div>
  );
}
