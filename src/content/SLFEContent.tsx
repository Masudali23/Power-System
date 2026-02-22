import React from 'react';
import { MathTex } from '../components/MathTex';

const SLFEContent: React.FC = () => {
    return (
        <div className="prose prose-slate max-w-none dark:prose-invert lg:prose-lg">
            <h1 id="slfe-equations">Static Load Flow Equations (SLFE)</h1>
            <p>
                The core objective of load flow studies is the precise determination of the steady-state complex voltages (magnitude and phase angle) at every bus in the network under a pre-specified configuration of generation and demand.
                Calculated voltages are subsequently utilized to determine real and reactive power flows, calculate transmission losses, and determine the slack generator's output.
            </p>

            <h2>Derivation of the SLFE</h2>
            <p>
                The foundational SLFE is derived from the net complex power injection at bus <MathTex math={"i"} />.
            </p>
            <MathTex block math="S_i^* = P_i - jQ_i = V_i^* I_i = V_i^* \sum_{j=1}^{n} Y_{ij} V_j" />

            <p>
                For an <MathTex math={"n"} />-bus system, this yields <MathTex math={"n"} /> non-linear complex algebraic equations, but <MathTex math={"2n"} /> unknown real variables.
                To enable a deterministic mathematical solution, the equations must be decomposed into real power (<MathTex math={"P"} />) and reactive power (<MathTex math={"Q"} />) forms.
            </p>

            <h3>Real Polar Form</h3>
            <p>
                Substituting the polar representations of voltage (<MathTex math={"V_i = |V_i| \\angle \\delta_i"} />) and admittance (<MathTex math={"Y_{ij} = |Y_{ij}| \\angle \\theta_{ij}"} />) yields:
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 border border-border p-4 rounded-lg my-4 overflow-x-auto">
                <MathTex block math="P_i = P_{Gi} - P_{Di} = \sum_{j=1}^{n} |V_i| |V_j| |Y_{ij}| \cos(\delta_i - \delta_j - \theta_{ij})" />
                <MathTex block math="Q_i = Q_{Gi} - Q_{Di} = \sum_{j=1}^{n} |V_i| |V_j| |Y_{ij}| \sin(\delta_i - \delta_j - \theta_{ij})" />
            </div>

            <hr />

            <h2 id="slfe-buses">Classification of Network Buses</h2>
            <p>
                To equal the number of equations with the number of unknown state variables, network buses are universally categorized into three distinct types:
            </p>

            <div className="space-y-4">
                <div className="border border-border p-4 rounded-lg">
                    <h3 className="mt-0 text-primary">1. Load Bus (P-Q Bus)</h3>
                    <p className="mb-0">
                        Encompass the vast majority of network nodes where there is no active generation.
                        <strong>Knowns:</strong> <MathTex math={"P_i, Q_i"} />. <br />
                        <strong>Unknowns:</strong> <MathTex math={"|V_i|, \\delta_i"} />.
                    </p>
                </div>

                <div className="border border-border p-4 rounded-lg">
                    <h3 className="mt-0 text-primary">2. Voltage Controlled Bus (P-V Bus)</h3>
                    <p className="mb-0">
                        Buses connected to active synchronous generators containing Automatic Voltage Regulators (AVR).
                        <strong>Knowns:</strong> <MathTex math={"P_i, |V_i|"} />. <br />
                        <strong>Unknowns:</strong> <MathTex math={"Q_i, \\delta_i"} />.
                    </p>
                </div>

                <div className="border border-border p-4 rounded-lg">
                    <h3 className="mt-0 text-primary">3. Slack Bus (Swing/Reference Bus)</h3>
                    <p className="mb-0">
                        One massive generator designated to absorb the network <MathTex math={"I^2R"} /> and <MathTex math={"I^2X"} /> losses since exact system losses are fundamentally unknown prior to solution.
                        <strong>Knowns:</strong> <MathTex math={"|V_1|, \\delta_1 = 0^\\circ"} />. <br />
                        <strong>Unknowns:</strong> <MathTex math={"P_{G1}, Q_{G1}"} />.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SLFEContent;
