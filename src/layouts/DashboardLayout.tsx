import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import LeftNav from '../components/LeftNav';
import RightWidgetPanel from '../components/RightWidgetPanel';
import GeminiChat from '../components/GeminiChat';
import { Sun, Moon, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight } from 'lucide-react';

const MIN_LEFT = 200;
const MIN_RIGHT = 250;
const MIN_CENTER = 300;

const DashboardLayout: React.FC = () => {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    // Panel visibility
    const [leftVisible, setLeftVisible] = useState(true);
    const [rightVisible, setRightVisible] = useState(true);

    // Panel widths
    const [leftWidth, setLeftWidth] = useState(288); // 18rem = 288px
    const [rightWidth, setRightWidth] = useState(384); // 24rem = 384px

    // Drag state
    const dragging = useRef<'left' | 'right' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark]);

    const onMouseDown = useCallback((side: 'left' | 'right') => {
        dragging.current = side;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const totalW = rect.width;

        if (dragging.current === 'left') {
            const newLeft = Math.max(MIN_LEFT, Math.min(x, totalW - (rightVisible ? rightWidth : 0) - MIN_CENTER));
            setLeftWidth(newLeft);
        } else {
            const newRight = Math.max(MIN_RIGHT, Math.min(totalW - x, totalW - (leftVisible ? leftWidth : 0) - MIN_CENTER));
            setRightWidth(newRight);
        }
    }, [leftWidth, rightWidth, leftVisible, rightVisible]);

    const onMouseUp = useCallback(() => {
        dragging.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    return (
        <div
            ref={containerRef}
            className="flex h-screen w-full bg-background overflow-hidden font-sans"
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* Left Panel */}
            {leftVisible && (
                <div style={{ width: leftWidth, minWidth: MIN_LEFT }} className="h-full flex-shrink-0 relative">
                    <LeftNav />
                    {/* Drag handle */}
                    <div
                        onMouseDown={() => onMouseDown('left')}
                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-30"
                    />
                </div>
            )}

            {/* Center Content */}
            <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-zinc-950 relative min-w-0">
                {/* Toolbar */}
                <div className="sticky top-0 z-40 flex items-center justify-between px-3 py-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-border">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setLeftVisible(!leftVisible)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title={leftVisible ? 'Hide left panel' : 'Show left panel'}
                        >
                            {leftVisible ? <PanelLeftClose className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <PanelLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setDark(!dark)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {dark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                        </button>
                        <button
                            onClick={() => setRightVisible(!rightVisible)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                            title={rightVisible ? 'Hide right panel' : 'Show right panel'}
                        >
                            {rightVisible ? <PanelRightClose className="w-4 h-4 text-slate-500 dark:text-slate-400" /> : <PanelRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto min-h-full">
                    <Outlet />
                </div>
            </main>

            {/* Right Panel */}
            {rightVisible && (
                <div style={{ width: rightWidth, minWidth: MIN_RIGHT }} className="h-full flex-shrink-0 relative border-l border-border">
                    {/* Drag handle */}
                    <div
                        onMouseDown={() => onMouseDown('right')}
                        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-30"
                    />
                    <RightWidgetPanel />
                </div>
            )}

            <GeminiChat />
        </div>
    );
};

export default DashboardLayout;
