import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import './../styles/DecisionDetails.css';
import InputCollectionForm from '../components/InputCollectionForm';
import AIRecommendation from '../components/AIRecommendation'; // Import the new component

// Define the types for our data
interface DecisionOption {
  id: string;
  option_text: string;
}

interface DecisionCriterion {
  id:string;
  criterion_text: string;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  teams: { name: string } | null;
  decision_options: DecisionOption[];
  decision_criteria: DecisionCriterion[];
}

interface SubmissionData {
    selectedOption: string;
    comment: string;
    ratings: Record<string, number>;
    file?: File;
    submittedAt: string;
}

// This interface now matches the database record structure
interface Recommendation {
  id: string;
  recommended_option_text: string;
  confidence_score: number;
  explanation: string;
  details: {
    support: number;
    criteria: number;
    sentiment: number;
    historical: number;
  };
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  parent_message_id: string | null;
  user_id: string;
  profiles: { full_name: string }; // Assuming a 'profiles' table is linked
  replies?: Message[];
}

const ConfirmationMessage = ({ submissionData, decision }: { submissionData: any, decision: Decision }) => (
    <div className="confirmation-container">
      <h2>Thank You for Your Input!</h2>
      <p>Your submission has been recorded successfully.</p>
      <div className="submission-summary">
        <p><strong>Submitted on:</strong> {new Date(submissionData.created_at || submissionData.submittedAt).toLocaleString()}</p>
        <p><strong>Your Vote:</strong> {submissionData.abstained ? 'Abstained' : decision.decision_options.find(o => o.id === submissionData.selected_option_id)?.option_text}</p>
      </div>
    </div>
);

