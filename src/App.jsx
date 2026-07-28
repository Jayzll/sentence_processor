import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// import Images
import animatedBefore from './image/before.png';
import animatedAfter from './image/after.png';
import inanimateBefore from './image/inanimate_before.png';
import inanimateAfter from './image/inanimate_after.png';

// The two experimental conditions based on Trueswell et al. (1994)
const EXPERIMENTS = {
    animate: {
        id: 'animate',
        label: 'Condition A: Animate Noun',
        sentence: ["The defendant", "examined", "by the lawyer", "turned out", "to be unreliable."],
        // High cognitive reading time spike on "by the lawyer" (Garden Path disambiguation effect)
        loads: [100, 170, 220, 140, 130], 
        explanation: "The noun 'defendant' is animate. The Constraint Satisfaction model dictates that the brain immediately assigns 'defendant' as the agent (the one doing the examining). When the phrase 'by the lawyer' appears, this structural assumption collapses, triggering a massive reading time slowdown as the brain is forced to rebuild the syntactic tree as a passive sentence."
    },
    inanimate: {
        id: 'inanimate',
        label: 'Condition B: Inanimate Noun',
        sentence: ["The evidence", "examined", "by the lawyer", "turned out", "to be unreliable."],
        // Smooth reading time profile because animacy constraint prevents the garden path
        loads: [60, 90, 70, 65, 60],
        explanation: "The noun 'evidence' is inanimate. Because 'evidence' cannot physically examine anything, the animacy cue instantly constrains the brain to build a passive syntactic tree. When the phrase 'by the lawyer' appears, it perfectly matches the brain's expectation, resulting in smooth processing with no Garden Path crash."
    }
};

