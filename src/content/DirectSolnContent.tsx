import React from 'react';
import { MathTex } from '../components/MathTex';

const DirectSolnContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="direct-ldu">Direct Solution Methodologies (Gauss & LDU)</h1>

            <p>
                Explicitly calculating the full mathematical inverse of the Jacobian or Susceptance coefficient matrix (<MathTex math={"[A]^{-1}"} />) is an algorithmic catastrophe for large power systems.
                Inversion requires <MathTex math={"O(n^3)"} /> operations and entirely destroys the hard-won sparsity of the matrices.
                Consequently, load flow algorithms rely exclusively on highly optimized direct factorization methodologies.
            </p>

            <h2>The Gauss Elimination Method</h2>
            <p>
                Transforms the square coefficient matrix <MathTex math={"[A]"} /> into an equivalent upper triangular form.
            </p>
            <ol>
                <li>
                    <strong>Forward Elimination:</strong> Systematically reduces all elements below the principal diagonal to exactly zero.
                    A specific mathematical multiplier (<MathTex math={"a_{rj}^{j - 1} / a_{jj}"} />) is calculated to scale and subtract rows.
                    <MathTex block math="R_r^{j} = R_r^{j-1} - a_{rj}^{j-1} R_j^j" />
                </li>
                <li>
                    <strong>Backward Substitution:</strong> Steps backward up the matrix ladder, substituting newly known variables sequentially until the entire state vector <MathTex math={"\\Delta X"} /> is resolved.
                </li>
            </ol>

            <hr />

            <h2 id="direct-ordering">LDU Matrix Decomposition</h2>
            <p>
                In highly iterative processes like the Fast Decoupled Load Flow, the coefficient matrix (<MathTex math={"B'"} /> or <MathTex math={"B''"} />) remains entirely constant, while the mismatch vector <MathTex math={"\\Delta P"} /> or <MathTex math={"\\Delta Q"} /> fluctuates.
                LDU decomposition executes the heavy lifting of Gauss Elimination only once, mathematically recording the exact multipliers used.
            </p>
            <MathTex block math="[A] = [L][D][U]" />

            <ul>
                <li><strong><MathTex math={"[L]"} /> (Lower Triangular):</strong> Off-diagonal elements mirror the exact mathematical multipliers (<MathTex math={"l_{ij}"} />) utilized during forward elimination.</li>
                <li><strong><MathTex math={"[D]"} /> (Diagonal):</strong> Comprises strictly the reciprocal values of the final modified diagonal pivot elements (<MathTex math={"1/a_{ii}"} />).</li>
                <li><strong><MathTex math={"[U]"} /> (Upper Triangular):</strong> Contains ones on the principal diagonal, with the remaining coefficients identical to the finalized Gauss elimination matrix.</li>
            </ul>

            <h3>Dual Sweeping Substitutions</h3>
            <p>To solve for new mismatches, two sweeping substitutions are executed iteratively:</p>
            <ol>
                <li><strong>Forward sweep:</strong> Resolve intermediate vector <MathTex math={"y"} />: <MathTex math={"[L] y = \\Delta S_{new}"} /></li>
                <li><strong>Scale:</strong> Scale by diagonal reciprocals in <MathTex math={"[D]"} />.</li>
                <li><strong>Backward sweep:</strong> Resolve update vector <MathTex math={"\\Delta X"} />: <MathTex math={"[U] \\Delta X = y_{scaled}"} /></li>
            </ol>

            <hr />

            <h2>Optimal Nodal Ordering Schemes</h2>
            <p>
                A paramount operational challenge during forward elimination is the insidious generation of <strong>new fill-ins</strong> (transforming a structural zero into a non-zero element). This ruins sparsity. To strictly minimize this, mathematical nodes/rows are systematically reordered:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded">
                    <h4 className="mt-0">Scheme 1 (Static)</h4>
                    <p className="text-sm mb-0">Ranks rows entirely strictly by static connectivity (minimum non-zero terms first). Exceptionally fast but mathematically blind to dynamic fill-ins.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded border-primary ring-1 ring-primary/20">
                    <h4 className="mt-0 text-primary">Scheme 2 (Dynamic Preferred)</h4>
                    <p className="text-sm mb-0">Dynamically simulates elimination. At every stage, the row exhibiting the minimum non-zero terms is selected as the next active pivot.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded">
                    <h4 className="mt-0">Scheme 3 (Rigorous)</h4>
                    <p className="text-sm mb-0">Rigorously analyzes the exact mathematical consequences and prioritizes the row that explicitly minimizes new fill-ins. Immense computational overhead.</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded">
                    <h4 className="mt-0">Scheme 4 (Hybrid)</h4>
                    <p className="text-sm mb-0">Primarily defaults to Scheme 2. When a tie occurs, falls back to the rigorous analysis of Scheme 3 to break the deadlock.</p>
                </div>
            </div>
        </div>
    );
};

export default DirectSolnContent;
