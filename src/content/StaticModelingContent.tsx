import React from 'react';
import { MathTex } from '../components/MathTex';

const StaticModelingContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="static-modeling-ybus">Static Power System Modeling and Network Matrices</h1>

            <p>
                Static modeling is the foundational step in power system analysis, requiring the physical electrical
                network to be represented by an equivalent mathematical model comprising a set of governing algebraic equations and inequalities.
                To formulate these <strong>Static Load Flow Equations (SLFE)</strong>, each physical component of the power system must be
                translated into an idealized equivalent circuit.
            </p>

            <ul>
                <li><strong>Synchronous generators</strong> are modeled as ideal voltage or current sources injecting complex power (<MathTex math={"P"} /> and <MathTex math={"Q"} />).</li>
                <li><strong>Transmission lines</strong> are represented by their equivalent-<MathTex math={"\\pi"} /> models.</li>
                <li><strong>Transformers</strong> with fixed turns ratios are modeled simply as series impedances.</li>
                <li><strong>Electrical loads</strong> are typically modeled as constant real and reactive power sinks (constant P-Q loads).</li>
            </ul>

            <hr />

            <h2>Formulation of the Bus Admittance Matrix (Y-Bus)</h2>
            <p>
                The topological characteristics and electrical parameters of the power network are codified into the
                <strong>Bus Admittance Matrix</strong> (<MathTex math={"Y_{BUS}"} />). This matrix establishes the foundational
                linear relationship between the vector of nodal current injections and the vector of complex bus voltages through KCL:
            </p>

            <div className="my-6">
                <MathTex block math="[I_{BUS}] = [Y_{BUS}][V_{BUS}]" />
            </div>

            <p>
                The <MathTex math={"Y_{BUS}"} /> matrix is overwhelmingly preferred for power system computational algorithms due to its
                <strong>extreme sparsity</strong>. In a typical power grid, a single bus is physically connected to only a few other buses.
                Consequently, the vast majority of the off-diagonal elements are strictly zero.
            </p>

            <h3>Direct Assembly by Inspection</h3>
            <p>For networks without mutually coupled branches or complex phase-shifting transformers, <MathTex math={"Y_{BUS}"} /> can be assembled directly:</p>
            <ul>
                <li><strong>Diagonal elements (<MathTex math={"Y_{ii}"} />):</strong> The sum of all admittances directly connected to bus <MathTex math={"i"} />.</li>
                <li><strong>Off-diagonal elements (<MathTex math={"Y_{ij}"} />):</strong> The <em>negative</em> of the total admittance directly connecting bus <MathTex math={"i"} /> to bus <MathTex math={"j"} />.</li>
            </ul>

            <hr />

            <h2 id="static-modeling-zbus">Formulation of the Bus Impedance Matrix (Z-Bus)</h2>
            <p>
                The <strong>Bus Impedance Matrix</strong> (<MathTex math={"Z_{BUS}"} />) serves as the inverse mathematical counterpart to the admittance matrix.
            </p>

            <div className="my-4">
                <MathTex block math="[V_{BUS}] = [Z_{BUS}][I_{BUS}]" />
            </div>

            <p>
                Unlike <MathTex math={"Y_{BUS}"} />, the <MathTex math={"Z_{BUS}"} /> matrix is a <strong>fully dense, symmetrical matrix</strong>.
                Because performing a full matrix inversion for a massive network is computationally disastrous, <MathTex math={"Z_{BUS}"} /> is constructed systematically
                using a step-by-step <em>Building Algorithm</em>.
            </p>

            <h3>Z-Bus Building Cases</h3>

            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg">
                    <h4 className="mt-0 text-primary">Case 1: Adding a new bus <MathTex math={"p"} /> to the reference bus via impedance <MathTex math={"Z_b"} /></h4>
                    <p className="text-sm mb-2">Introduces a completely new, isolated node connected only to ground.</p>
                    <MathTex block math={'\\begin{bmatrix} Z_{11} & \\cdots & Z_{1n} & 0 \\\\ \\vdots & \\ddots & \\vdots & \\vdots \\\\ Z_{n1} & \\cdots & Z_{nn} & 0 \\\\ 0 & \\cdots & 0 & Z_b \\end{bmatrix}'} />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg">
                    <h4 className="mt-0 text-primary">Case 2: Adding a new bus <MathTex math={"p"} /> to an existing bus <MathTex math={"k"} /> via impedance <MathTex math={"Z_b"} /></h4>
                    <p className="text-sm mb-2">A radial extension of the network, creating a new node <MathTex math={"p"} /> fed from an active node <MathTex math={"k"} />. The new p<sup>th</sup> column and row are exact duplicates of the k<sup>th</sup> column and row.</p>
                    <MathTex block math={'\\begin{bmatrix} Z_{11} & \\cdots & Z_{1n} & Z_{1k} \\\\ \\vdots & \\ddots & \\vdots & \\vdots \\\\ Z_{n1} & \\cdots & Z_{nn} & Z_{nk} \\\\ Z_{k1} & \\cdots & Z_{kn} & Z_{kk} + Z_b \\end{bmatrix}'} />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg">
                    <h4 className="mt-0 text-primary">Case 3: Adding a branch between existing bus <MathTex math={"k"} /> and reference bus</h4>
                    <p className="text-sm mb-2">Closes a loop to ground. Requires Kron Reduction to eliminate the fictitious (n+1)<sup>th</sup> row and column.</p>
                    <MathTex block math="Z_{ij, modified} = Z_{ij} - \frac{Z_{ik}Z_{kj}}{Z_{kk} + Z_b}" />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg">
                    <h4 className="mt-0 text-primary">Case 4: Adding a branch between two existing buses <MathTex math={"j"} /> and <MathTex math={"k"} /></h4>
                    <p className="text-sm mb-2">Closure of a loop between two active buses. Kron reduction handles the loop distribution.</p>
                    <MathTex block math="Z_{xy, modified} = Z_{xy} - \frac{(Z_{xj} - Z_{xk})(Z_{jy} - Z_{ky})}{Z_{jj} + Z_{kk} - 2Z_{jk} + Z_b}" />
                </div>
            </div>

            <hr />

            <h2 id="static-modeling-transformers">Tap Changing Transformer Modeling</h2>

            <p>
                Transformers are critical active controllers within the power network. They regulate bus voltage magnitudes and redirect power flows by physically altering their internal turns ratio. This section provides a complete derivation of how transformers are modeled in the Y-Bus.
            </p>

            <h3>Step 1: The Ideal Transformer Model</h3>
            <p>
                An ideal transformer with a complex turns ratio <MathTex math={"t = |t| \\angle \\phi"} /> connecting bus <MathTex math={"i"} /> (primary) to bus <MathTex math={"j"} /> (secondary) satisfies:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg my-4">
                <MathTex block math="\frac{V_i}{V_j} = t \qquad \text{and} \qquad t^* I_i + I_j = 0" />
            </div>
            <p>
                The first equation states that the voltage transformation is governed by the turns ratio. The second equation enforces power conservation — no power is lost in an ideal transformer.
            </p>

            <h3>Step 2: Transformer with Series Leakage Impedance</h3>
            <p>
                A real transformer has a series leakage impedance <MathTex math={"z_k"} /> (or equivalently, admittance <MathTex math={"y_k = 1/z_k"} />). The standard model places this impedance on the secondary side of the ideal transformer. This gives us the equivalent circuit:
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg my-4">
                <p className="text-sm mb-3"><strong>Circuit:</strong> Bus <MathTex math={"i"} /> → [Ideal Transformer, ratio <MathTex math={"t"} />] → Node <MathTex math={"m"} /> → [Impedance <MathTex math={"z_k"} />] → Bus <MathTex math={"j"} /></p>
                <p className="text-sm">
                    Where node <MathTex math={"m"} /> is the internal (fictitious) node between the ideal transformer and the leakage impedance.
                </p>
            </div>

            <h3>Step 3: Deriving the Nodal Equations</h3>
            <p>
                From the circuit, the current flowing from node <MathTex math={"m"} /> to bus <MathTex math={"j"} /> through <MathTex math={"y_k"} /> is:
            </p>
            <MathTex block math="I_j = y_k (V_m - V_j)" />
            <p>Since <MathTex math={"V_m = V_i / t"} /> from the ideal transformer equation:</p>
            <MathTex block math="I_j = y_k \left( \frac{V_i}{t} - V_j \right) = \frac{y_k}{t} V_i - y_k V_j" />
            <p>From the power conservation condition <MathTex math={"t^* I_i + I_j = 0"} />, we get <MathTex math={"I_i = -I_j / t^*"} />:</p>
            <MathTex block math="I_i = -\frac{1}{t^*} \left[ \frac{y_k}{t} V_i - y_k V_j \right] = -\frac{y_k}{|t|^2} V_i + \frac{y_k}{t^*} V_j" />

            <h3>Step 4: The Y-Bus Sub-Matrix</h3>
            <p>Assembling the two current equations into matrix form yields the <strong>2×2 Y-Bus sub-matrix</strong> for a branch with a tap-changing transformer:</p>

            <div className="bg-slate-50 dark:bg-slate-900 border border-border p-6 rounded-lg my-6">
                <MathTex block math={'\\begin{bmatrix} I_i \\\\ I_j \\end{bmatrix} = \\begin{bmatrix} \\frac{y_k}{|t|^2} & -\\frac{y_k}{t^*} \\\\ -\\frac{y_k}{t} & y_k \\end{bmatrix} \\begin{bmatrix} V_i \\\\ V_j \\end{bmatrix}'} />
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-800 p-4 rounded-lg my-4">
                <h4 className="mt-0 text-orange-700 dark:text-orange-400">⚠ Key Observation: Non-Symmetry</h4>
                <p className="mb-0 text-sm">
                    Notice that <MathTex math={"Y_{ij} = -y_k/t^*"} /> while <MathTex math={"Y_{ji} = -y_k/t"} />. Since <MathTex math={"t^* \\neq t"} /> in general (when <MathTex math={"t"} /> is complex), the Y-Bus becomes <strong>non-symmetric</strong> when phase-shifting transformers are present. For purely real tap ratios (no phase shift), <MathTex math={"t = t^*"} /> and this simplifies to:
                </p>
            </div>

            <MathTex block math={'\\begin{bmatrix} Y_{ii} & Y_{ij} \\\\ Y_{ji} & Y_{jj} \\end{bmatrix} = \\begin{bmatrix} \\frac{y_k}{t^2} & -\\frac{y_k}{t} \\\\ -\\frac{y_k}{t} & y_k \\end{bmatrix}'} />

            <h3>Step 5: Worked Numerical Example</h3>
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-300 dark:border-green-800 p-4 rounded-lg my-4">
                <h4 className="mt-0 text-green-700 dark:text-green-400">Example: 2-Bus System with Transformer</h4>
                <p className="text-sm">
                    <strong>Given:</strong> A transformer connects Bus 1 to Bus 2 with leakage impedance <MathTex math={"z_k = j0.1"} /> p.u. and off-nominal tap ratio <MathTex math={"t = 1.05"} />.
                </p>
                <p className="text-sm"><strong>Solution:</strong></p>
                <p className="text-sm">The series admittance: <MathTex math={"y_k = 1/j0.1 = -j10"} /> p.u.</p>
                <div className="my-2">
                    <MathTex block math="Y_{11} = \frac{y_k}{t^2} = \frac{-j10}{1.05^2} = \frac{-j10}{1.1025} = -j9.070" />
                    <MathTex block math="Y_{12} = Y_{21} = -\frac{y_k}{t} = -\frac{-j10}{1.05} = j9.524" />
                    <MathTex block math="Y_{22} = y_k = -j10" />
                </div>
                <p className="text-sm mt-2">
                    <strong>Compare with no transformer (<MathTex math={"t=1.0"} />):</strong> <MathTex math={"Y_{11} = Y_{22} = -j10"} />, <MathTex math={"Y_{12} = Y_{21} = j10"} />. The transformer shifts the diagonal and off-diagonal values asymmetrically.
                </p>
            </div>

            <h3>Step 6: Effect on a Full Y-Bus Matrix</h3>
            <p>
                When adding a transformer to an existing network, only the four Y-Bus elements corresponding to the two connected buses (<MathTex math={"i"} /> and <MathTex math={"j"} />) are modified. The rest of the matrix remains unchanged:
            </p>
            <ul>
                <li><MathTex math={"Y_{ii}"} /> gets <MathTex math={"+ y_k/t^2"} /> added to it (instead of <MathTex math={"+ y_k"} />)</li>
                <li><MathTex math={"Y_{jj}"} /> gets <MathTex math={"+ y_k"} /> added to it (unchanged)</li>
                <li><MathTex math={"Y_{ij}"} /> gets <MathTex math={"- y_k/t"} /> added (instead of <MathTex math={"- y_k"} />)</li>
                <li><MathTex math={"Y_{ji}"} /> gets <MathTex math={"- y_k/t"} /> added (same as <MathTex math={"Y_{ij}"} /> for real taps)</li>
            </ul>

            <h3>On-Load Tap Changer (OLTC) Control</h3>
            <p>
                To solve a load flow problem containing an OLTC, the turns ratio <MathTex math={"t"} /> is treated as an additional state variable. The iterative procedure becomes:
            </p>
            <ol>
                <li>Solve the load flow with the current tap setting</li>
                <li>Check if the regulated bus voltage is within limits</li>
                <li>If not, adjust <MathTex math={"t"} /> by one tap step and re-form the affected Y-Bus entries</li>
                <li>Repeat until the voltage is within tolerance or the tap hits its physical limit</li>
            </ol>
        </div>
    );
};

export default StaticModelingContent;
