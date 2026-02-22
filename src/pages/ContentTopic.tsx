import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import IntroContent from '../content/IntroContent';
import StaticModelingContent from '../content/StaticModelingContent';

import SLFEContent from '../content/SLFEContent';
import GaussSeidelContent from '../content/GaussSeidelContent';
import NewtonRaphsonContent from '../content/NewtonRaphsonContent';
import DecoupledContent from '../content/DecoupledContent';
import DCLCFContent from '../content/DCLCFContent';
import DirectSolnContent from '../content/DirectSolnContent';

import html2pdf from 'html2pdf.js';

const ContentTopic: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const { hash } = useLocation();

    const handleDownloadPDF = () => {
        const element = document.getElementById('printable-content');
        if (!element) return;
        const opt = {
            margin: 10,
            filename: `${topicId}-notes.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        html2pdf().set(opt).from(element).save();
    };

    useEffect(() => {
        if (hash) {
            setTimeout(() => {
                const element = document.getElementById(hash.replace('#', ''));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [topicId, hash]);

    const renderContent = () => {
        switch (topicId) {
            case 'intro':
                return <IntroContent />;
            case 'static-modeling':
                return <StaticModelingContent />;
            case 'slfe':
                return <SLFEContent />;
            case 'gauss-seidel':
                return <GaussSeidelContent />;
            case 'newton-raphson':
                return <NewtonRaphsonContent />;
            case 'decoupled':
                return <DecoupledContent />;
            case 'dc-load-flow':
                return <DCLCFContent />;
            case 'direct-solution':
                return <DirectSolnContent />;
            default:
                return (
                    <div className="p-8 text-center text-muted-foreground">
                        <h2 className="text-xl font-semibold mb-2">Topic Not Found</h2>
                        <p>Select a topic from the left navigation.</p>
                    </div>
                );
        }
    };

    return (
        <div className="p-8 lg:p-12 pb-24 relative">
            <div className="absolute top-4 right-8 z-10">
                <button onClick={handleDownloadPDF} className="bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-700 transition flex items-center gap-2 shadow opacity-90 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export Notes to PDF
                </button>
            </div>
            <div id="printable-content" className="bg-white dark:bg-zinc-950">
                {renderContent()}
            </div>
        </div>
    );
};

export default ContentTopic;
