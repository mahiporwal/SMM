/**
 * MAIN LAYOUT COMPONENT
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '@/services/auth';

export default function Layout({ children, title = 'SMM Panel' }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserRole(payload.role);
        } catch (err) {
          console.error('Error parsing token:', err);
        }
      }
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div>
              <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition">
                SMM Panel
              </Link>
              <p className="text-sm text-gray-500">Social media growth dashboard</p>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/" className={`text-gray-700 hover:text-blue-600 transition ${router.pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}>
                Dashboard
              </Link>
              <Link href="/orders" className={`text-gray-700 hover:text-blue-600 transition ${router.pathname === '/orders' ? 'text-blue-600 font-semibold' : ''}`}>
                Orders
              </Link>
              {userRole === 'admin' && (
                <Link href="/admin" className={`text-gray-700 hover:text-blue-600 transition ${router.pathname.startsWith('/admin') ? 'text-blue-600 font-semibold' : ''}`}>
                  Admin
                </Link>
              )}
              {isLoggedIn ? (
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
