import * as math from 'mathjs';
import type { SystemData } from './types';

// Converts to complex number helper
export const cplx = (re: number, im: number): math.Complex => math.complex(re, im);

export function buildYBus(system: SystemData): math.Complex[][] {
    const numBuses = system.buses.length;
    // Initialize NxN YBus with zero
    const yBus: math.Complex[][] = Array(numBuses).fill(0).map(() => Array(numBuses).fill(cplx(0, 0)));

    system.branches.forEach(branch => {
        const fromIdx = system.buses.findIndex(b => b.id === branch.from);
        const toIdx = system.buses.findIndex(b => b.id === branch.to);

        // Series Admittance y_series = 1 / (r + jx)
        const zSeries = cplx(branch.r, branch.x);
        const ySeries = math.divide(1, zSeries) as math.Complex;

        // Total line charging is divided by 2
        const yShunt = cplx(0, branch.b / 2);

        let tap = branch.tapRatio || 1.0;

        // Nominal
        if (tap === 1.0) {
            // Off-diagonal = - ySeries
            const negYSeries = math.multiply(ySeries, -1) as math.Complex;
            yBus[fromIdx][toIdx] = math.add(yBus[fromIdx][toIdx], negYSeries) as math.Complex;
            yBus[toIdx][fromIdx] = math.add(yBus[toIdx][fromIdx], negYSeries) as math.Complex;

            // Diagonal
            yBus[fromIdx][fromIdx] = math.add(yBus[fromIdx][fromIdx], math.add(ySeries, yShunt)) as math.Complex;
            yBus[toIdx][toIdx] = math.add(yBus[toIdx][toIdx], math.add(ySeries, yShunt)) as math.Complex;
        } else {
            // With off-nominal tap ratio n
            const n2 = tap * tap;

            yBus[fromIdx][fromIdx] = math.add(yBus[fromIdx][fromIdx], math.add(math.divide(ySeries, n2), yShunt)) as math.Complex;

            const trY = math.multiply(math.divide(ySeries, tap), -1) as math.Complex;
            yBus[fromIdx][toIdx] = math.add(yBus[fromIdx][toIdx], trY) as math.Complex;
            yBus[toIdx][fromIdx] = math.add(yBus[toIdx][fromIdx], trY) as math.Complex;

            yBus[toIdx][toIdx] = math.add(yBus[toIdx][toIdx], math.add(ySeries, yShunt)) as math.Complex;
        }
    });

    return yBus;
}
