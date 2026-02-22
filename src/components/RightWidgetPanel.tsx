import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ZBusBuilder from '../simulators/ZBusBuilder';
import LoadFlowSimulator from '../simulators/LoadFlowSimulator';
import YBusCalculator from '../simulators/YBusCalculator';
import FDLFSimulator from '../simulators/FDLFSimulator';

const RightWidgetPanel: React.FC = () => {
    const location = useLocation();
    const topicMatch = location.pathname.match(/\/topic\/([^\/]+)/);
    const topicId = topicMatch ? topicMatch[1] : null;
    const [activeTab, setActiveTab] = useState<'ybus' | 'zbus'>('ybus');

    const renderWidget = () => {
        switch (topicId) {
            case 'static-modeling':
                return (
                    <div className="flex flex-col h-full">
                        <div className="flex border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
                            <button
                                onClick={() => setActiveTab('ybus')}
                                className={`flex-1 py-2 text-xs font-semibold transition ${activeTab === 'ybus' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Y-Bus / Z-Bus Calculator
                            </button>
                            <button
                                onClick={() => setActiveTab('zbus')}
                                className={`flex-1 py-2 text-xs font-semibold transition ${activeTab === 'zbus' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Z-Bus Builder
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'ybus' ? <YBusCalculator /> : <ZBusBuilder />}
                        </div>
                    </div>
                );
            case 'gauss-seidel':
                return <LoadFlowSimulator algorithm="gauss-seidel" />;
            case 'newton-raphson':
                return <LoadFlowSimulator algorithm="newton-raphson" />;
            case 'decoupled':
                return <FDLFSimulator />;
            case 'dc-load-flow':
                return <div className="p-4 text-center">Contingency Simulator Coming Soon</div>;
            default:
                return (
                    <div className="p-8 text-center text-muted-foreground">
                        <h3 className="font-semibold text-slate-700 dark:text-slate-300">No active simulator</h3>
                        <p className="text-sm mt-2">Select an interactive topic to load the simulator.</p>
                    </div>
                );
        }
    };

    return (
        <aside className="w-full h-full bg-slate-50 dark:bg-zinc-900 flex flex-col overflow-y-auto z-20">
            <div className="p-4 border-b border-border bg-white dark:bg-zinc-900 sticky top-0 z-10 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Interactive Workspace</h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Simulators & Calculators</p>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderWidget()}
            </div>
        </aside>
    );
};

export default RightWidgetPanel;
