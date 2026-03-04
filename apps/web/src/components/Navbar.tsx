'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const NAV_LINKS = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/explore', label: 'Explore', icon: '🌌' },
    { href: '/galaxy', label: 'My Galaxy', icon: '🪐' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
];

export function Navbar() {
    const pathname = usePathname();

    // Hide navbar on full-screen galaxy views
    const isGalaxyView = pathname === '/explore' || pathname === '/galaxy';
    if (isGalaxyView) return null;

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-bold cosmic-text-gradient group-hover:opacity-80 transition-opacity">
                        GitVerse
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur-xl">
                    {NAV_LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200 ${isActive
                                        ? 'text-white'
                                        : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        className="absolute inset-0 rounded-xl bg-white/10"
                                        layoutId="nav-active"
                                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    />
                                )}
                                <span className="relative z-10">{link.icon}</span>
                                <span className="relative z-10 hidden sm:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </motion.nav>
    );
}
