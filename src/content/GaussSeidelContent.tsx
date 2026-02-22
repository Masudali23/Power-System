import React from 'react';
import { MathTex } from '../components/MathTex';

const GaussSeidelContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="gauss-seidel-algorithm">Gauss-Seidel Load Flow Method</h1>

            <p>
                The Gauss-Seidel Load Flow (GSLF) method is a foundational iterative numerical technique that solves the SLFE in its complex form.
                It continuously updates the state vector, utilizing the newly calculated variables from the current iteration (<MathTex math={"k"} />) immediately as they become available for subsequent bus calculations, accelerating the convergence trajectory compared to the standard Gauss method.
            </p>

            <h2>Step-by-Step Algorithm (Without PV Buses)</h2>
            <ol>
                <li><strong>Initialization:</strong> Formulate the <MathTex math={"Y_{BUS}"} /> matrix. Convert all specified load and generation values into per-unit (p.u.).</li>
                <li><strong>Flat Start:</strong> Assume an initial "flat" voltage profile for all PQ buses, typically <MathTex math={"V_i^{(0)} = 1.0 + j0.0"} />. Slack bus remains fixed.</li>
                <li><strong>Voltage Update:</strong> Iterating through each load bus <MathTex math={"i"} />, compute the updated complex voltage for iteration <MathTex math={"k+1"} />:
                    <div className="my-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 overflow-x-auto">
                        <MathTex block math="V_i^{(k+1)} = \frac{1}{Y_{ii}} \left[ \frac{P_i - jQ_i}{(V_i^{(k)})^*} - \sum_{j=1}^{i-1} Y_{ij} V_j^{(k+1)} - \sum_{j=i+1}^{n} Y_{ij} V_j^{(k)} \right]" />
                    </div>
                </li>
                <li><strong>Check Convergence:</strong> Compute the absolute change <MathTex math={"\\Delta V_i^{(k + 1)} = |V_i^{(k + 1)} - V_i^{(k)}|"} />. If maximum mismatch <MathTex math={"\\le \\epsilon"} />, terminate.</li>
            </ol>

            <hr />

            <h2 id="gauss-seidel-pv">PV Bus Logic & Limits</h2>
            <p>
                The introduction of Voltage Controlled (P-V) buses complicates the methodology because the reactive power injection (<MathTex math={"Q_i"} />) is unknown and must be dynamically estimated. Furthermore, generators possess strict reactive power limits (<MathTex math={"Q_{min} \\le Q_i \\le Q_{max}"} />).
            </p>

            <div className="space-y-4">
                <div>
                    <strong>1. Reactive Power Estimation:</strong>
                    <MathTex block math="Q_i^{(k+1)} = -Im \left\{ (V_i^{(k)})^* \sum_{j=1}^{n} Y_{ij} V_j^{(k)} \right\}" />
                </div>
                <div>
                    <strong>2. Limit Violation Checking:</strong><br />
                    If <MathTex math={"Q_i^{(k + 1)}"} /> hits a limit, clamp the value and temporarily convert the bus to a standard PQ load bus.
                </div>
                <div>
                    <strong>3. Magnitude Restoration:</strong><br />
                    If the bus maintains P-V status, apply the intermediate voltage update to calculate a new angle, but forcibly overwrite the magnitude back to the specified setpoint <MathTex math={"|V_i^{sp}|"} />:
                    <MathTex block math="V_i^{(k+1)} = |V_i^{sp}| \angle \delta_i^{(k+1)}" />
                </div>
            </div>

            <hr />

            <h2>The Acceleration Factor</h2>
            <p>
                A fundamental flaw of the Gauss-Seidel method is its lethargic convergence rate. To combat this, an <strong>Acceleration Factor (<MathTex math={"\\alpha"} />)</strong> is introduced to deliberately overshoot the computed voltage correction:
            </p>
            <MathTex block math="V_{i, acc}^{(k+1)} = V_i^{(k)} + \alpha (V_{i, calc}^{(k+1)} - V_i^{(k)})" />
            <p className="text-sm text-muted-foreground italic">Optimal <MathTex math={"\\alpha"} /> is typically around 1.6. Selecting a value too large induces severe mathematical oscillations.</p>

            <h3>Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 rounded">
                    <h4 className="text-green-700 dark:text-green-400 mt-0">Advantages</h4>
                    <ul className="text-sm">
                        <li>Requires extremely small memory allocation per iteration.</li>
                        <li>Highly straightforward mathematical formulation.</li>
                    </ul>
                </div>
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 rounded">
                    <h4 className="text-red-700 dark:text-red-400 mt-0">Disadvantages</h4>
                    <ul className="text-sm">
                        <li>Computation time scales almost linearly with grid size.</li>
                        <li>Highly susceptible to divergence in ill-conditioned grids or networks with high R/X ratios.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GaussSeidelContent;
