import React, { useState } from 'react';
import { MathTex } from '../components/MathTex';

const ZBusBuilder: React.FC = () => {
    const [steps, setSteps] = useState<{ desc: string; matrix: number[][]; stepNum: number }[]>([]);
    const [currentZ, setCurrentZ] = useState<number[][]>([[0.5]]);

    const addNodeRadio = () => {
        // Case 2: Radial extension
        const newDim = currentZ.length + 1;
        const newZ = Array(newDim).fill(0).map(() => Array(newDim).fill(0));

        // Copy existing
        for (let i = 0; i < currentZ.length; i++) {
            for (let j = 0; j < currentZ.length; j++) {
                newZ[i][j] = currentZ[i][j];
            }
        }

        // Link to last node added
        const k = currentZ.length - 1;
        const zb = 0.2; // random impedance
        for (let i = 0; i < currentZ.length; i++) {
            newZ[i][newDim - 1] = currentZ[i][k];
            newZ[newDim - 1][i] = currentZ[k][i];
        }
        newZ[newDim - 1][newDim - 1] = currentZ[k][k] + zb;

        setCurrentZ(newZ);
        setSteps([...steps, { desc: `Case 2: Added radial node with Zb = ${zb} p.u.`, matrix: newZ, stepNum: steps.length + 1 }]);
    };

    const addLoop = () => {
        // Case 4: loop between 0 and last node
        const j = 0;
        const k = currentZ.length - 1;
        const zb = 0.1;

        // Kron reduction
        const n = currentZ.length;
        const loopZ = currentZ[j][j] + currentZ[k][k] - 2 * currentZ[j][k] + zb;

        const newZ = Array(n).fill(0).map(() => Array(n).fill(0));
        for (let x = 0; x < n; x++) {
            for (let y = 0; y < n; y++) {
                const zxLoop = currentZ[x][j] - currentZ[x][k];
                const zyLoop = currentZ[j][y] - currentZ[k][y];
                newZ[x][y] = Number((currentZ[x][y] - (zxLoop * zyLoop) / loopZ).toFixed(4));
            }
        }

        setCurrentZ(newZ);
        setSteps([...steps, { desc: `Case 4: Added loop between node 1 and ${k + 1} with Zb = ${zb} p.u. (Kron Reduction Applied)`, matrix: newZ, stepNum: steps.length + 1 }]);
    };

    const reset = () => {
        setCurrentZ([[0.5]]);
        setSteps([{ desc: "Case 1: Initial bus to reference (Zb = 0.5 p.u.)", matrix: [[0.5]], stepNum: 0 }]);
    }

    React.useEffect(() => {
        reset();
    }, []);

    const formatMatrix = (m: number[][]) => {
        const rows = m.map(row => row.join(" & ")).join(" \\\\ ");
        return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 p-4">
            <h3 className="font-bold text-lg mb-2">Z-Bus Algorithm Visualizer</h3>
            <p className="text-xs text-muted-foreground mb-4">
                Interactively build a Z-Bus matrix step-by-step.
            </p>

            <div className="flex gap-2 mb-4">
                <button onClick={addNodeRadio} className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                    Add Radial Node (Case 2)
                </button>
                <button onClick={addLoop} disabled={currentZ.length < 2} className="bg-orange-500 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-orange-600 transition-colors disabled:opacity-50">
                    Close Loop (Case 4)
                </button>
                <button onClick={reset} className="ml-auto bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs uppercase font-bold hover:bg-slate-300">
                    Reset
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {steps.map(step => (
                    <div key={step.stepNum} className="p-3 bg-white dark:bg-zinc-900 border rounded-lg shadow-sm">
                        <p className="mb-2 text-primary font-medium text-sm">{step.desc}</p>
                        <div className="overflow-x-auto text-sm pb-2">
                            <MathTex block math={`Z_{BUS}^{(n=${step.matrix.length})} = ${formatMatrix(step.matrix)}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ZBusBuilder;