const DecisionDetails = () => {
    const { decisionId } = useParams<{ decisionId: string }>();
    const [decision, setDecision] = useState<Decision | null>(null);
    const [submission, setSubmission] = useState<any>(null);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null); // To track which message is being replied to
    const [isChatOpen, setIsChatOpen] = useState(false); // For collapsible UI

    const fetchMessages = useCallback(async () => {
        if (!decisionId || !supabase) return;
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                created_at,
                parent_message_id,
                user_id,
                profiles ( full_name )
            `)
            .eq('decision_id', decisionId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("Error fetching messages:", error);
            setError("Could not load discussion.");
        } else {
            const formattedMessages = data.map((item: any) => ({
                ...item,
                profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
            }));
            setMessages(formattedMessages || []);
        }
    }, [decisionId, supabase]);

    const fetchDecisionDetails = useCallback(async () => {
        if (!decisionId || !supabase) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch decision details
            const { data: decisionData, error: decisionError } = await supabase
                .from('decisions')
                .select(`
                    id, title, description, status, deadline,
                    teams ( name ),
                    decision_options ( id, option_text ),
                    decision_criteria ( id, criterion_text )
                `)
                .eq('id', decisionId)
                .single();

            if (decisionError) throw decisionError;
            
            // Check for existing submission by the current user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: submissionData, error: submissionError } = await supabase
                    .from('decision_inputs')
                    .select('*')
                    .eq('decision_id', decisionId)
                    .eq('user_id', user.id)
                    .single();
                
                if (submissionData) {
                    setSubmission(submissionData);
                }
                if (submissionError && submissionError.code !== 'PGRST116') { // Ignore "No rows found" error
                    console.error("Error fetching submission:", submissionError);
                }
            }
            
            const fetchedDecision = {
                ...decisionData,
                teams: Array.isArray(decisionData.teams) ? decisionData.teams[0] : decisionData.teams
            }

            setDecision(fetchedDecision as Decision);

        } catch (err: any) {
            setError(err.message || 'Failed to fetch decision details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [decisionId]);

    useEffect(() => {
        if (!decisionId || !supabase) return;

        fetchDecisionDetails();

        const channel = supabase
            .channel('realtime:decisions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'decisions', filter: `id=eq.${decisionId}` }, () => {
                fetchDecisionDetails();
            })
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, [decisionId, supabase, fetchDecisionDetails]);

    useEffect(() => {
        if (!decisionId || !supabase) return;

        fetchMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`decision-chat-${decisionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `decision_id=eq.${decisionId}`
                },
                () => {
                    // Re-fetch all messages to ensure UI is in sync
                    fetchMessages();
                }
            )
            .subscribe();

        // Cleanup subscription on component unmount
        return () => {
            if (supabase) {
                supabase.removeChannel(channel);
            }
        };
    }, [decisionId, supabase, fetchMessages]);

    const handleSendMessage = async (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();
        if (!newMessage.trim() || !decisionId || !supabase) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const message = {
                decision_id: decisionId,
                user_id: user.id,
                content: newMessage,
                parent_message_id: parentId
            };

            const { error } = await supabase.from('messages').insert(message);

            if (error) throw error;
            
            setNewMessage(''); // Clear input field
        } catch (err: any) {
            console.error("Error sending message:", err);
            setError("Failed to send message.");
        }
    };


    const handleFormSubmit = async (data: SubmissionData) => {
        if (!decision || !supabase) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to submit.");

            let fileUrl = null;
            if (data.file) {
                const filePath = `${decision.id}/${user.id}/${data.file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('decision-input-files')
                    .upload(filePath, data.file, {
                        upsert: true, // Overwrite if file exists
                    });
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('decision-input-files')
                    .getPublicUrl(filePath);
                fileUrl = urlData.publicUrl;
            }
            
            const submissionPayload = {
                decision_id: decision.id,
                user_id: user.id,
                selected_option_id: data.selectedOption === 'abstain' ? null : data.selectedOption,
                abstained: data.selectedOption === 'abstain',
                comment: data.comment,
                ratings: data.ratings,
                file_url: fileUrl,
            };

            const { data: newSubmission, error: insertError } = await supabase
                .from('decision_inputs')
                .insert(submissionPayload)
                .select()
                .single();

            if (insertError) throw insertError;
            
            setSubmission(newSubmission);

        } catch (err: any) {
            setError(err.message || 'An error occurred during submission.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateRecommendation = async () => {
        if (!decision || !supabase) return;
        setIsGenerating(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to generate a recommendation.");

            const { data, error: recommendationError } = await supabase.functions.invoke('generate-recommendation', {
                body: { decision_id: decision.id },
            });

            if (recommendationError) throw recommendationError;

            // The function returns { recommendation: { ... } }, so we extract it.
            if (data && data.recommendation) {
               setRecommendation(data.recommendation as Recommendation);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate recommendation.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return <div className="loading-container">Loading decision...</div>;
    }

    if (error) {
        return <div className="error-container">Error: {error}</div>;
    }

    if (!decision) {
        return <div className="loading-container">Decision not found.</div>;
    }

    return (
        <div className="decision-details-container">
            <header className="decision-details-header">
                <span className="team-tag">{decision.teams?.name} Team</span>
                <h1>{decision.title}</h1>
                <p className="description">{decision.description}</p>
                <div className="meta-info">
                    <span>Status: <span className={`status-badge status-${decision.status.toLowerCase()}`}>{decision.status}</span></span>
                    <span>Deadline for input: <strong>{new Date(decision.deadline).toLocaleDateString()}</strong></span>
                </div>
            </header>

            <main className="decision-input-section">
                <h2>Your Input</h2>
                <p>Cast your vote, rate the criteria, and provide your reasoning.</p>
                
                {submission ? (
                    <ConfirmationMessage submissionData={submission} decision={decision} />
                ) : (
                    <InputCollectionForm
                        options={decision.decision_options.map(o => ({ id: o.id, text: o.option_text }))}
                        criteria={decision.decision_criteria.map(c => ({ id: c.id, text: c.criterion_text }))}
                        onSubmit={handleFormSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
                {error && <div className="form-error submission-error">{error}</div>}
            </main>

            <section className="ai-recommendation-section">
              <button 
                onClick={handleGenerateRecommendation} 
                disabled={isGenerating}
                className="generate-rec-btn"
              >
                {isGenerating ? 'Generating...' : 'Get AI Recommendation'}
              </button>
              <AIRecommendation recommendation={recommendation} />
            </section>

            <section className="collaboration-hub-container">
                <button className="toggle-chat-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                    {isChatOpen ? 'Close Discussion' : 'Live Discussion'}
                </button>
                <div className={`collaboration-hub ${isChatOpen ? 'open' : ''}`}>
                    <h2>Live Discussion</h2>
                    <div className="messages-container">
                        {messages.filter(m => !m.parent_message_id).map(msg => (
                            <div key={msg.id} className="message-item-wrapper">
                                <div className="message-item">
                                    <p><strong>{msg.profiles?.full_name || 'Anonymous'}</strong> <span className="timestamp">{new Date(msg.created_at).toLocaleTimeString()}</span></p>
                                    <p>{msg.content}</p>
                                    <button className="reply-btn" onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}>
                                        {replyingTo === msg.id ? 'Cancel' : 'Reply'}
                                    </button>
                                </div>
                                {/* Render replies */}
                                <div className="replies-container">
                                    {messages.filter(reply => reply.parent_message_id === msg.id).map(reply => (
                                        <div key={reply.id} className="message-item reply-item">
                                            <p><strong>{reply.profiles?.full_name || 'Anonymous'}</strong> <span className="timestamp">{new Date(reply.created_at).toLocaleTimeString()}</span></p>
                                            <p>{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                                {/* Reply form */}
                                {replyingTo === msg.id && (
                                    <form onSubmit={(e) => {
                                        handleSendMessage(e, msg.id);
                                        setReplyingTo(null);
                                    }} className="message-form reply-form">
                                        <input 
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={`Replying to ${msg.profiles?.full_name || 'Anonymous'}...`}
                                            autoFocus
                                        />
                                        <button type="submit">Send Reply</button>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Main message form for non-replies */}
                    <form onSubmit={handleSendMessage} className="message-form">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default DecisionDetails; 