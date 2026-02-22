import React from 'react';
import { MathTex } from '../components/MathTex';

const DecoupledContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="decoupled-nr">Decoupled Newton-Raphson Load Flow</h1>

            <p>
                The profound computational cost of continually evaluating and inverting the dense N-R Jacobian matrix spurred the development of decoupling techniques.
                The Decoupled Newton-Raphson method leverages the fundamental physical transmission characteristics of high-voltage AC power systems.
            </p>

            <h2>Physical Justification and Decoupling</h2>
            <p>
                In a well-designed transmission grid, <strong>real power transfer (<MathTex math={"P"} />)</strong> is highly sensitive to changes in the transmission phase angle (<MathTex math={"\\delta"} />) but largely insensitive to voltage magnitude (<MathTex math={"V"} />). Conversely, <strong>reactive power flow (<MathTex math={"Q"} />)</strong> is tightly coupled to the voltage magnitude differential but virtually unaffected by phase angle variations.
            </p>

            <p>
                Mathematically, the cross-coupling sub-matrices <MathTex math={"L"} /> (<MathTex math={"\\partial P / \\partial V"} />) and <MathTex math={"M"} /> (<MathTex math={"\\partial Q / \\partial \\delta"} />) asymptotically approach zero:
            </p>
            <MathTex block math="\left| \frac{\partial P_i}{\partial \delta_i} \right| \gg \left| \frac{\partial Q_i}{\partial \delta_i} \right| \implies M \approx 0" />
            <MathTex block math="\left| \frac{\partial Q_i}{\partial V_i} \right| \gg \left| \frac{\partial P_i}{\partial V_i} \right| \implies L \approx 0" />

            <p>
                Applying these constraints cleaves the massive N-R matrix into two separate, decoupled linear systems solved sequentially:
            </p>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center my-6">
                <MathTex block math="[\Delta P] = [H][\Delta \delta]" />
                <MathTex block math="[\Delta Q] = [N][\Delta |V|]" />
            </div>

            <hr />

            <h2 id="decoupled-fdlf">Fast Decoupled Load Flow (FDLF) Method</h2>
            <p>
                To entirely circumvent the continuous recalculation of the Jacobian coefficients, Stott and Alsac pioneered the FDLF method, pushing decoupling assumptions to their absolute theoretical limits.
            </p>

            <h3>Stott and Alsac Assumptions</h3>
            <ol>
                <li>Extra-high-voltage lines are predominantly inductive with very little resistance (<MathTex math={"G_{ij} \\ll B_{ij}"} />).</li>
                <li>The phase angle difference is extremely small (<MathTex math={"\\cos(\\delta_{ij}) \\approx 1"} /> and <MathTex math={"G_{ij}\\sin(\\delta_{ij}) \\approx 0"} />).</li>
                <li>Network voltages sit closely around nominal (<MathTex math={"V_j \\approx 1.0"} /> p.u.).</li>
            </ol>

            <h3>How to Form B′ and B″ Matrices</h3>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg my-4 space-y-4">
                <div>
                    <h4 className="mt-0 text-blue-700 dark:text-blue-400">B′ Matrix (P-δ subproblem)</h4>
                    <ol className="text-sm">
                        <li>Start with the full <MathTex math={"Y_{BUS}"} /> matrix</li>
                        <li>Extract the <strong>imaginary part</strong> of each element: <MathTex math={"B'_{ij} = -\\text{Im}(Y_{ij})"} /></li>
                        <li>Remove the row and column corresponding to the <strong>slack bus</strong></li>
                        <li>The result is an <MathTex math={"(n-1) \\times (n-1)"} /> real constant matrix</li>
                    </ol>
                    <MathTex block math="B'_{ij} = -B_{ij} \quad \text{for all non-slack buses } i, j" />
                </div>

                <div>
                    <h4 className="mt-0 text-blue-700 dark:text-blue-400">B″ Matrix (Q-V subproblem)</h4>
                    <ol className="text-sm">
                        <li>Start with the full <MathTex math={"Y_{BUS}"} /> matrix</li>
                        <li>Extract the <strong>imaginary part</strong>: <MathTex math={"B''_{ij} = -\\text{Im}(Y_{ij})"} /></li>
                        <li>Remove rows/columns for both the <strong>slack bus</strong> AND all <strong>PV buses</strong></li>
                        <li>The result is an <MathTex math={"m \\times m"} /> matrix, where <MathTex math={"m"} /> = number of PQ buses</li>
                    </ol>
                    <MathTex block math="B''_{ij} = -B_{ij} \quad \text{for all PQ buses } i, j" />
                </div>
            </div>

            <h3>Complete FDLF Algorithm</h3>
            <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg my-4">
                <ol>
                    <li className="mb-2"><strong>Step 1:</strong> Form <MathTex math={"Y_{BUS}"} /> and extract <MathTex math={"B'"} /> and <MathTex math={"B''"} /></li>
                    <li className="mb-2"><strong>Step 2:</strong> Factorize (or invert) <MathTex math={"B'"} /> and <MathTex math={"B''"} /> — done <strong>only once</strong></li>
                    <li className="mb-2"><strong>Step 3:</strong> Initialize flat start: <MathTex math={"|V_i|^{(0)} = 1.0, \\; \\delta_i^{(0)} = 0"} /></li>
                    <li className="mb-2"><strong>Step 4 (P-δ half):</strong> Compute <MathTex math={"\\Delta P_i / |V_i|"} /> for all non-slack buses. Solve:
                        <MathTex block math="[\\Delta \\delta] = [B']^{-1} \\left[ \\frac{\\Delta P}{|V|} \\right]" />
                        Update: <MathTex math={"\\delta_i^{(k+1)} = \\delta_i^{(k)} + \\Delta \\delta_i"} />
                    </li>
                    <li className="mb-2"><strong>Step 5 (Q-V half):</strong> Compute <MathTex math={"\\Delta Q_i / |V_i|"} /> for all PQ buses. Solve:
                        <MathTex block math="[\\Delta |V|] = [B'']^{-1} \\left[ \\frac{\\Delta Q}{|V|} \\right]" />
                        Update: <MathTex math={"|V_i|^{(k+1)} = |V_i|^{(k)} + \\Delta |V_i|"} />
                    </li>
                    <li className="mb-2"><strong>Step 6:</strong> Check convergence: <MathTex math={"\\max(|\\Delta P|, |\\Delta Q|) \\leq \\epsilon"} /></li>
                    <li><strong>Step 7:</strong> If not converged, go to Step 4. Otherwise, compute line flows.</li>
                </ol>
            </div>

            <hr />

            <h2>Worked Example: 3-Bus FDLF</h2>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 p-4 rounded-lg my-4">
                <h4 className="mt-0 text-green-700 dark:text-green-400">System Data</h4>
                <table className="text-sm w-full">
                    <thead>
                        <tr className="border-b"><th>Bus</th><th>Type</th><th>|V| (p.u.)</th><th>P<sub>G</sub> (MW)</th><th>P<sub>L</sub> (MW)</th><th>Q<sub>L</sub> (MVAr)</th></tr>
                    </thead>
                    <tbody>
                        <tr className="border-b"><td>1</td><td>Slack</td><td>1.05</td><td>—</td><td>0</td><td>0</td></tr>
                        <tr className="border-b"><td>2</td><td>PQ</td><td>1.0</td><td>0</td><td>256.6</td><td>110.2</td></tr>
                        <tr><td>3</td><td>PQ</td><td>1.0</td><td>0</td><td>138.6</td><td>45.2</td></tr>
                    </tbody>
                </table>

                <h4 className="text-green-700 dark:text-green-400 mt-4">Line Data (100 MVA base)</h4>
                <table className="text-sm w-full">
                    <thead>
                        <tr className="border-b"><th>From</th><th>To</th><th>R (p.u.)</th><th>X (p.u.)</th><th>B (p.u.)</th></tr>
                    </thead>
                    <tbody>
                        <tr className="border-b"><td>1</td><td>2</td><td>0.02</td><td>0.04</td><td>0.0</td></tr>
                        <tr className="border-b"><td>1</td><td>3</td><td>0.01</td><td>0.03</td><td>0.0</td></tr>
                        <tr><td>2</td><td>3</td><td>0.0125</td><td>0.025</td><td>0.0</td></tr>
                    </tbody>
                </table>
            </div>

            <h4>Step 1: Form Y-Bus</h4>
            <p className="text-sm">Computing series admittances:</p>
            <MathTex block math="y_{12} = \frac{1}{0.02+j0.04} = 10 - j20, \quad y_{13} = \frac{1}{0.01+j0.03} = 10 - j30" />
            <MathTex block math="y_{23} = \frac{1}{0.0125+j0.025} = 16 - j32" />

            <h4>Step 2: Extract B′ (remove slack bus 1)</h4>
            <p className="text-sm">B′ = negative imaginary part of Y-Bus, rows/cols for buses 2 and 3:</p>
            <MathTex block math="B' = \begin{bmatrix} -\text{Im}(Y_{22}) & -\text{Im}(Y_{23}) \\ -\text{Im}(Y_{32}) & -\text{Im}(Y_{33}) \end{bmatrix} = \begin{bmatrix} 52 & -32 \\ -32 & 62 \end{bmatrix}" />

            <h4>Step 3: B″ is same as B′ here (both buses 2,3 are PQ)</h4>
            <MathTex block math="B'' = B' = \begin{bmatrix} 52 & -32 \\ -32 & 62 \end{bmatrix}" />

            <h4>Step 4: Iteration 1 (P-δ half)</h4>
            <p className="text-sm">With flat start <MathTex math={"\\delta_2 = \\delta_3 = 0"} />, <MathTex math={"|V_2| = |V_3| = 1.0"} />:</p>
            <MathTex block math="\frac{\Delta P_2}{|V_2|} = \frac{P_2^{spec} - P_2^{calc}}{|V_2|}, \quad \frac{\Delta P_3}{|V_3|} = \frac{P_3^{spec} - P_3^{calc}}{|V_3|}" />
            <p className="text-sm">Solve <MathTex math={"[\\Delta \\delta] = [B']^{-1} [\\Delta P / |V|]"} /> to get updated angles.</p>

            <h4>Step 5: Iteration 1 (Q-V half)</h4>
            <p className="text-sm">Using updated angles, compute reactive power mismatches and solve:</p>
            <MathTex block math="[\Delta |V|] = [B'']^{-1} \left[ \frac{\Delta Q}{|V|} \right]" />
            <p className="text-sm">Update voltage magnitudes for PQ buses.</p>

            <p className="text-sm italic">
                Repeat Steps 4–5 until max mismatch ≤ tolerance. FDLF typically converges in 3–5 iterations for well-conditioned systems.
            </p>

            <hr />

            <h3>Vulnerabilities</h3>
            <p>
                FDLF breaks down in distribution networks characterized by tight phase spacing, resulting in high line resistance and low reactance (<strong>high R/X ratios</strong>).
                This destroys the diagonal dominance of the <MathTex math={"Y_{BUS}"} />, causing severe divergence. Modern solutions apply <i>Axis Rotation</i> to artificially shift the impedance profile and restore FDLF convergence.
            </p>
        </div>
    );
};

export default DecoupledContent;
