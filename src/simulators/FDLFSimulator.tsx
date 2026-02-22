import React, { useState } from 'react';
import { IEEE3Bus, IEEE14Bus } from '../data/testCases';
import type { SystemData, IterationResult } from '../lib/solvers/types';
import { runFDLF } from '../lib/solvers/fdlf';
import { MathTex } from '../components/MathTex';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FDLFSimulator: React.FC = () => {
    const [dataSelection, setDataSelection] = useState<'ieee3' | 'ieee14'>('ieee3');
    const [iterations, setIterations] = useState<IterationResult[]>([]);
    const [bPrime, setBPrime] = useState<number[][] | null>(null);
    const [bDP, setBDP] = useState<number[][] | null>(null);
    const [tolerance, setTolerance] = useState(0.001);
    const [maxIter, setMaxIter] = useState(20);
    const [showMatrices, setShowMatrices] = useState(false);

    const getSystemData = (): SystemData => dataSelection === 'ieee3' ? IEEE3Bus as SystemData : IEEE14Bus as SystemData;

    const handleRun = () => {
        const sys = getSystemData();
        const result = runFDLF(sys, maxIter, tolerance);
        setIterations(result.iterations);
        setBPrime(result.bPrime);
        setBDP(result.bDoublePrime);
    };

    const formatMatrix = (m: number[][]) => {
        const rows = m.map(row => row.map(v => v.toFixed(3)).join(' & ')).join(' \\\\ ');
        return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
    };

    const lastIter = iterations.length > 0 ? iterations[iterations.length - 1] : null;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 p-4">
            <h3 className="font-bold text-lg mb-2">FDLF Simulator</h3>

            <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm mb-4">
                <label className="block text-xs font-semibold mb-1 text-slate-500">Test Case</label>
                <select className="w-full text-sm border p-1 rounded dark:bg-zinc-800 dark:border-zinc-700" value={dataSelection} onChange={e => setDataSelection(e.target.value as any)}>
                    <option value="ieee3">IEEE 3-Bus System</option>
                    <option value="ieee14">IEEE 14-Bus System</option>
                </select>

                <div className="flex gap-2 mt-3">
                    <div className="w-1/2">
                        <label className="block text-xs font-semibold mb-1 text-slate-500">Tolerance</label>
                        <input type="number" step="0.0001" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full text-sm border p-1 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-semibold mb-1 text-slate-500">Max Iter</label>
                        <input type="number" value={maxIter} onChange={e => setMaxIter(Number(e.target.value))} className="w-full text-sm border p-1 rounded dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>
                </div>
            </div>

            <button onClick={handleRun} className="w-full bg-primary text-white py-2 rounded font-medium text-sm hover:bg-primary/90 transition-colors mb-4">
                Run FDLF
            </button>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {bPrime && bDP && (
                    <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm">
                        <button onClick={() => setShowMatrices(!showMatrices)} className="text-sm font-semibold text-primary hover:underline">
                            {showMatrices ? '▼' : '▶'} Show B′ and B″ Matrices
                        </button>
                        {showMatrices && (
                            <div className="mt-3 space-y-3 overflow-x-auto">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">B′ Matrix (P-δ subproblem)</p>
                                    <div className="text-[10px]"><MathTex block math={`B' = ${formatMatrix(bPrime)}`} /></div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 mb-1">B″ Matrix (Q-V subproblem)</p>
                                    <div className="text-[10px]"><MathTex block math={`B'' = ${formatMatrix(bDP)}`} /></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {iterations.length > 1 && (
                    <div className="bg-white dark:bg-zinc-900 p-3 border rounded-lg shadow-sm">
                        <h4 className="text-sm font-semibold mb-2">Convergence Plot</h4>
                        <div className="h-36 w-full text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={iterations.slice(1)}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="iteration" />
                                    <YAxis scale="log" domain={['auto', 'auto']} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="maxMismatch" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {lastIter && (
                    <div className="bg-white dark:bg-zinc-900 p-3 border rounded-lg shadow-sm overflow-x-auto">
                        <h4 className="text-sm font-semibold mb-2">Final Voltages (Iter: {lastIter.iteration})</h4>
                        <table className="w-full text-xs text-left">
                            <thead><tr className="border-b"><th className="pb-1">Bus</th><th className="pb-1">|V| (p.u.)</th><th className="pb-1">δ (deg)</th></tr></thead>
                            <tbody>
                                {lastIter.voltages.map(v => (
                                    <tr key={v.busId} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-800">
                                        <td className="py-1">{v.busId}</td>
                                        <td className="py-1 font-mono">{v.vMag.toFixed(4)}</td>
                                        <td className="py-1 font-mono">{v.vAng.toFixed(2)}°</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FDLFSimulator;