export default function App() {
    const [condition, setCondition] = useState('animate');
    const [wordIndex, setWordIndex] = useState(-1);
    const [graphData, setGraphData] = useState([]);

    const currentExp = EXPERIMENTS[condition];

    // Reset the experiment when condition changes
    useEffect(() => {
        setWordIndex(-1);
        setGraphData([]);
    }, [condition]);

    const handleNextWord = useCallback(() => {
        if (wordIndex < currentExp.sentence.length - 1) {
            const nextIndex = wordIndex + 1;
            setWordIndex(nextIndex);
            
            // Add new data point to the graph
            const newPoint = {
                word: currentExp.sentence[nextIndex],
                load: currentExp.loads[nextIndex],
                index: nextIndex
            };
            setGraphData(prev => [...prev, newPoint]);
        }
    }, [wordIndex, currentExp]);

    // Spacebar event listener for self-paced reading
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent page scroll
                handleNextWord();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNextWord]);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 font-sans p-8 flex justify-center w-full">
            <div className="flex flex-col gap-8 w-full max-w-5xl">
                
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold !text-cyan-400">Constraint Satisfaction Model</h1>
                    <p className="text-slate-400">Modeling how noun animacy cues prevent Garden Path sentences in real-time comprehension.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                    <button 
                        onClick={() => setCondition('animate')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${condition === 'animate' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        Run Condition A (Animate)
                    </button>
                    <button 
                        onClick={() => setCondition('inanimate')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${condition === 'inanimate' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.5)]' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        Run Condition B (Inanimate)
                    </button>
                </div>

                {/* Main Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Reading Task & Graph */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Self-Paced Reading Display */}
                        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg min-h-[200px] flex flex-col items-center justify-center">
                            <div className="text-sm text-slate-400 mb-6 uppercase tracking-wider font-semibold">Self-Paced Reading Task (Press Spacebar)</div>
                            <div className="flex flex-wrap justify-center gap-3 text-3xl font-serif">
                                {currentExp.sentence.map((word, i) => {
                                    const isRevealed = i <= wordIndex;
                                    const isSpike = isRevealed && currentExp.loads[i] > 200;
                                    
                                    // Mask the word with underscores if not revealed
                                    const displayWord = isRevealed ? word : word.replace(/./g, '_');
                                    
                                    // Dynamic Tailwind classes for the words
                                    let wordClasses = "text-slate-700 border-b-2 border-slate-700"; 
                                    if (isSpike) {
                                        wordClasses = "text-red-500 font-bold drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"; 
                                    } else if (isRevealed) {
                                        wordClasses = "text-slate-200 border-b-2 border-transparent transition-all duration-200"; 
                                    }

                                    return (
                                        <span key={i} className={wordClasses}>
                                            {displayWord}
                                        </span>
                                    );
                                })}
                            </div>
                            {wordIndex < currentExp.sentence.length - 1 && (
                                <button onClick={handleNextWord} className="mt-8 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 text-sm lg:hidden">
                                    Tap to Reveal Next Word
                                </button>
                            )}
                        </div>

                        {/* Cognitive Load Graph */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg h-[400px]">
                            <h3 className="text-slate-300 font-semibold mb-4 text-center">Real-Time Cognitive Processing Load (Simulated Reading Times)</h3>
                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    {/* FIXED: left margin set to 50 for full Y-axis text clearance */}
                                    <LineChart data={graphData} margin={{ top: 20, right: 30, left: 50, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis 
                                            dataKey="word" 
                                            stroke="#94a3b8" 
                                            tick={{fill: '#94a3b8', fontSize: 14}}
                                        />
                                        {/* FIXED: Y-axis label text positioning */}
                                        <YAxis 
                                            stroke="#94a3b8" 
                                            domain={[0, 300]} 
                                            label={{ 
                                                value: 'Reading times in ms', 
                                                angle: -90, 
                                                position: 'insideLeft', 
                                                fill: '#94a3b8',
                                                style: { textAnchor: 'middle' },
                                                dx: -10
                                            }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                                            itemStyle={{ color: '#38bdf8' }}
                                        />
                                        {/* Highlight the critical region */}
                                        <ReferenceLine x="by the lawyer" stroke="#64748b" strokeDasharray="3 3" label={{ position: 'top', value: 'Disambiguation Point', fill: '#94a3b8', fontSize: 12 }} />
                                        <Line 
                                            type="monotone" 
                                            dataKey="load" 
                                            stroke={condition === 'animate' ? '#ef4444' : '#10b981'} 
                                            strokeWidth={4} 
                                            dot={{ r: 6, fill: '#0f172a', strokeWidth: 2 }}
                                            activeDot={{ r: 8 }}
                                            animationDuration={300}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <h3 className="text-slate-300 text-sm font-semibold mb-4 text-center">Figure 1: Mean second pass reading times in ms for sentences with ambiguous verbs.</h3>
                        </div>
                    </div>

                    {/* Right Column: Academic Context */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-6">
                        <h4 className="text-slate-400 font-semibold uppercase tracking-wider">
                            Predicted Mental Scenario
                        </h4>
                        
                        {condition === 'animate' ? (
                            wordIndex < 2 ? (
                            <div className="text-yellow-400 text-sm flex flex-col">
                                🔍 <strong>Active Mental Model:</strong>
                                <p className="mt-1 text-slate-300">
                                The brain pictures the <em>defendant examining</em> a document/crime scene.
                                </p>
                                <img src={animatedBefore} alt="Defendant examining" className="mt-2 w-full rounded" />
                            </div>
                            ) : (
                            <div className="text-red-400 text-sm flex flex-col">
                                💥 <strong>Expectancy Violation:</strong>
                                <p className="mt-1 text-slate-300">
                                The word "by" forces a role swap! The defendant is the <em>target</em>, and the lawyer is the examiner.
                                </p>
                                <img src={animatedAfter} alt="Lawyer examining" className="mt-2 w-full rounded" />
                                <div className="mt-6 bg-red-900/20 border border-red-500/50 p-4 rounded-lg animate-pulse">
                                    <div className="text-red-400 font-bold mb-1">⚠️</div>
                                    <div className="text-red-200 text-xs">The brain is re-evaluating the thematic roles of the sentence.</div>
                                </div>
                            </div>
                            )
                        ) : ( 
                            wordIndex < 2 ? (
                            <div className="text-cyan-400 text-sm flex flex-col">
                                📄 <strong>Passive Mental Model:</strong>
                                <p className="mt-1 text-slate-300">
                                Since evidence cannot examine, the brain pictures <em>evidence sitting on a desk waiting to be examined</em>.
                                </p>
                                <img src={inanimateBefore} alt="Evidence on desk" className="mt-2 w-full rounded" />
                            </div>
                            ) : (
                            <div className="text-emerald-400 text-sm flex flex-col">
                                ✅ <strong>Seamless Integration:</strong>
                                <p className="mt-1 text-slate-300">
                                The word "by" introduces the expected lawyer to examine the evidence. No mental re-framing required!
                                </p>
                                <img src={inanimateAfter} alt="Lawyer examining evidence" className="mt-2 w-full rounded" />
                                <div className="mt-6 bg-emerald-900/20 border border-emerald-500/50 p-4 rounded-lg">
                                    <div className="text-emerald-400 font-bold mb-1">✅</div>
                                    <div className="text-emerald-200 text-xs">Animacy cue successfully constrained the syntactic tree. No re-analysis required.</div>
                                </div>
                            </div>
                            )
                        )}
                    </div>

                    {/* Research */}
                    <div className="lg:col-span-3 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-200 mb-2">Results and Conclusion</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {currentExp.explanation}
                            </p>
                        </div>
                        
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex flex-col gap-4">
                            <h3 className="text-lg font-semibold text-slate-400 uppercase mb-2">Original Study: Trueswell, Tanenhaus, & Garnsey (1994)</h3>
                            <div className="w-24 h-1 bg-cyan-500 rounded mb-4 mx-auto"></div>
                            
                            <p className="text-base text-left">
                                Before this study, the dominant theory was Lynn Frazier's <strong>Garden Path Model</strong>. It claims the brain is modular, like a "syntax parser" that constructs the simplest possible grammatical tree. The brain would completely ignore word meanings until after the grammatical structure is built.
                            </p>
                            
                            <p className="text-base text-left">
                                Trueswell, Tanenhaus, & Garnsey challenged this theory and proposed the Constraint Satisfaction Model. They argued that the brain is an interactive network that processes multiple sources of information simultaneously to resolve ambiguities.
                            </p>
                            
                            <p className="text-base text-left my-6 text-slate-200">
                                <strong>Aim: </strong>To investigate whether word meaning (semantics) can immediately guide how the brain parses sentence structure, or if the brain relies strictly on syntax first (the <em>Garden Path Model</em>).
                            </p>
                            
                            <p className="text-base text-left space-y-2">
                                <strong>Method: </strong>The original study used <strong>Eye-Tracking</strong> methodology to observe participants' reading patterns and reanalysis processes, millisecond by millisecond.
                            </p>
                            
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-4">
                                Experimental Conditions Compared
                            </h4>
                            
                            <p className="text-xs font-semibold text-slate-400 tracking-wider">
                                Example stimuli from experiment
                            </p>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs text-slate-300">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Verb type</th>
                                            <th className="py-2.5 px-3">Noun type</th>
                                            <th className="py-2.5 px-3">Clause type</th>
                                            <th className="py-2.5 px-3">Example</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        <tr>
                                            <td rowSpan={4} className="py-2.5 px-3 font-semibold text-cyan-400 align-top border-r border-slate-800">
                                                Ambiguous
                                            </td>
                                            <td rowSpan={2} className="py-2.5 px-3 font-medium align-top border-r border-slate-800">
                                                Animate
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400">Reduced</td>
                                            <td className="py-2.5 px-3 italic">
                                                The defendant examined by the lawyer turned out to be unreliable.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 px-3 text-slate-400">Unreduced</td>
                                            <td className="py-2.5 px-3 italic">
                                                The defendant that was examined by the lawyer turned out to be unreliable.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td rowSpan={2} className="py-2.5 px-3 font-medium align-top border-r border-slate-800">
                                                Inanimate
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400">Reduced</td>
                                            <td className="py-2.5 px-3 italic">
                                                The evidence examined by the lawyer turned out to be unreliable.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="py-2.5 px-3 text-slate-400">Unreduced</td>
                                            <td className="py-2.5 px-3 italic">
                                                The evidence that was examined by the lawyer turned out to be unreliable.
                                            </td>
                                        </tr> 
                                    </tbody>
                                </table>
                                
                                <p className="text-base text-left space-y-2 mt-4">
                                    <strong>Original Study Conclusion: </strong>The human language processing system is constraint-based and interactive, meaning semantic information such as animacy is used immediately to guide syntactic choices rather than in a separate, later stage.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reference Card */}
                    <div className="lg:col-span-3 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col gap-3">
                        <p className="font-semibold text-slate-300 uppercase tracking-wider text-xs">Reference (APA):</p>
                        <p className="pl-6 -indent-6 leading-relaxed text-sm text-slate-300">
                            Trueswell, J. C., Tanenhaus, M. K., & Garnsey, S. M. (1994). Semantic influences on parsing: Use of thematic role information in syntactic ambiguity resolution. <span className="italic">Journal of Memory and Language</span>, <span className="italic">33</span>(3), 285–318.{' '}
                            <a href="https://doi.org/10.1006/jmla.1994.1014" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                https://doi.org/10.1006/jmla.1994.1014
                            </a>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Direct PDF Access:{' '}
                            <a href="https://web.stanford.edu/class/psych205/papers/TrueswellTanenhausGarnsey94.pdf" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">
                                Stanford University Class Repository
                            </a>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}