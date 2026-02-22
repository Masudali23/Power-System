import React from 'react';
import { MathTex } from '../components/MathTex';

const DCLCFContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="dc-load-flow-linear">DC Load Flow Method & Linear Sensitivities</h1>

            <p>
                For control center operations requiring real-time security monitoring, grid operators execute <strong>Contingency Analysis</strong> (<MathTex math={"N-1"} /> security).
                Assessing thousands of hypothetical outages utilizing standard non-linear AC load flows would require unacceptable processing times.
                The DC Load Flow sacrifices extreme accuracy to achieve an <strong>absolutely convergent, instantaneous linear mathematical solution</strong>.
            </p>

            <h2>Aggressive Simplifications</h2>
            <ol>
                <li>Voltage magnitudes at every single bus are assumed to be exactly <MathTex math={"1.0"} /> p.u.</li>
                <li>Line resistances (<MathTex math={"R"} />) are completely ignored; lines are modeled purely as inductive reactance (<MathTex math={"X"} />).</li>
                <li>All shunt reactances to ground are explicitly neglected.</li>
                <li>Off-nominal transformer tap settings are ignored.</li>
                <li>The phase angle difference is assumed to be small (<MathTex math={"\\sin(\\delta_{ij}) \\approx \\delta_{ij}"} /> in radians).</li>
            </ol>

            <p>
                Applying these rigid constraints collapses the standard non-linear active power equation into a basic linear algebraic relation:
            </p>
            <MathTex block math="P_i = P_{Gi} - P_{Di} = \sum_{j=1}^{n} \frac{1}{X_{ij}} (\delta_i - \delta_j)" />

            <p>
                In matrix topology (excluding the slack bus):
            </p>
            <MathTex block math="[P] = [B_{DC}][\delta] \implies [\delta] = [X_{DC}][P]" />

            <hr />

            <h2 id="dc-load-flow-lodf">Contingency Modifications: PTDF and LODF</h2>
            <p>
                While solving DC load flow is exceedingly rapid, the grid topology must continually be mathematically rebuilt for thousands of hypothetical <MathTex math={"N-1"} /> outages.
                To circumvent this, operators utilize linear sensitivity matrices derived directly from the formulation.
            </p>

            <div className="space-y-6 mt-6">
                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-5 rounded-lg">
                    <h3 className="mt-0 text-primary flex items-center gap-2">Power Transfer Distribution Factors (PTDF)</h3>
                    <p className="mb-0 text-sm">
                        Also known as <i>Injection Shift Factors (ISF)</i>, PTDFs represent the linear sensitivity of active power flow on a specific transmission line to an incremental shift in generation from bus <MathTex math={"i"} /> to bus <MathTex math={"j"} />.
                        It allows real-time verification of whether a proposed commercial power transaction will violate thermal line limits without running a full load flow.
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-border p-5 rounded-lg">
                    <h3 className="mt-0 text-primary flex items-center gap-2">Line Outage Distribution Factors (LODF)</h3>
                    <p className="mb-0 text-sm">
                        LODFs are utilized to instantaneously predict the post-contingency power flow on a monitored transmission line following the sudden disconnection of a different transmission line.
                        By applying LODFs through simple scalar multiplication arrays, thousands of <MathTex math={"N-1"} /> line outages are evaluated in fractions of a second, entirely bypassing matrix inversion.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DCLCFContent;
