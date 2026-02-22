// IEEE 3-Bus Example based on standard textbook problems
export const IEEE3Bus = {
    baseMVA: 100,
    buses: [
        { id: 1, type: 'slack', vMag: 1.05, vAng: 0, pGen: 0, qGen: 0, pLoad: 0, qLoad: 0 },
        { id: 2, type: 'pv', vMag: 1.04, vAng: 0, pGen: 200, qGen: 0, pLoad: 0, qLoad: 0, qMin: -50, qMax: 100 },
        { id: 3, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 400, qLoad: 250 },
    ],
    branches: [
        { from: 1, to: 2, r: 0.02, x: 0.04, b: 0.01 },
        { from: 1, to: 3, r: 0.01, x: 0.03, b: 0.01 },
        { from: 2, to: 3, r: 0.0125, x: 0.025, b: 0.01 },
    ]
};

// Simplified IEEE 14-bus test system
export const IEEE14Bus = {
    baseMVA: 100,
    buses: [
        { id: 1, type: 'slack', vMag: 1.06, vAng: 0, pGen: 0, qGen: 0, pLoad: 0, qLoad: 0 },
        { id: 2, type: 'pv', vMag: 1.045, vAng: 0, pGen: 40, qGen: 0, pLoad: 21.7, qLoad: 12.7, qMin: -40, qMax: 50 },
        { id: 3, type: 'pv', vMag: 1.01, vAng: 0, pGen: 0, qGen: 0, pLoad: 94.2, qLoad: 19.0, qMin: 0, qMax: 40 },
        { id: 4, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 47.8, qLoad: -3.9 },
        { id: 5, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 7.6, qLoad: 1.6 },
        { id: 6, type: 'pv', vMag: 1.07, vAng: 0, pGen: 0, qGen: 0, pLoad: 11.2, qLoad: 7.5, qMin: -6, qMax: 24 },
        { id: 7, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 0, qLoad: 0 },
        { id: 8, type: 'pv', vMag: 1.09, vAng: 0, pGen: 0, qGen: 0, pLoad: 0, qLoad: 0, qMin: -6, qMax: 24 },
        { id: 9, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 29.5, qLoad: 16.6 },
        { id: 10, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 9.0, qLoad: 5.8 },
        { id: 11, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 3.5, qLoad: 1.8 },
        { id: 12, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 6.1, qLoad: 1.6 },
        { id: 13, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 13.5, qLoad: 5.8 },
        { id: 14, type: 'pq', vMag: 1.0, vAng: 0, pGen: 0, qGen: 0, pLoad: 14.9, qLoad: 5.0 },
    ],
    branches: [
        { from: 1, to: 2, r: 0.01938, x: 0.05917, b: 0.0528 },
        { from: 1, to: 5, r: 0.05403, x: 0.22304, b: 0.0492 },
        { from: 2, to: 3, r: 0.04699, x: 0.19797, b: 0.0438 },
        { from: 2, to: 4, r: 0.05811, x: 0.17632, b: 0.0340 },
        { from: 2, to: 5, r: 0.05695, x: 0.17388, b: 0.0346 },
        { from: 3, to: 4, r: 0.06701, x: 0.17103, b: 0.0128 },
        { from: 4, to: 5, r: 0.01335, x: 0.04211, b: 0.0 },
        { from: 4, to: 7, r: 0.0, x: 0.20912, b: 0.0, tapRatio: 0.978 },
        { from: 4, to: 9, r: 0.0, x: 0.55618, b: 0.0, tapRatio: 0.969 },
        { from: 5, to: 6, r: 0.0, x: 0.25202, b: 0.0, tapRatio: 0.932 },
        { from: 6, to: 11, r: 0.09498, x: 0.19890, b: 0.0 },
        { from: 6, to: 12, r: 0.12291, x: 0.25581, b: 0.0 },
        { from: 6, to: 13, r: 0.06615, x: 0.13027, b: 0.0 },
        { from: 7, to: 8, r: 0.0, x: 0.17615, b: 0.0 },
        { from: 7, to: 9, r: 0.0, x: 0.11001, b: 0.0 },
        { from: 9, to: 10, r: 0.03181, x: 0.08450, b: 0.0 },
        { from: 9, to: 14, r: 0.12711, x: 0.27038, b: 0.0 },
        { from: 10, to: 11, r: 0.08205, x: 0.19207, b: 0.0 },
        { from: 12, to: 13, r: 0.22092, x: 0.19988, b: 0.0 },
        { from: 13, to: 14, r: 0.17093, x: 0.34802, b: 0.0 },
    ]
};
