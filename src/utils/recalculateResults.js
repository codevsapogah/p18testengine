import { supabase } from '../supabase';
import { calculateResults } from './calculateResults';

// Recalculate a single result by ID
export const recalculateSingleResult = async (resultId) => {
  try {
    // Get the specific result
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, answers')
      .eq('id', resultId)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error(`Result with ID ${resultId} not found`);
    
    // Check if answers exist
    if (!data.answers || typeof data.answers !== 'object' || Object.keys(data.answers).length === 0) {
      throw new Error(`Result ${resultId} has no valid answers`);
    }
    
    // Recalculate results
    const recalculatedResults = calculateResults(data.answers);
    
    // Update the result
    const { error: updateError } = await supabase
      .from('quiz_results')
      .update({ calculated_results: recalculatedResults })
      .eq('id', resultId);
      
    if (updateError) throw updateError;
    
    return { success: true, results: recalculatedResults };
  } catch (err) {
    console.error(`Error recalculating result ${resultId}:`, err);
    throw err;
  }
};

// Original function to recalculate all results
export const recalculateAllResults = async () => {
  try {
    // Get all quiz results from the database
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, answers')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    console.log(`Found ${data.length} results to recalculate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each result
    for (const result of data) {
      if (!result.answers || typeof result.answers !== 'object' || Object.keys(result.answers).length === 0) {
        console.log(`Skipping result ${result.id}: No valid answers found`);
        continue;
      }
      
      try {
        // Recalculate results using the current algorithm
        const recalculatedResults = calculateResults(result.answers);
        
        // Update the result in the database
        const { error: updateError } = await supabase
          .from('quiz_results')
          .update({ calculated_results: recalculatedResults })
          .eq('id', result.id);
          
        if (updateError) throw updateError;
        
        successCount++;
        console.log(`Recalculated result ${result.id}`);
      } catch (err) {
        errorCount++;
        console.error(`Error recalculating result ${result.id}:`, err);
      }
    }
    
    return {
      total: data.length,
      success: successCount,
      error: errorCount
    };
  } catch (err) {
    console.error('Error recalculating results:', err);
    throw err;
  }
}; 