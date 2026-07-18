import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Sidebar } from './Sidebar';
import { Logo } from '@/components/common/Logo';
import { ProfileModal } from '@/components/common/ProfileModal';

interface AppLayoutProps {
    children: ReactNode;
    /** When false, hides the sidebar for a distraction-free coding view. */
    showHeader?: boolean;
}

export function AppLayout({ children, showHeader = true }: AppLayoutProps) {
    const [drawer, setDrawer] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Focus mode: no sidebar, just a centred content column.
    if (!showHeader) {
        return (
            <div className="min-h-screen bg-cream">
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
            </div>
        );
    }

    const openProfile = () => setProfileOpen(true);

    return (
        <div className="min-h-screen bg-cream">
            <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-100 bg-white lg:block">
                <Sidebar onEditProfile={openProfile} />
            </aside>

            {/* Mobile top bar */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
                <Link to="/">
                    <Logo />
                </Link>
                <button
                    onClick={() => setDrawer(true)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label="Buka menu"
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>
            </div>

            {/* Mobile drawer */}
            {drawer && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/40"
                        onClick={() => setDrawer(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl animate-slide-in">
                        <button
                            onClick={() => setDrawer(false)}
                            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                            aria-label="Tutup menu"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                        <div onClick={() => setDrawer(false)}>
                            <Sidebar onEditProfile={openProfile} />
                        </div>
                    </div>
                </div>
            )}

            <main className="lg:pl-64">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
