import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronRight, ChevronDown, BookOpen, Activity, Cpu, Network, BookMarked, Zap, Globe } from 'lucide-react';

type Topic = {
    id: string;
    title: string;
    icon: React.ReactNode;
    subtopics: { id: string; title: string }[];
};

const TOPICS: Topic[] = [
    {
        id: 'intro',
        title: 'Introduction to Power Systems',
        icon: <Globe className="w-4 h-4" />,
        subtopics: [
            { id: 'intro-architecture', title: 'Architecture & Dynamics' },
            { id: 'intro-smart-grid', title: 'Smart Grid Paradigm' }
        ]
    },
    {
        id: 'static-modeling',
        title: 'Static Modeling & Matrices',
        icon: <Network className="w-4 h-4" />,
        subtopics: [
            { id: 'static-modeling-ybus', title: 'Y-Bus Formulation' },
            { id: 'static-modeling-zbus', title: 'Z-Bus & Kron Reduction' },
            { id: 'static-modeling-transformers', title: 'Tap Changing Transformers' }
        ]
    },
    {
        id: 'slfe',
        title: 'Static Load Flow Equations',
        icon: <BookOpen className="w-4 h-4" />,
        subtopics: [
            { id: 'slfe-equations', title: 'Core Equations' },
            { id: 'slfe-buses', title: 'Bus Classifications' }
        ]
    },
    {
        id: 'gauss-seidel',
        title: 'Gauss-Seidel Method',
        icon: <Activity className="w-4 h-4" />,
        subtopics: [
            { id: 'gauss-seidel-algorithm', title: 'Step-by-Step Algorithm' },
            { id: 'gauss-seidel-pv', title: 'PV Bus Logic' }
        ]
    },
    {
        id: 'newton-raphson',
        title: 'Newton-Raphson Method',
        icon: <Cpu className="w-4 h-4" />,
        subtopics: [
            { id: 'newton-raphson-polar', title: 'Polar Formulation' },
            { id: 'newton-raphson-rect', title: 'Rectangular Formulation' }
        ]
    },
    {
        id: 'decoupled',
        title: 'Decoupled Load Flow',
        icon: <Zap className="w-4 h-4" />,
        subtopics: [
            { id: 'decoupled-nr', title: 'Decoupled N-R' },
            { id: 'decoupled-fdlf', title: 'Fast Decoupled (FDLF)' }
        ]
    },
    {
        id: 'dc-load-flow',
        title: 'DC Load Flow',
        icon: <BookMarked className="w-4 h-4" />,
        subtopics: [
            { id: 'dc-load-flow-linear', title: 'Linear Sensitivities' },
            { id: 'dc-load-flow-lodf', title: 'PTDF and LODF' }
        ]
    }
];

const LeftNav: React.FC = () => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        'intro': true,
        'static-modeling': true,
        'gauss-seidel': true,
    });

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <nav className="w-full h-full bg-slate-50 dark:bg-zinc-900 border-r border-border flex flex-col">
            <div className="p-4 border-b border-border bg-white dark:bg-zinc-900 flex items-center gap-2 sticky top-0 z-10">
                <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold font-serif">
                    PS
                </div>
                <div>
                    <h1 className="font-bold text-sm tracking-tight leading-tight text-slate-900 dark:text-white">Power Systems</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Static Modeling</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {TOPICS.map((topic) => (
                    <div key={topic.id} className="mb-2">
                        <button
                            onClick={() => toggleExpand(topic.id)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 rounded-md transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 dark:text-slate-500">{topic.icon}</span>
                                {topic.title}
                            </div>
                            {expanded[topic.id] ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            )}
                        </button>

                        {expanded[topic.id] && (
                            <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-200 dark:border-zinc-700 flex flex-col gap-1">
                                {topic.subtopics.map((sub) => (
                                    <NavLink
                                        key={sub.id}
                                        to={`/topic/${topic.id}#${sub.id}`}
                                        className={({ isActive }) =>
                                            `px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${isActive
                                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                                            }`
                                        }
                                    >
                                        {sub.title}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default LeftNav;
