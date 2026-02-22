import * as math from 'mathjs';
import type { SystemData, IterationResult } from './types';
import { buildYBus, cplx } from './YBus';

export function runFDLF(system: SystemData, maxIter: number, tolerance: number): {
    iterations: IterationResult[];
    bPrime: number[][];
    bDoublePrime: number[][];
} {
    const yBus = buildYBus(system);
    const numBuses = system.buses.length;
    const baseMVA = system.baseMVA;

    // Find bus indices by type
    const slackIdx = system.buses.findIndex(b => b.type === 'slack');
    const pqIndices: number[] = [];
    const pvIndices: number[] = [];
    const nonSlackIndices: number[] = [];

    system.buses.forEach((b, i) => {
        if (b.type === 'pq') { pqIndices.push(i); nonSlackIndices.push(i); }
        if (b.type === 'pv') { pvIndices.push(i); nonSlackIndices.push(i); }
    });

    // B' matrix: imaginary part of Y-bus, remove slack row/col, negate
    // Used for P-δ subproblem (all non-slack buses)
    const bPrimeSize = nonSlackIndices.length;
    const bPrime: number[][] = Array(bPrimeSize).fill(0).map(() => Array(bPrimeSize).fill(0));

    for (let ii = 0; ii < bPrimeSize; ii++) {
        for (let jj = 0; jj < bPrimeSize; jj++) {
            const i = nonSlackIndices[ii];
            const j = nonSlackIndices[jj];
            bPrime[ii][jj] = -yBus[i][j].im;
        }
    }

    // B'' matrix: imaginary part of Y-bus, remove slack and PV rows/cols, negate
    // Used for Q-V subproblem (PQ buses only)
    const bDPSize = pqIndices.length;
    const bDoublePrime: number[][] = Array(bDPSize).fill(0).map(() => Array(bDPSize).fill(0));

    for (let ii = 0; ii < bDPSize; ii++) {
        for (let jj = 0; jj < bDPSize; jj++) {
            const i = pqIndices[ii];
            const j = pqIndices[jj];
            bDoublePrime[ii][jj] = -yBus[i][j].im;
        }
    }

    // Invert B' and B'' (they are constant)
    const bPrimeInv = math.inv(bPrime) as number[][];
    const bDPInv = bDPSize > 0 ? math.inv(bDoublePrime) as number[][] : [];

    // Initialize voltages
    const vMag: number[] = system.buses.map(b => b.vMag);
    const vAng: number[] = system.buses.map(b => b.vAng * Math.PI / 180);

    const pSpec = system.buses.map(b => (b.pGen - b.pLoad) / baseMVA);
    const qSpec = system.buses.map(b => (b.qGen - b.qLoad) / baseMVA);

    const iterations: IterationResult[] = [];

    // Initial state
    iterations.push({
        iteration: 0,
        maxMismatch: 0,
        voltages: system.buses.map((b, i) => ({ busId: b.id, vMag: vMag[i], vAng: vAng[i] * 180 / Math.PI }))
    });

    let iter = 0;
    let maxMismatch = Infinity;

    while (iter < maxIter && maxMismatch > tolerance) {
        iter++;
        maxMismatch = 0;

        // === P-δ half-iteration ===
        // Compute ΔP_i / V_i for non-slack buses
        const deltaPoverV: number[] = [];
        for (const i of nonSlackIndices) {
            let pCalc = 0;
            for (let j = 0; j < numBuses; j++) {
                const gij = yBus[i][j].re;
                const bij = yBus[i][j].im;
                pCalc += vMag[i] * vMag[j] * (gij * Math.cos(vAng[i] - vAng[j]) + bij * Math.sin(vAng[i] - vAng[j]));
            }
            const dp = (pSpec[i] - pCalc) / vMag[i];
            deltaPoverV.push(dp);
            maxMismatch = Math.max(maxMismatch, Math.abs(dp * vMag[i]));
        }

        // Solve: Δδ = B'^(-1) * (ΔP/V)
        for (let ii = 0; ii < bPrimeSize; ii++) {
            let sum = 0;
            for (let jj = 0; jj < bPrimeSize; jj++) {
                sum += bPrimeInv[ii][jj] * deltaPoverV[jj];
            }
            vAng[nonSlackIndices[ii]] += sum;
        }

        // === Q-V half-iteration ===
        if (bDPSize > 0) {
            const deltaQoverV: number[] = [];
            for (const i of pqIndices) {
                let qCalc = 0;
                for (let j = 0; j < numBuses; j++) {
                    const gij = yBus[i][j].re;
                    const bij = yBus[i][j].im;
                    qCalc += vMag[i] * vMag[j] * (gij * Math.sin(vAng[i] - vAng[j]) - bij * Math.cos(vAng[i] - vAng[j]));
                }
                const dq = (qSpec[i] - qCalc) / vMag[i];
                deltaQoverV.push(dq);
                maxMismatch = Math.max(maxMismatch, Math.abs(dq * vMag[i]));
            }

            // Solve: ΔV = B''^(-1) * (ΔQ/V)
            for (let ii = 0; ii < bDPSize; ii++) {
                let sum = 0;
                for (let jj = 0; jj < bDPSize; jj++) {
                    sum += (bDPInv as number[][])[ii][jj] * deltaQoverV[jj];
                }
                vMag[pqIndices[ii]] += sum;
            }
        }

        iterations.push({
            iteration: iter,
            maxMismatch,
            voltages: system.buses.map((b, i) => ({
                busId: b.id,
                vMag: vMag[i],
                vAng: vAng[i] * 180 / Math.PI
            }))
        });
    }

    return { iterations, bPrime, bDoublePrime };
}
