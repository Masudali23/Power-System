export type Complex = { re: number; im: number };

export interface BusData {
    id: number;
    type: 'slack' | 'pq' | 'pv';
    vMag: number; // Specified voltage magnitude (p.u.)
    vAng: number; // specified voltage angle (degrees)
    pGen: number; // real power generation (MW)
    qGen: number; // reactive power generation (MVAr)
    pLoad: number; // real power load (MW)
    qLoad: number; // reactive power load (MVAr)
    qMin?: number; // min reactive specific
    qMax?: number; // max reactive specific
}

export interface BranchData {
    from: number;
    to: number;
    r: number; // resistance (p.u.)
    x: number; // reactance (p.u.)
    b: number; // total line charging susceptance (p.u.)
    tapRatio?: number; // off-nominal tap ratio
}

export interface SystemData {
    baseMVA: number;
    buses: BusData[];
    branches: BranchData[];
}

export interface IterationResult {
    iteration: number;
    maxMismatch: number;
    voltages: { busId: number; vMag: number; vAng: number }[];
    details?: any;
}
