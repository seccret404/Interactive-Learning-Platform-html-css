import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '@/pages/Home/Home';
import { Module } from '@/pages/Module/Module';
import { Theory } from '@/pages/Theory/Theory';
import { Quiz } from '@/pages/Quiz/Quiz';

/**
 * Client-side routes. Mirrors the spec:
 *   /                                  → Main Menu
 *   /module/:moduleId                  → Module (sub-module list)
 *   /module/:moduleId/theory/:subId    → Theory slides
 *   /module/:moduleId/quiz/:subId      → Quiz
 */
export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/module/:moduleId" element={<Module />} />
            <Route
                path="/module/:moduleId/theory/:subModuleId"
                element={<Theory />}
            />
            <Route path="/module/:moduleId/quiz/:subModuleId" element={<Quiz />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
