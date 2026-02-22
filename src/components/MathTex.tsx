import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTexProps {
    math: string;
    block?: boolean;
}

export const MathTex: React.FC<MathTexProps> = ({ math, block = false }) => {
    return block ? <BlockMath math={math} /> : <InlineMath math={math} />;
};
