import React from 'react';
import { MathTex } from '../components/MathTex';

const NewtonRaphsonContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="newton-raphson-polar">Newton-Raphson Load Flow Method</h1>

            <p>
                The Newton-Raphson (N-R) technique is the gold standard for power system operational analysis due to its formidable robustness and convergence speed.
                It involves a first-order Taylor series expansion of the highly non-linear SLFE into a strict linear approximation:
            </p>
            <MathTex block math="\Delta Y \approx [J] \Delta X \implies \Delta X = [J]^{-1} \Delta Y" />
            <p>
                Here, <MathTex math={"[J]"} /> represents the dense <strong>Jacobian matrix</strong>, <MathTex math={"\\Delta Y"} /> represents the real/reactive power mismatches, and <MathTex math={"\\Delta X"} /> represents the state variable update vectors (<MathTex math={"\\Delta \\delta, \\Delta |V|"} />).
            </p>

            <h2>Polar Formulation Algorithm</h2>
            <ol>
                <li><strong>Initialization:</strong> Form <MathTex math={"Y_{BUS}"} /> and apply flat start conditions.</li>
                <li><strong>Mismatch Calculation:</strong> Compute active (<MathTex math={"P_i^{cal}"} />) and reactive (<MathTex math={"Q_i^{cal}"} />) power using current state variables. Evaluate scheduled mismatches:
                    <MathTex block math="\Delta P_i^{(k)} = P_i^{sp} - P_i^{cal}" />
                    <MathTex block math="\Delta Q_i^{(k)} = Q_i^{sp} - Q_i^{cal}" />
                </li>
                <li><strong>Jacobian Assembly:</strong> The highly dynamic Jacobian matrix determines parameter sensitivities:
                    <div className="my-4 overflow-x-auto bg-slate-50 dark:bg-slate-900 p-4 rounded border">
                        <MathTex block math="\begin{bmatrix} \Delta P \\ \Delta Q \end{bmatrix} = \begin{bmatrix} H & L \\ M & N \end{bmatrix} \begin{bmatrix} \Delta \delta \\ \Delta |V| \end{bmatrix}" />
                    </div>
                    Where sub-matrices <MathTex math={"H, L, M, N"} /> contain partial derivatives like <MathTex math={"H_{in} = \\frac{\\partial P_i}{\\partial \\delta_n}"} />.
                </li>
                <li><strong>Linear System Solution:</strong> The linear equation is solved via matrix factorization (Gaussian Elimination/LDU) avoiding direct inversion to preserve sparsity.</li>
                <li><strong>State Update:</strong>
                    <MathTex block math="\delta_i^{(k+1)} = \delta_i^{(k)} + \Delta \delta_i^{(k)}" />
                    <MathTex block math="|V_i|^{(k+1)} = |V_i|^{(k)} + \Delta |V_i|^{(k)}" />
                </li>
            </ol>

            <hr />

            <h2 id="newton-raphson-rect">Rectangular Formulation</h2>
            <p>
                Alternatively, the rectangular formulation uses Cartesian coordinates (<MathTex math={"V_i = e_i + jf_i"} />).
                Instead of modifying the matrix dimensions when a P-V bus hits a limit, the <MathTex math={"\\Delta Q"} /> and <MathTex math={"\\Delta V^2"} /> equations are seamlessly swapped.
            </p>
            <MathTex block math="\begin{bmatrix} \Delta P \\ \Delta Q \\ \Delta V^2 \end{bmatrix} = \begin{bmatrix} \frac{\partial P}{\partial e} & \frac{\partial P}{\partial f} \\ \frac{\partial Q}{\partial e} & \frac{\partial Q}{\partial f} \\ \frac{\partial V^2}{\partial e} & \frac{\partial V^2}{\partial f} \end{bmatrix} \begin{bmatrix} \Delta e \\ \Delta f \end{bmatrix}" />
            <p>
                Because computers natively execute arithmetic in rectangular components without requiring processor-heavy trigonometric functions (sines and cosines), this formulation can theoretically offer faster raw computation times per iteration.
            </p>

            <h3>Evaluation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 rounded">
                    <h4 className="text-green-700 dark:text-green-400 mt-0">Advantages</h4>
                    <ul className="text-sm">
                        <li><strong>Quadratic Convergence:</strong> Reaches tight tolerances rapidly.</li>
                        <li><strong>Scale Invariance:</strong> Solves massive systems in exactly 2 to 6 iterations regardless of size.</li>
                        <li><strong>Reliability:</strong> Robust in extreme loops and ill-conditioned systems.</li>
                    </ul>
                </div>
                <div className="border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-4 rounded">
                    <h4 className="text-red-700 dark:text-red-400 mt-0">Disadvantages</h4>
                    <ul className="text-sm">
                        <li><strong>Computation per iteration:</strong> The Jacobian must be completely re-evaluated and factorized at each step.</li>
                        <li><strong>Memory bound:</strong> Deep matrix operations consume excessive RAM.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NewtonRaphsonContent;
