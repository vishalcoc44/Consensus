import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './../styles/Decisions.css';
import './../styles/CreateDecisionModal.css';

interface Team {
  id: string;
  name: string;
}

interface Option {
  text: string;
}

interface Criterion {
  text: string;
  weight: number;
}

interface CreateDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecisionCreated: () => void;
}

const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({ isOpen, onClose, onDecisionCreated }) => {
  const [step, setStep] = useState(1);
  
  // Step 1: Core Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  // Step 2: Options
  const [options, setOptions] = useState<Option[]>([{ text: '' }, { text: '' }]);
  
  // Step 3: Criteria
  const [criteria, setCriteria] = useState<Criterion[]>([{ text: '', weight: 5 }]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchUserTeams = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('teams').select('id, name');
        if (error) {
          console.error("Error fetching teams:", error);
        } else {
          setTeams(data || []);
        }
      };
      fetchUserTeams();
    } else {
        // Reset state on close
        setTitle('');
        setDescription('');
        setDeadline('');
        setTeamId('');
        setOptions([{ text: '' }, { text: '' }]);
        setCriteria([{ text: '', weight: 5 }]);
        setStep(1);
        setError(null);
    }
  }, [isOpen]);

  // --- Options Handlers ---
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, { text: '' }]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // --- Criteria Handlers ---
  const handleCriterionChange = (index: number, field: 'text' | 'weight', value: string | number) => {
    const newCriteria = [...criteria];
    if (field === 'text') {
      newCriteria[index].text = value as string;
    } else {
      newCriteria[index].weight = Number(value);
    }
    setCriteria(newCriteria);
  };

  const addCriterion = () => {
    if (criteria.length < 5) {
      setCriteria([...criteria, { text: '', weight: 5 }]);
    }
  };
  
  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  // --- Navigation & Submission ---
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Final validation
    if (criteria.some(c => !c.text.trim())) {
        setError("All criteria must have a description.");
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
        if (!supabase) throw new Error("Supabase client not initialized.");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User must be logged in.");

        // 1. Create the core decision
        const { data: decisionData, error: decisionError } = await supabase.from('decisions').insert({
            title,
            description,
            deadline,
            team_id: teamId,
            created_by: user.id,
            status: 'Pending' // Start as Pending
        }).select().single();

        if (decisionError) throw decisionError;
        const decisionId = decisionData.id;

        // 2. Insert the options
        const optionsToInsert = options
            .filter(o => o.text.trim())
            .map(o => ({ decision_id: decisionId, option_text: o.text }));
        
        if (optionsToInsert.length > 0) {
            const { error: optionsError } = await supabase.from('decision_options').insert(optionsToInsert);
            if (optionsError) throw optionsError;
        }

        // 3. Insert the criteria
        const criteriaToInsert = criteria
            .filter(c => c.text.trim())
            .map(c => ({ decision_id: decisionId, criterion_text: c.text, weight: c.weight }));
        
        if (criteriaToInsert.length > 0) {
            const { error: criteriaError } = await supabase.from('decision_criteria').insert(criteriaToInsert);
            if (criteriaError) throw criteriaError;
        }

        onDecisionCreated();
        onClose();

    } catch (err: any) {
        console.error("Error creating decision:", err);
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2>Step 1: The Decision</h2>
            <p>Define the core details of the decision you need to make.</p>
            <div className="form-group">
                <label htmlFor="decision-title">Title</label>
                <input id="decision-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Should we launch Product X?" required />
            </div>
            <div className="form-group">
                <label htmlFor="decision-team">Team</label>
                <select id="decision-team" value={teamId} onChange={(e) => setTeamId(e.target.value)} required>
                    <option value="" disabled>Select a team...</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="decision-description">Description</label>
                <textarea id="decision-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide context and details about the decision."/>
            </div>
            <div className="form-group">
                <label htmlFor="decision-deadline">Deadline for Input</label>
                <input id="decision-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required/>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2>Step 2: The Options</h2>
            <p>List the possible choices for this decision (min 2, max 5).</p>
            {options.map((option, index) => (
              <div key={index} className="dynamic-input-group">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                {options.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className="remove-btn">&times;</button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <button type="button" onClick={addOption} className="add-btn">+ Add Option</button>
            )}
          </>
        );
      case 3:
        return (
            <>
              <h2>Step 3: The Criteria</h2>
              <p>Define how the options will be judged (max 5).</p>
              {criteria.map((criterion, index) => (
                <div key={index} className="dynamic-input-group criterion-group">
                  <input
                    type="text"
                    placeholder={`Criterion ${index + 1} (e.g., Cost, Impact)`}
                    value={criterion.text}
                    onChange={(e) => handleCriterionChange(index, 'text', e.target.value)}
                    required
                  />
                  <label>Weight</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={criterion.weight}
                    onChange={(e) => handleCriterionChange(index, 'weight', e.target.value)}
                  />
                  <span>{criterion.weight}</span>
                  {criteria.length > 1 && (
                     <button type="button" onClick={() => removeCriterion(index)} className="remove-btn">&times;</button>
                  )}
                </div>
              ))}
              {criteria.length < 5 && (
                <button type="button" onClick={addCriterion} className="add-btn">+ Add Criterion</button>
              )}
            </>
          );
      default:
        return null;
    }
  };
  
  const validateStep = () => {
    if (step === 1) {
        if (!title || !teamId || !deadline) {
            setError("Please fill out the Title, Team, and Deadline fields.");
            return false;
        }
    }
    if (step === 2) {
        if (options.some(o => !o.text.trim())) {
            setError("All options must have a description.");
            return false;
        }
        if (options.filter(o => o.text.trim()).length < 2) {
            setError("Please provide at least two distinct options.");
            return false;
        }
    }
    setError(null);
    return true;
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="wizard-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Details</div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Options</div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Criteria</div>
        </div>
        <form onSubmit={handleSubmit}>
            {renderStep()}
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
                {step > 1 && <button type="button" className="cancel-btn" onClick={prevStep} disabled={isLoading}>Back</button>}
                
                {step < 3 && <button type="button" className="create-btn" onClick={() => validateStep() && nextStep()}>Next</button>}

                {step === 3 && <button type="submit" className="create-btn" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Proposal'}</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDecisionModal; 