import { expect, test } from 'vitest';
import { IEEE3Bus } from '../../data/testCases';
import { buildYBus } from './YBus';

test('Build Y-Bus from IEEE 3-Bus data', () => {
    const yBus = buildYBus(IEEE3Bus);

    expect(yBus.length).toBe(3);

    // Y11 = y12 + y13 + j * (b12/2 + b13/2)
    // Z12 = 0.02 + j0.04 -> y12 = 1/(0.02+j0.04) = 10 - j20
    // Z13 = 0.01 + j0.03 -> y13 = 1/(0.01+j0.03) = 10 - j30
    // Total Y11: (10 - j20) + (10 - j30) + j0.01 = 20 - j49.99

    const Y11 = yBus[0][0];
    expect(Y11.re).toBeCloseTo(20, 2);
    expect(Y11.im).toBeCloseTo(-49.99, 2);

    const Y12 = yBus[0][1];
    expect(Y12.re).toBeCloseTo(-10, 2);
    expect(Y12.im).toBeCloseTo(20, 2);
});
