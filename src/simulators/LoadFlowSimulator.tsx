import React, { useState, useEffect } from 'react';
import { IEEE3Bus, IEEE14Bus } from '../data/testCases';
import type { SystemData, IterationResult } from '../lib/solvers/types';
import { buildYBus } from '../lib/solvers/YBus';
import { runGaussSeidel } from '../lib/solvers/gaussSeidel';
import { MathTex } from '../components/MathTex';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface LoadFlowProps {
    algorithm: 'gauss-seidel' | 'newton-raphson' | 'decoupled';
}

const LoadFlowSimulator: React.FC<LoadFlowProps> = ({ algorithm }) => {
    const [dataSelection, setDataSelection] = useState<'ieee3' | 'ieee14'>('ieee3');
    const [iterations, setIterations] = useState<IterationResult[]>([]);
    const [tolerance, setTolerance] = useState(0.001);
    const [maxIter, setMaxIter] = useState(20);
    const [yBusStr, setYBusStr] = useState<string>('');

    const getSystemData = (): SystemData => dataSelection === 'ieee3' ? IEEE3Bus as SystemData : IEEE14Bus as SystemData;

    useEffect(() => {
        // Generate Ybus preview
        const ybus = buildYBus(getSystemData());
        let str = '\\begin{bmatrix}';
        for (let i = 0; i < Math.min(3, ybus.length); i++) {
            const row = [];
            for (let j = 0; j < Math.min(3, ybus.length); j++) {
                const val = ybus[i][j];
                row.push(`${val.re.toFixed(1)}${val.im >= 0 ? '+' : ''}${val.im.toFixed(1)}j`);
            }
            if (ybus.length > 3) row.push('\\dots');
            str += row.join(' & ') + ' \\\\ ';
        }
        if (ybus.length > 3) str += '\\vdots & \\vdots & \\vdots & \\ddots \\\\ ';
        str += '\\end{bmatrix}';
        setYBusStr(str);
        setIterations([]); // reset iterations when data changes
    }, [dataSelection]);

    const handleRun = () => {
        const sys = getSystemData();
        let res: IterationResult[] = [];
        if (algorithm === 'gauss-seidel') {
            res = runGaussSeidel(sys, maxIter, tolerance);
        } else {
            // Placeholder for others
            res = runGaussSeidel(sys, maxIter, tolerance);
        }
        setIterations(res);
    };

    const currentIterNum = iterations.length > 0 ? iterations.length - 1 : 0;
    const currentVoltages = iterations.length > 0 ? iterations[currentIterNum].voltages : null;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 p-4">
            <h3 className="font-bold text-lg mb-2 capitalize">{algorithm.replace('-', ' ')} Simulator</h3>

            <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm mb-4">
                <label className="block text-xs font-semibold mb-1 text-slate-500">Test Case</label>
                <select
                    className="w-full text-sm border p-1 rounded"
                    value={dataSelection}
                    onChange={e => setDataSelection(e.target.value as any)}
                >
                    <option value="ieee3">IEEE 3-Bus System</option>
                    <option value="ieee14">IEEE 14-Bus System</option>
                </select>

                <div className="flex gap-2 mt-3">
                    <div className="w-1/2">
                        <label className="block text-xs font-semibold mb-1 text-slate-500">Tolerance</label>
                        <input type="number" step="0.0001" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full text-sm border p-1 rounded" />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-semibold mb-1 text-slate-500">Max Iterations</label>
                        <input type="number" value={maxIter} onChange={e => setMaxIter(Number(e.target.value))} className="w-full text-sm border p-1 rounded" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 pr-2">
                <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm mb-4">
                    <h4 className="text-sm font-semibold mb-2">Y-Bus Formulation (Abstracted)</h4>
                    <div className="overflow-x-auto text-[10px]">
                        <MathTex block math={`Y_{BUS} = ${yBusStr}`} />
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button onClick={handleRun} className="flex-1 bg-primary text-white py-2 rounded font-medium text-sm hover:bg-primary/90 transition-colors">
                        Solve Iteratively
                    </button>
                </div>

                {iterations.length > 0 && currentVoltages && (
                    <div className="mt-6 space-y-4">
                        <div className="bg-white p-3 border rounded shadow-sm">
                            <h4 className="text-sm font-semibold mb-2">Convergence Plot - Mismatch</h4>
                            <div className="h-40 w-full text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={iterations}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="iteration" />
                                        <YAxis scale="log" domain={['auto', 'auto']} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="maxMismatch" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-3 border rounded shadow-sm overflow-x-auto">
                            <h4 className="text-sm font-semibold mb-2">Final Voltages (Iter: {currentIterNum})</h4>
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-1">Bus</th>
                                        <th className="pb-1">Magnitude (p.u.)</th>
                                        <th className="pb-1">Angle (deg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentVoltages.map(v => (
                                        <tr key={v.busId} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="py-1">{v.busId}</td>
                                            <td className="py-1 font-mono">{v.vMag.toFixed(4)}</td>
                                            <td className="py-1 font-mono">{v.vAng.toFixed(2)}°</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LoadFlowSimulator;
