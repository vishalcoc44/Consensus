import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiDownload, FiInfo, FiChevronDown } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import './../styles/Analytics.css';

// --- MOCK PLACEHOLDERS for features requiring a dedicated AI backend --- //
const MOCK_FILE_INSIGHTS = [
    "Insight from a PDF document will be shown here.",
    "Data extracted from a CSV will appear in this section.",
];
const MOCK_KEY_THEMES = [
    { topic: 'simulated-topic-1', color: '#8B5CF6' },
    { topic: 'simulated-topic-2', color: '#3B82F6' },
    { topic: 'simulated-topic-3', color: '#10B981' },
];
const SENTIMENT_COLORS = ['#10B981', '#F59E0B', '#F43F5E'];


interface Decision {
    id: string;
    title: string;
    decision_options: {id: string, option_text: string}[];
}

// --- Keyword-based sentiment simulation --- //
const getSentimentScore = (comment: string): { score: number, type: 'Positive' | 'Negative' | 'Neutral' } => {
    const positiveKeywords = ['good', 'great', 'love', 'excellent', 'agree', 'support', 'best', 'ideal'];
    const negativeKeywords = ['bad', 'terrible', 'hate', 'disagree', 'against', 'worst', 'problem'];
    
    comment = comment.toLowerCase();
    let score = 50; // Neutral baseline
    let type: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';

    if (positiveKeywords.some(kw => comment.includes(kw))) {
        score = 85;
        type = 'Positive';
    }
    if (negativeKeywords.some(kw => comment.includes(kw))) {
        score = 15;
        type = 'Negative';
    }

    return { score, type };
};


const Analytics = () => {
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCompletedDecisions = async () => {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('decisions')
                .select('id, title, decision_options(id, option_text)')
                .in('status', ['Approved', 'Rejected', 'Pending']); // Now includes active decisions

            if (error) {
                console.error("Error fetching decisions:", error);
                setError("Could not load decisions.");
            } else {
                setDecisions(data || []);
                if (data && data.length > 0) {
                    setSelectedDecisionId(data[0].id);
                }
            }
        };
        fetchCompletedDecisions();
    }, []);
    
    useEffect(() => {
        if (selectedDecisionId) {
            runAnalysis(selectedDecisionId);
        } else {
            setAnalysisResult(null);
        }
    }, [selectedDecisionId]);
    
    const runAnalysis = async (decisionId: string) => {
        const decision = decisions.find(d => d.id === decisionId);
        if (!decision || !supabase) return;

        setLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            // 1. Fetch all inputs for the selected decision
            const { data: inputs, error: inputsError } = await supabase
                .from('decision_inputs')
                .select('selected_option_id, comment')
                .eq('decision_id', decisionId);
            
            if (inputsError) throw inputsError;

            // 2. Process the data
            const totalVotes = inputs.length;
            const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
            const optionSentiments: Record<string, number[]> = {};

            inputs.forEach(input => {
                const sentiment = getSentimentScore(input.comment || "");
                sentimentCounts[sentiment.type]++;
                if(input.selected_option_id) {
                    if (!optionSentiments[input.selected_option_id]) {
                        optionSentiments[input.selected_option_id] = [];
                    }
                    optionSentiments[input.selected_option_id].push(sentiment.score);
                }
            });

            const processedOptions = decision.decision_options.map(option => {
                const votes = inputs.filter(i => i.selected_option_id === option.id).length;
                const votePercent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                
                const sentiments = optionSentiments[option.id] || [];
                const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 50;

                // Weighted score: 60% votes, 40% sentiment
                const weightedSupport = (votePercent * 0.6) + (avgSentiment * 0.4);

                return {
                    name: option.option_text,
                    votes,
                    votePercent: Math.round(votePercent),
                    sentimentScore: Math.round(avgSentiment),
                    weightedSupport: Math.round(weightedSupport)
                };
            });

            // 3. Assemble the final report object
            const report = {
                decisionTitle: decision.title,
                options: processedOptions,
                sentimentBreakdown: [
                    { name: 'Positive', value: sentimentCounts.Positive },
                    { name: 'Neutral', value: sentimentCounts.Neutral },
                    { name: 'Negative', value: sentimentCounts.Negative },
                ],
                keyThemes: MOCK_KEY_THEMES,
                fileInsights: MOCK_FILE_INSIGHTS,
                summary: `${decision.title}: Analysis complete based on ${totalVotes} inputs. ${processedOptions.sort((a,b) => b.weightedSupport - a.weightedSupport)[0]?.name} shows the highest support.`
            };
            
            setAnalysisResult(report);

        } catch (err: any) {
            console.error("Error running analysis:", err);
            setError("Failed to analyze decision inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <h1>Analysis Dashboard</h1>
                <div className="header-actions">
                    <div className="decision-selector-wrapper">
                         <select
                            value={selectedDecisionId || ''}
                            onChange={(e) => setSelectedDecisionId(e.target.value)}
                            className="decision-selector"
                            disabled={decisions.length === 0 || loading}
                        >
                            <option value="" disabled>
                                {decisions.length > 0 ? "Select a decision..." : "No completed decisions"}
                            </option>
                            {decisions.map(decision => (
                                <option key={decision.id} value={decision.id}>{decision.title}</option>
                            ))}
                        </select>
                        <FiChevronDown className="selector-arrow" />
                    </div>
                    <button className="export-btn" disabled={!analysisResult}><FiDownload /> Export Report</button>
                </div>
            </header>
            
            <main className="analytics-content">
                {loading && <div className="placeholder-card"><h2>Running analysis...</h2></div>}
                {error && <div className="placeholder-card error"><h2>{error}</h2></div>}
                {!loading && !selectedDecisionId && (
                     <div className="placeholder-card">
                        <FiInfo size={40} />
                        <h2>Select a Decision to Analyze</h2>
                        <p>Choose a completed decision from the dropdown above to view the AI-powered analysis.</p>
                    </div>
                )}
                {!loading && analysisResult && <AnalyticsReport result={analysisResult} />}
            </main>
        </div>
    );
};

// --- Report Component --- //

const AnalyticsReport = ({ result }: { result: any }) => (
    <div className="analytics-report-grid">
        <div className="chart-card full-width-card">
            <h3>Overall Summary</h3>
            <p>{result.summary}</p>
        </div>

        <div className="chart-card">
            <h3>Weighted Support Score</h3>
            <p>Vote count (60%) + Sentiment (40%)</p>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.options} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} domain={[0, 100]}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="weightedSupport" fill="#3b82f6" name="Support Score" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-card">
            <h3>Sentiment Analysis</h3>
            <p>Breakdown of comment sentiments</p>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie data={result.sentimentBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value" labelLine={false} >
                        {result.sentimentBreakdown.map((_entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>

        <div className="chart-card key-themes-card">
            <h3>Key Themes from Comments</h3>
            <p>Top topics identified by the AI</p>
            <div className="word-cloud">
                {result.keyThemes.map((theme: any) => (
                    <span key={theme.topic} className="theme-tag" style={{ backgroundColor: `${theme.color}30`, color: theme.color }}>
                        {theme.topic}
                    </span>
                ))}
            </div>
        </div>

        <div className="chart-card">
            <h3>Insights from Uploaded Files</h3>
            <p>Key information extracted from documents</p>
            <ul className="insights-list">
                {result.fileInsights.map((insight: string, index: number) => (
                    <li key={index}>{insight}</li>
                ))}
            </ul>
        </div>
    </div>
);


// --- CUSTOM RECHARTS TOOLTIP --- //
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.fill }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default Analytics; 