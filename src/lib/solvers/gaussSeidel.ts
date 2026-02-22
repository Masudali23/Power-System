import * as math from 'mathjs';
import type { SystemData, IterationResult } from './types';
import { buildYBus, cplx } from './YBus';

export function runGaussSeidel(system: SystemData, maxIter: number, tolerance: number): IterationResult[] {
    const yBus = buildYBus(system);
    const numBuses = system.buses.length;
    const baseMVA = system.baseMVA;

    // Initialize Voltages
    let v: math.Complex[] = [];
    system.buses.forEach(b => {
        if (b.type === 'slack') {
            const rad = b.vAng * Math.PI / 180;
            v.push(math.complex(b.vMag * Math.cos(rad), b.vMag * Math.sin(rad)) as math.Complex);
        } else if (b.type === 'pv') {
            v.push(math.complex(b.vMag, 0) as math.Complex);
        } else {
            v.push(math.complex(1.0, 0) as math.Complex);
        }
    });

    const iterations: IterationResult[] = [];

    // Convert specified powers to p.u.
    const pSpec = system.buses.map(b => (b.pGen - b.pLoad) / baseMVA);
    const qSpec = system.buses.map(b => (b.qGen - b.qLoad) / baseMVA);

    let iter = 0;
    let maxMismatch = Infinity;

    // Save step 0
    iterations.push({
        iteration: 0,
        maxMismatch: 0,
        voltages: system.buses.map((b, i) => ({
            busId: b.id,
            vMag: v[i].toPolar().r,
            vAng: v[i].toPolar().phi * 180 / Math.PI
        }))
    });

    while (iter < maxIter && maxMismatch > tolerance) {
        maxMismatch = 0;
        iter++;

        let newV = [...v];

        for (let i = 0; i < numBuses; i++) {
            const bus = system.buses[i];
            if (bus.type === 'slack') continue;

            let calcQ = qSpec[i];

            // PV Bus Logic: Calculate Reactive Power
            if (bus.type === 'pv') {
                let currentI = cplx(0, 0);
                for (let j = 0; j < numBuses; j++) {
                    const term = math.multiply(yBus[i][j], (j < i) ? newV[j] : v[j]) as math.Complex;
                    currentI = math.add(currentI, term) as math.Complex;
                }
                const S_calc = math.multiply(newV[i], math.conj(currentI)) as math.Complex;

                // Reactive requested
                let qReq = S_calc.im;

                // Check limits if specified
                if (bus.qMin !== undefined && bus.qMax !== undefined) {
                    const qMinPU = bus.qMin / baseMVA;
                    const qMaxPU = bus.qMax / baseMVA;
                    if (qReq < qMinPU) calcQ = qMinPU;
                    else if (qReq > qMaxPU) calcQ = qMaxPU;
                    else calcQ = qReq;
                } else {
                    calcQ = qReq;
                }
            }

            // Gauss-Seidel Voltage Update
            const S_spec = math.complex(pSpec[i], -calcQ) as math.Complex; // Conj(S) = P - jQ
            const term1 = math.divide(S_spec, math.conj(newV[i])) as math.Complex;

            let sumYV = cplx(0, 0);
            for (let j = 0; j < numBuses; j++) {
                if (i !== j) {
                    const voltage = (j < i) ? newV[j] : v[j];
                    sumYV = math.add(sumYV, math.multiply(yBus[i][j], voltage)) as math.Complex;
                }
            }

            const vCalc = math.divide(math.subtract(term1, sumYV), yBus[i][i]) as math.Complex;

            // PV Bus Magnitude Correction
            if (bus.type === 'pv' && calcQ === qSpec[i]) {
                // Not at limit, restore magnitude
                const angle = vCalc.toPolar().phi;
                newV[i] = math.complex(bus.vMag * Math.cos(angle), bus.vMag * Math.sin(angle)) as math.Complex;
            } else {
                newV[i] = vCalc;
            }

            // Calculate mismatch
            const diff = math.subtract(newV[i], v[i]) as math.Complex;
            maxMismatch = Math.max(maxMismatch, diff.toPolar().r);
        }

        v = newV;

        iterations.push({
            iteration: iter,
            maxMismatch: maxMismatch,
            voltages: system.buses.map((b, idx) => ({
                busId: b.id,
                vMag: v[idx].toPolar().r,
                vAng: v[idx].toPolar().phi * 180 / Math.PI
            }))
        });
    }

    return iterations;
}
