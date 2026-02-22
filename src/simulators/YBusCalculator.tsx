import React, { useState, useMemo } from 'react';
import * as math from 'mathjs';
import { MathTex } from '../components/MathTex';

interface BranchInput {
    from: number;
    to: number;
    r: number;
    x: number;
    b: number;
    hasTap: boolean;
    tapRatio: number;
}

const DEFAULT_BRANCHES: BranchInput[] = [
    { from: 1, to: 2, r: 0.02, x: 0.04, b: 0.0, hasTap: false, tapRatio: 1.0 },
    { from: 1, to: 3, r: 0.01, x: 0.03, b: 0.0, hasTap: false, tapRatio: 1.0 },
    { from: 2, to: 3, r: 0.0125, x: 0.025, b: 0.0, hasTap: false, tapRatio: 1.0 },
];

const YBusCalculator: React.FC = () => {
    const [numBuses, setNumBuses] = useState(3);
    const [branches, setBranches] = useState<BranchInput[]>(DEFAULT_BRANCHES);
    const [showSteps, setShowSteps] = useState(false);

    const addBranch = () => {
        setBranches([...branches, { from: 1, to: 2, r: 0.01, x: 0.05, b: 0.0, hasTap: false, tapRatio: 1.0 }]);
    };

    const removeBranch = (idx: number) => {
        setBranches(branches.filter((_, i) => i !== idx));
    };

    const updateBranch = (idx: number, field: keyof BranchInput, value: any) => {
        const newBranches = [...branches];
        (newBranches[idx] as any)[field] = value;
        setBranches(newBranches);
    };

    const { yBus, zBus, steps } = useMemo(() => {
        const n = numBuses;
        const cplx = (re: number, im: number) => math.complex(re, im);

        // Initialize Y-Bus
        const yb: math.Complex[][] = Array(n).fill(null).map(() => Array(n).fill(null).map(() => cplx(0, 0)));
        const calcSteps: string[] = [];

        branches.forEach((br, idx) => {
            const fi = br.from - 1;
            const ti = br.to - 1;
            if (fi < 0 || fi >= n || ti < 0 || ti >= n || fi === ti) return;

            const zSeries = cplx(br.r, br.x);
            const ySeries = math.divide(1, zSeries) as math.Complex;
            const yShunt = cplx(0, br.b / 2);
            const tap = br.tapRatio;

            calcSteps.push(`Branch ${idx + 1}: Bus ${br.from}→${br.to}, Z=${br.r}+j${br.x}, y=${ySeries.re.toFixed(3)}${ySeries.im >= 0 ? '+' : ''}${ySeries.im.toFixed(3)}j`);

            if (!br.hasTap || tap === 1.0) {
                const negY = math.multiply(ySeries, -1) as math.Complex;
                yb[fi][ti] = math.add(yb[fi][ti], negY) as math.Complex;
                yb[ti][fi] = math.add(yb[ti][fi], negY) as math.Complex;
                yb[fi][fi] = math.add(yb[fi][fi], math.add(ySeries, yShunt)) as math.Complex;
                yb[ti][ti] = math.add(yb[ti][ti], math.add(ySeries, yShunt)) as math.Complex;

                calcSteps.push(`  Y[${br.from}][${br.to}] += -y = ${negY.re.toFixed(3)}${negY.im >= 0 ? '+' : ''}${negY.im.toFixed(3)}j`);
                calcSteps.push(`  Y[${br.from}][${br.from}] += y+ysh, Y[${br.to}][${br.to}] += y+ysh`);
            } else {
                const n2 = tap * tap;
                calcSteps.push(`  Transformer tap = ${tap}, t² = ${n2.toFixed(4)}`);

                yb[fi][fi] = math.add(yb[fi][fi], math.add(math.divide(ySeries, n2) as math.Complex, yShunt)) as math.Complex;
                const trY = math.multiply(math.divide(ySeries, tap) as math.Complex, -1) as math.Complex;
                yb[fi][ti] = math.add(yb[fi][ti], trY) as math.Complex;
                yb[ti][fi] = math.add(yb[ti][fi], trY) as math.Complex;
                yb[ti][ti] = math.add(yb[ti][ti], math.add(ySeries, yShunt)) as math.Complex;

                calcSteps.push(`  Y[${br.from}][${br.from}] += y/t² = ${(math.divide(ySeries, n2) as math.Complex).re.toFixed(3)}j...`);
                calcSteps.push(`  Y[${br.from}][${br.to}] += -y/t (non-symmetric!)`);
                calcSteps.push(`  Y[${br.to}][${br.from}] += -y/t`);
                calcSteps.push(`  Y[${br.to}][${br.to}] += y`);
            }
        });

        // Compute Z-Bus (inverse of Y-Bus)
        let zb: math.Complex[][] | null = null;
        try {
            const yMatrix = math.matrix(yb.map(row => row.map(v => math.complex(v.re, v.im))));
            const zMatrix = math.inv(yMatrix);
            zb = (zMatrix as any).toArray();
        } catch {
            zb = null;
        }

        return { yBus: yb, zBus: zb, steps: calcSteps };
    }, [numBuses, branches]);

    const fmtC = (c: math.Complex) => `${c.re.toFixed(3)}${c.im >= 0 ? '+' : ''}${c.im.toFixed(3)}j`;

    // SVG Circuit diagram
    const renderCircuit = () => {
        const w = 340, h = 200;
        const cx = w / 2, cy = h / 2;
        const radius = 70;
        const busPositions: { x: number; y: number }[] = [];

        for (let i = 0; i < numBuses; i++) {
            const angle = (2 * Math.PI * i) / numBuses - Math.PI / 2;
            busPositions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
        }

        return (
            <svg width={w} height={h} className="mx-auto">
                {/* Branches */}
                {branches.map((br, idx) => {
                    const fi = br.from - 1;
                    const ti = br.to - 1;
                    if (fi < 0 || fi >= numBuses || ti < 0 || ti >= numBuses) return null;
                    const p1 = busPositions[fi];
                    const p2 = busPositions[ti];
                    const mx = (p1.x + p2.x) / 2;
                    const my = (p1.y + p2.y) / 2;
                    return (
                        <g key={idx}>
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={br.hasTap ? '#f59e0b' : '#6366f1'} strokeWidth={2} />
                            {br.hasTap && (
                                <rect x={mx - 8} y={my - 8} width={16} height={16} fill="white" stroke="#f59e0b" strokeWidth={1.5} rx={2} />
                            )}
                            <text x={mx + (br.hasTap ? 12 : 4)} y={my - 6} fontSize="8" fill="#64748b" fontFamily="monospace">
                                j{br.x}
                            </text>
                        </g>
                    );
                })}
                {/* Bus nodes */}
                {busPositions.map((pos, i) => (
                    <g key={i}>
                        <circle cx={pos.x} cy={pos.y} r={14} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={2} />
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{i + 1}</text>
                    </g>
                ))}
            </svg>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 p-4">
            <h3 className="font-bold text-lg mb-2">Y-Bus / Z-Bus Calculator</h3>

            {/* Bus count */}
            <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm mb-3">
                <label className="block text-xs font-semibold mb-1 text-slate-500">Number of Buses</label>
                <input type="number" min={2} max={6} value={numBuses} onChange={e => setNumBuses(Math.max(2, Math.min(6, Number(e.target.value))))} className="w-full text-sm border p-1 rounded dark:bg-zinc-800 dark:border-zinc-700" />
            </div>

            {/* Circuit diagram */}
            <div className="bg-white dark:bg-zinc-900 border p-2 rounded-lg shadow-sm mb-3">
                <p className="text-xs font-semibold text-slate-500 mb-1">Network Diagram</p>
                {renderCircuit()}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {/* Branch inputs */}
                <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Branches</p>
                    {branches.map((br, idx) => (
                        <div key={idx} className="flex flex-wrap gap-1 items-center mb-2 pb-2 border-b last:border-0 text-xs">
                            <input type="number" min={1} max={numBuses} value={br.from} onChange={e => updateBranch(idx, 'from', Number(e.target.value))} className="w-10 border p-1 rounded text-center dark:bg-zinc-800" title="From" />
                            <span>→</span>
                            <input type="number" min={1} max={numBuses} value={br.to} onChange={e => updateBranch(idx, 'to', Number(e.target.value))} className="w-10 border p-1 rounded text-center dark:bg-zinc-800" title="To" />
                            <span className="text-slate-400 ml-1">R:</span>
                            <input type="number" step="0.001" value={br.r} onChange={e => updateBranch(idx, 'r', Number(e.target.value))} className="w-14 border p-1 rounded dark:bg-zinc-800" />
                            <span className="text-slate-400">X:</span>
                            <input type="number" step="0.001" value={br.x} onChange={e => updateBranch(idx, 'x', Number(e.target.value))} className="w-14 border p-1 rounded dark:bg-zinc-800" />
                            <label className="flex items-center gap-1 ml-1">
                                <input type="checkbox" checked={br.hasTap} onChange={e => updateBranch(idx, 'hasTap', e.target.checked)} />
                                <span>Tap</span>
                            </label>
                            {br.hasTap && (
                                <input type="number" step="0.01" value={br.tapRatio} onChange={e => updateBranch(idx, 'tapRatio', Number(e.target.value))} className="w-14 border p-1 rounded dark:bg-zinc-800" title="Tap ratio" />
                            )}
                            <button onClick={() => removeBranch(idx)} className="text-red-500 ml-auto font-bold">×</button>
                        </div>
                    ))}
                    <button onClick={addBranch} className="text-xs text-primary font-medium hover:underline">+ Add Branch</button>
                </div>

                {/* Y-Bus matrix */}
                <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm overflow-x-auto">
                    <h4 className="text-sm font-semibold mb-2">Y-Bus Matrix</h4>
                    <table className="text-[10px] font-mono w-full">
                        <thead>
                            <tr><th className="w-8"></th>{Array(numBuses).fill(0).map((_, j) => <th key={j} className="text-center px-1">Bus {j + 1}</th>)}</tr>
                        </thead>
                        <tbody>
                            {yBus.slice(0, numBuses).map((row, i) => (
                                <tr key={i} className="border-t">
                                    <td className="font-bold text-slate-500">Bus {i + 1}</td>
                                    {row.slice(0, numBuses).map((cell, j) => (
                                        <td key={j} className={`text-center px-1 py-0.5 ${i === j ? 'bg-blue-50 dark:bg-blue-950 font-semibold' : ''}`}>
                                            {fmtC(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Z-Bus matrix */}
                {zBus && (
                    <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm overflow-x-auto">
                        <h4 className="text-sm font-semibold mb-2">Z-Bus Matrix (Inverse)</h4>
                        <table className="text-[10px] font-mono w-full">
                            <thead>
                                <tr><th className="w-8"></th>{Array(numBuses).fill(0).map((_, j) => <th key={j} className="text-center px-1">Bus {j + 1}</th>)}</tr>
                            </thead>
                            <tbody>
                                {(zBus as math.Complex[][]).slice(0, numBuses).map((row, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="font-bold text-slate-500">Bus {i + 1}</td>
                                        {row.slice(0, numBuses).map((cell, j) => (
                                            <td key={j} className="text-center px-1 py-0.5">
                                                {fmtC(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Calculation steps */}
                <div className="bg-white dark:bg-zinc-900 border p-3 rounded-lg shadow-sm">
                    <button onClick={() => setShowSteps(!showSteps)} className="text-sm font-semibold text-primary hover:underline w-full text-left">
                        {showSteps ? '▼' : '▶'} Show Calculation Steps
                    </button>
                    {showSteps && (
                        <pre className="mt-2 text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                            {steps.join('\n')}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
};

export default YBusCalculator;
