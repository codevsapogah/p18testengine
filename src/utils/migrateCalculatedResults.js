import { supabase } from '../supabase';
import { calculateResults } from './calculateResults';

/**
 * Test migration on a single quiz result
 * 
 * @param {string} id The quiz result ID to test
 * @returns {Object} Migration result info
 */
export const testMigrateSingle = async (id) => {
  try {
    console.log(`Testing migration for quiz ID: ${id}`);
    
    // Fetch the specific quiz result
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, answers')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      throw new Error(`Quiz result with ID ${id} not found`);
    }
    
    console.log('Found quiz result:', data.id);
    console.log('Answers structure:', {
      type: typeof data.answers,
      isObject: typeof data.answers === 'object',
      isArray: Array.isArray(data.answers),
      length: Object.keys(data.answers || {}).length
    });
    
    // Log a sample of the answers
    if (data.answers && typeof data.answers === 'object') {
      const answerKeys = Object.keys(data.answers).slice(0, 5);
      console.log('Sample answers (first 5):', answerKeys.map(key => `${key}: ${data.answers[key]}`));
    } else {
      console.log('Answers data is invalid:', data.answers);
    }
    
    // Try to calculate results
    try {
      const calculatedResults = calculateResults(data.answers);
      
      console.log('Calculation successful!');
      console.log('Programs calculated:', Object.keys(calculatedResults).length);
      console.log('First few program results:', 
        Object.entries(calculatedResults).slice(0, 3).map(([id, result]) => 
          `Program ${id}: ${result.score}%`).join(', '));
      
      return {
        success: true,
        id: data.id,
        programCount: Object.keys(calculatedResults).length,
        calculatedResults
      };
    } catch (calcErr) {
      console.error('Calculation failed:', calcErr);
      return {
        success: false,
        id: data.id,
        error: calcErr.message
      };
    }
  } catch (err) {
    console.error('Test migration failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Migration utility to populate calculated_results for existing entries
 * Run this once after adding the column to backfill data
 */
export const migrateCalculatedResults = async () => {
  try {
    console.log('Starting migration of calculated results...');
    
    // Fetch all quiz results that don't have calculated_results yet
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, answers')
      .is('calculated_results', null);
    
    if (error) throw error;
    
    console.log(`Found ${data.length} entries to migrate`);
    console.log('Sample entry:', data.length > 0 ? JSON.stringify(data[0]).substring(0, 200) + '...' : 'No data');
    
    // Process in batches to avoid overloading
    const batchSize = 5;
    let successCount = 0;
    let errorCount = 0;
    let errorDetails = [];
    
    // Create a function to process results that avoids the unsafe reference issue
    const processResults = (results, initialSuccessCount, initialErrorCount) => {
      let successCount = initialSuccessCount;
      let errorCount = initialErrorCount;
      
      results.forEach(success => {
        if (success) successCount++;
        else errorCount++;
      });
      
      return { successCount, errorCount };
    };
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // Process each entry in the batch
      const promises = batch.map(async (item) => {
        try {
          // Skip entries with no answers or empty answers
          if (!item.answers || typeof item.answers !== 'object' || Object.keys(item.answers).length === 0) {
            console.log(`Skipping item ${item.id}: No valid answers data`);
            errorDetails.push({ id: item.id, reason: 'No valid answers data' });
            return false;
          }
          
          console.log(`Processing item ${item.id}, answers keys:`, Object.keys(item.answers).length);
          
          // Calculate results with detailed error handling
          let calculatedResults;
          try {
            calculatedResults = calculateResults(item.answers);
            console.log(`Calculation successful for ${item.id}, results:`, 
              Object.keys(calculatedResults).length + ' programs processed');
          } catch (calcErr) {
            console.error(`Error in calculation for ${item.id}:`, calcErr);
            errorDetails.push({ id: item.id, reason: `Calculation error: ${calcErr.message}` });
            return false;
          }
          
          // Update the database
          const { error: updateError } = await supabase
            .from('quiz_results')
            .update({ calculated_results: calculatedResults })
            .eq('id', item.id);
          
          if (updateError) {
            console.error(`Database update error for ${item.id}:`, updateError);
            errorDetails.push({ id: item.id, reason: `Database error: ${updateError.message}` });
            throw updateError;
          }
          
          console.log(`Successfully updated ${item.id}`);
          return true;
        } catch (err) {
          console.error(`Error processing entry ${item.id}:`, err);
          errorDetails.push({ id: item.id, reason: err.message });
          return false;
        }
      });
      
      // Wait for all batch operations to complete
      const results = await Promise.all(promises);
      
      // Count successes and errors (using the function defined outside the loop)
      const counts = processResults(results, successCount, errorCount);
      successCount = counts.successCount;
      errorCount = counts.errorCount;
      
      console.log(`Processed ${i + batch.length} of ${data.length} entries`);
    }
    
    console.log('Migration completed!');
    console.log(`Successful updates: ${successCount}`);
    console.log(`Failed updates: ${errorCount}`);
    
    if (errorDetails.length > 0) {
      console.log('Error details:');
      errorDetails.slice(0, 5).forEach(err => {
        console.log(`- ID ${err.id}: ${err.reason}`);
      });
      
      if (errorDetails.length > 5) {
        console.log(`... and ${errorDetails.length - 5} more errors`);
      }
    }
    
    return { 
      successCount, 
      errorCount, 
      errorDetails: errorDetails.slice(0, 10) // Return first 10 errors for display
    };
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
};

export default migrateCalculatedResults; 