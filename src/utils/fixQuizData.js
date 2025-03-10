import { supabase } from '../supabase';

/**
 * Fix problematic quiz_results data 
 * This utility repairs issues with quiz results data structure
 */
export const fixQuizData = async () => {
  try {
    console.log('Starting data repair...');
    
    // Fetch all quiz results that don't have calculated_results
    const { data, error } = await supabase
      .from('quiz_results')
      .select('id, answers')
      .is('calculated_results', null);
    
    if (error) throw error;
    
    console.log(`Found ${data.length} entries to check`);
    
    // Track success/failure counts
    let fixedCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // Process each result
    for (const item of data) {
      try {
        if (!item.answers) {
          console.log(`Skipping item ${item.id}: No answers data`);
          skipCount++;
          continue;
        }
        
        // Check if answers is a valid object
        if (typeof item.answers !== 'object') {
          console.log(`Fixing item ${item.id}: Answers is not an object (${typeof item.answers})`);
          
          // Try to parse if it's a JSON string
          if (typeof item.answers === 'string') {
            try {
              const parsed = JSON.parse(item.answers);
              if (typeof parsed === 'object') {
                // Update with parsed object
                const { error: updateError } = await supabase
                  .from('quiz_results')
                  .update({ answers: parsed })
                  .eq('id', item.id);
                
                if (updateError) throw updateError;
                
                console.log(`Fixed item ${item.id}: Parsed string to object`);
                fixedCount++;
                continue;
              }
            } catch (parseErr) {
              console.error(`Failed to parse string for ${item.id}:`, parseErr);
            }
          }
          
          // If we got here, we couldn't fix it
          console.error(`Could not fix data format for ${item.id}`);
          errorCount++;
          continue;
        }
        
        // Check if answers is empty
        if (Object.keys(item.answers).length === 0) {
          console.log(`Skipping empty answers for ${item.id}`);
          skipCount++;
          continue;
        }
        
        // Ensure all answer values are numbers
        let needsFix = false;
        const fixedAnswers = {};
        
        Object.entries(item.answers).forEach(([key, value]) => {
          // If value is not a number or numeric string, fix it
          if (isNaN(Number(value))) {
            needsFix = true;
            fixedAnswers[key] = 0; // Default to 0 for invalid values
          } else {
            fixedAnswers[key] = Number(value);
          }
        });
        
        if (needsFix) {
          // Update with fixed answers
          const { error: updateError } = await supabase
            .from('quiz_results')
            .update({ answers: fixedAnswers })
            .eq('id', item.id);
          
          if (updateError) throw updateError;
          
          console.log(`Fixed item ${item.id}: Converted non-numeric values to numbers`);
          fixedCount++;
        } else {
          console.log(`Item ${item.id} has valid answers format, no fix needed`);
          skipCount++;
        }
      } catch (itemError) {
        console.error(`Error fixing item ${item.id}:`, itemError);
        errorCount++;
      }
    }
    
    console.log('Data repair completed!');
    console.log(`Fixed: ${fixedCount}, Skipped: ${skipCount}, Errors: ${errorCount}`);
    
    return { fixedCount, skipCount, errorCount };
  } catch (err) {
    console.error('Data repair failed:', err);
    throw err;
  }
};

export default fixQuizData; 