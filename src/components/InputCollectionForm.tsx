import React, { useState } from 'react';
import './../styles/InputCollectionForm.css'; // Will create this file next
import { FiUpload, FiPaperclip } from 'react-icons/fi';

// A simple star rating component
const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => (
    <div className="star-rating">
        {[5, 4, 3, 2, 1].map(star => (
            <span
                key={star}
                className={star <= rating ? 'star active' : 'star'}
                onClick={() => setRating(star)}
            >
                &#9733;
            </span>
        ))}
    </div>
);


interface InputCollectionFormProps {
  options: { id: string; text: string }[];
  criteria: { id: string; text: string }[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const InputCollectionForm: React.FC<InputCollectionFormProps> = ({ options, criteria, onSubmit, isSubmitting }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [comment, setComment] = useState('');
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRatingChange = (criterionId: string, rating: number) => {
        setRatings(prev => ({ ...prev, [criterionId]: rating }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                setError("File size cannot exceed 10MB.");
                setFile(null);
            } else {
                setError(null);
                setFile(selectedFile);
            }
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!selectedOption) {
            setError("Please select an option to vote.");
            return;
        }
        if (Object.keys(ratings).length !== criteria.length) {
            setError("Please rate all criteria.");
            return;
        }
        setError(null);
        onSubmit({
            selectedOption,
            comment,
            ratings,
            file,
            submittedAt: new Date().toISOString()
        });
    };

    return (
        <form className="input-collection-form" onSubmit={handleSubmit}>
            {/* 1. Voting Section */}
            <fieldset className="form-section" disabled={isSubmitting}>
                <legend>1. Cast Your Vote</legend>
                <div className="vote-options">
                    {options.map(option => (
                        <label key={option.id} className={`radio-label ${selectedOption === option.id ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="decision-option"
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            />
                            {option.text}
                        </label>
                    ))}
                    <label className={`radio-label ${selectedOption === 'abstain' ? 'selected' : ''}`}>
                        <input
                            type="radio"
                            name="decision-option"
                            value="abstain"
                            checked={selectedOption === 'abstain'}
                            onChange={(e) => setSelectedOption(e.target.value)}
                        />
                        Abstain
                    </label>
                </div>
            </fieldset>

            {/* 2. Criteria Rating Section */}
            <fieldset className="form-section" disabled={isSubmitting}>
                <legend>2. Rate the Criteria</legend>
                <div className="criteria-rating-list">
                    {criteria.map(criterion => (
                        <div key={criterion.id} className="criterion-rating-item">
                            <label>{criterion.text}</label>
                            <StarRating
                                rating={ratings[criterion.id] || 0}
                                setRating={(r) => handleRatingChange(criterion.id, r)}
                            />
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* 3. Comment Section */}
            <fieldset className="form-section" disabled={isSubmitting}>
                <legend>3. Add Your Reasoning</legend>
                <textarea
                    maxLength={500}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Explain your vote and ratings (optional)..."
                />
                <div className="char-counter">{comment.length} / 500</div>
            </fieldset>
            
            {/* 4. File Upload Section */}
            <fieldset className="form-section" disabled={isSubmitting}>
                <legend>4. Upload Supporting Documents</legend>
                <label htmlFor="file-upload" className="file-upload-label">
                    <FiUpload />
                    <span>{file ? 'Change file' : 'Select a file'}</span>
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.csv"
                    onChange={handleFileChange}
                />
                {file && (
                    <div className="file-preview">
                        <FiPaperclip /> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                )}
            </fieldset>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Your Input'}
            </button>
        </form>
    );
};

export default InputCollectionForm; 