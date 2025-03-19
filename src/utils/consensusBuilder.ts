
import { supabase } from '@/integrations/supabase/client';

interface ConsensusOption {
  id: string;
  title: string;
  description?: string;
  supportPercentage: number;
  isContentious: boolean;
  criteriaScores: Record<string, number>;
}

interface CommentTheme {
  theme: string;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  frequency: number;
  optionId: string;
}

interface ConsensusResult {
  broadSupportOptions: ConsensusOption[];
  contentiousOptions: ConsensusOption[];
  suggestedCompromises: Array<{
    title: string;
    description: string;
    baseOptionId: string;
    targetIssue: string;
    estimatedApproval: number;
    reductionInDisagreement: number;
  }>;
  proposedNewOptions: Array<{
    title: string;
    description: string;
    baseOptions: string[];
    estimatedApproval: number;
  }>;
}

/**
 * Analyzes proposal data to identify areas of consensus and potential compromises
 */
export const generateConsensusAnalysis = async (proposalId: string): Promise<ConsensusResult | null> => {
  try {
    // Fetch proposal data
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single();
      
    if (proposalError) throw proposalError;

    // Fetch options
    const { data: options, error: optionsError } = await supabase
      .from('proposal_options')
      .select('*')
      .eq('proposal_id', proposalId);
      
    if (optionsError) throw optionsError;

    // Fetch contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select(`
        *,
        contribution_ratings(*)
      `)
      .eq('proposal_id', proposalId);
      
    if (contributionsError) throw contributionsError;

    // Fetch criteria
    const { data: criteria, error: criteriaError } = await supabase
      .from('proposal_criteria')
      .select('*')
      .eq('proposal_id', proposalId);
      
    if (criteriaError) throw criteriaError;

    // Calculate consensus metrics
    const totalVotes = contributions.length;
    const optionSupport: Record<string, number> = {};
    const optionSentiments: Record<string, number[]> = {};
    const optionCriteriaScores: Record<string, Record<string, number[]>> = {};
    
    // Initialize data structures
    options.forEach(option => {
      optionSupport[option.id] = 0;
      optionSentiments[option.id] = [];
      optionCriteriaScores[option.id] = {};
      criteria.forEach(criterion => {
        optionCriteriaScores[option.id][criterion.id] = [];
      });
    });
    
    // Process contributions
    contributions.forEach(contribution => {
      const optionId = contribution.selected_option_id;
      if (optionId) {
        optionSupport[optionId]++;
        
        if (contribution.sentiment_score) {
          optionSentiments[optionId].push(contribution.sentiment_score);
        }
        
        // Process ratings
        if (contribution.contribution_ratings) {
          contribution.contribution_ratings.forEach(rating => {
            if (optionCriteriaScores[optionId]?.[rating.criterion_id]) {
              optionCriteriaScores[optionId][rating.criterion_id].push(rating.rating);
            }
          });
        }
      }
    });
    
    // Extract comment themes (simplified - would use NLP in production)
    const commentThemes: CommentTheme[] = analyzeCommentThemes(contributions, options);
    
    // Identify options with broad support (≥50%) and contentious options
    const consensusOptions: ConsensusOption[] = options.map(option => {
      const supportCount = optionSupport[option.id] || 0;
      const supportPercentage = totalVotes > 0 ? (supportCount / totalVotes) * 100 : 0;
      
      // Calculate average criteria scores
      const avgCriteriaScores: Record<string, number> = {};
      criteria.forEach(criterion => {
        const scores = optionCriteriaScores[option.id][criterion.id];
        avgCriteriaScores[criterion.id] = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;
      });
      
      return {
        id: option.id,
        title: option.title,
        description: option.description,
        supportPercentage,
        isContentious: supportPercentage >= 30 && supportPercentage < 50,
        criteriaScores: avgCriteriaScores
      };
    });
    
    const broadSupportOptions = consensusOptions.filter(opt => opt.supportPercentage >= 50);
    const contentiousOptions = consensusOptions.filter(opt => opt.isContentious);

    // Generate compromise suggestions
    const suggestedCompromises = generateCompromiseSuggestions(
      consensusOptions, 
      commentThemes, 
      criteria
    );
    
    // Generate new option proposals
    const proposedNewOptions = generateNewOptionProposals(
      consensusOptions,
      commentThemes,
      criteria
    );
    
    return {
      broadSupportOptions,
      contentiousOptions,
      suggestedCompromises,
      proposedNewOptions
    };
  } catch (error) {
    console.error('Error in consensus analysis:', error);
    return null;
  }
};

/**
 * Analyzes comments to extract common themes and concerns
 */
const analyzeCommentThemes = (contributions: any[], options: any[]): CommentTheme[] => {
  // This is a simplified implementation
  // In production, this would use NLP techniques to extract themes from comments
  
  // Map of keywords to look for in comments, associated with themes
  const themeKeywords: Record<string, string[]> = {
    'cost': ['cost', 'expensive', 'budget', 'price', 'affordable', 'cheap', 'money', 'financial'],
    'location': ['location', 'distance', 'commute', 'travel', 'downtown', 'suburban', 'central'],
    'flexibility': ['flexible', 'remote', 'hybrid', 'work from home', 'wfh', 'schedule'],
    'accessibility': ['access', 'accessible', 'transit', 'transportation', 'parking', 'bus', 'train'],
    'amenities': ['amenities', 'facilities', 'restaurant', 'gym', 'cafe', 'services'],
  };
  
  const themes: CommentTheme[] = [];
  
  // Count theme occurrences per option
  const themeCountsByOption: Record<string, Record<string, { count: number, sentiment: number[] }>> = {};
  
  options.forEach(option => {
    themeCountsByOption[option.id] = {};
    Object.keys(themeKeywords).forEach(theme => {
      themeCountsByOption[option.id][theme] = { count: 0, sentiment: [] };
    });
  });
  
  // Analyze each comment
  contributions.forEach(contribution => {
    if (!contribution.comment || !contribution.selected_option_id) return;
    
    const comment = contribution.comment.toLowerCase();
    const optionId = contribution.selected_option_id;
    const sentiment = contribution.sentiment_score || 0.5;
    
    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      const hasTheme = keywords.some(keyword => comment.includes(keyword.toLowerCase()));
      
      if (hasTheme) {
        themeCountsByOption[optionId][theme].count++;
        themeCountsByOption[optionId][theme].sentiment.push(sentiment);
      }
    });
  });
  
  // Convert counts to theme objects
  options.forEach(option => {
    Object.entries(themeCountsByOption[option.id]).forEach(([theme, data]) => {
      if (data.count > 0) {
        const avgSentiment = data.sentiment.reduce((sum, val) => sum + val, 0) / data.sentiment.length;
        let sentimentCategory: 'positive' | 'negative' | 'neutral' = 'neutral';
        
        if (avgSentiment >= 0.6) sentimentCategory = 'positive';
        else if (avgSentiment <= 0.4) sentimentCategory = 'negative';
        
        themes.push({
          theme,
          keywords: themeKeywords[theme],
          sentiment: sentimentCategory,
          frequency: data.count,
          optionId: option.id
        });
      }
    });
  });
  
  return themes;
};

/**
 * Generates compromise suggestions based on option support and comment themes
 */
const generateCompromiseSuggestions = (
  options: ConsensusOption[], 
  themes: CommentTheme[],
  criteria: any[]
) => {
  const compromises = [];
  
  // Find options with reasonable support that have negative themes
  for (const option of options) {
    if (option.supportPercentage >= 40) {
      // Look for negative themes for this option
      const negativeThemes = themes.filter(
        theme => theme.optionId === option.id && theme.sentiment === 'negative'
      );
      
      for (const negTheme of negativeThemes) {
        // Generate a compromise that addresses the negative theme
        const compromise = {
          title: `Modified ${option.title}`,
          description: `A modification of "${option.title}" that addresses concerns about ${negTheme.theme}.`,
          baseOptionId: option.id,
          targetIssue: negTheme.theme,
          estimatedApproval: Math.min(option.supportPercentage + 15, 95),
          reductionInDisagreement: Math.floor(Math.random() * 20) + 20 // 20-40% reduction (would be calculated in production)
        };
        
        // Customize compromise based on theme
        switch (negTheme.theme) {
          case 'cost':
            compromise.title = `${option.title} with cost controls`;
            compromise.description = `Implement "${option.title}" with a strict budget cap and cost monitoring.`;
            break;
          case 'location':
            compromise.title = `${option.title} with location flexibility`;
            compromise.description = `Adopt "${option.title}" while providing transportation subsidies or remote work options.`;
            break;
          case 'flexibility':
            compromise.title = `${option.title} with flexible scheduling`;
            compromise.description = `Implement "${option.title}" with flexible hours and partial remote work options.`;
            break;
          case 'accessibility':
            compromise.title = `${option.title} with accessibility improvements`;
            compromise.description = `Enhance "${option.title}" with better transportation options and accessibility features.`;
            break;
          case 'amenities':
            compromise.title = `${option.title} with enhanced amenities`;
            compromise.description = `Supplement "${option.title}" with additional services and amenities.`;
            break;
        }
        
        compromises.push(compromise);
      }
    }
  }
  
  return compromises;
};

/**
 * Generates new option proposals by combining elements of existing options
 */
const generateNewOptionProposals = (
  options: ConsensusOption[], 
  themes: CommentTheme[],
  criteria: any[]
) => {
  const proposals = [];
  
  // Only generate new options if there are multiple options with some support
  const viableOptions = options.filter(opt => opt.supportPercentage >= 25);
  
  if (viableOptions.length >= 2) {
    // Find potential pairs to combine
    for (let i = 0; i < viableOptions.length - 1; i++) {
      for (let j = i + 1; j < viableOptions.length; j++) {
        const optionA = viableOptions[i];
        const optionB = viableOptions[j];
        
        // Skip if both have very high support (no need to compromise)
        if (optionA.supportPercentage >= 70 && optionB.supportPercentage >= 70) continue;
        
        // Identify complementary strengths based on criteria scores
        const complementaryAspects = [];
        
        Object.entries(optionA.criteriaScores).forEach(([criterionId, scoreA]) => {
          const scoreB = optionB.criteriaScores[criterionId];
          if (scoreA > scoreB + 1) {
            // Option A is significantly better in this criterion
            const criterion = criteria.find(c => c.id === criterionId);
            if (criterion) complementaryAspects.push({ name: criterion.name, fromOption: 'A' });
          } else if (scoreB > scoreA + 1) {
            // Option B is significantly better in this criterion
            const criterion = criteria.find(c => c.id === criterionId);
            if (criterion) complementaryAspects.push({ name: criterion.name, fromOption: 'B' });
          }
        });
        
        if (complementaryAspects.length >= 2) {
          // Enough complementary aspects to justify a hybrid
          const aspectsFromA = complementaryAspects
            .filter(aspect => aspect.fromOption === 'A')
            .map(aspect => aspect.name);
            
          const aspectsFromB = complementaryAspects
            .filter(aspect => aspect.fromOption === 'B')
            .map(aspect => aspect.name);
          
          // Create a hybrid proposal
          proposals.push({
            title: `Hybrid: ${optionA.title} + ${optionB.title}`,
            description: `A hybrid solution combining ${aspectsFromA.join(', ')} from "${optionA.title}" with ${aspectsFromB.join(', ')} from "${optionB.title}".`,
            baseOptions: [optionA.id, optionB.id],
            estimatedApproval: Math.min(
              (optionA.supportPercentage + optionB.supportPercentage) * 0.7,
              85
            ) // Cap at 85% approval
          });
        }
      }
    }
  }
  
  return proposals;
};

/**
 * Optimizes the recommendation to maximize stakeholder satisfaction
 * This is a simplified version of what would be a multi-objective optimization algorithm
 */
export const optimizeForStakeholderSatisfaction = (
  options: ConsensusOption[],
  stakeholderGroups: Array<{ id: string, name: string, preferences: Record<string, number> }>
) => {
  // In a real implementation, this would use a proper multi-objective optimization algorithm
  // For this demo, we'll use a simple weighted sum approach
  
  const optionScores: Record<string, { score: number, satisfactionByGroup: Record<string, number> }> = {};
  
  options.forEach(option => {
    let totalScore = 0;
    const satisfactionByGroup: Record<string, number> = {};
    
    stakeholderGroups.forEach(group => {
      // Calculate satisfaction for this group (0-100)
      const preference = group.preferences[option.id] || 0;
      const criteriaAlignment = Object.entries(option.criteriaScores).reduce(
        (sum, [criterionId, score]) => sum + score, 0
      ) / Object.keys(option.criteriaScores).length;
      
      const satisfaction = (preference * 0.7) + (criteriaAlignment * 0.3) * 20; // Scale to 0-100
      satisfactionByGroup[group.id] = satisfaction;
      totalScore += satisfaction;
    });
    
    // Calculate average satisfaction across all groups
    const avgScore = totalScore / stakeholderGroups.length;
    
    optionScores[option.id] = {
      score: avgScore,
      satisfactionByGroup
    };
  });
  
  return optionScores;
};
