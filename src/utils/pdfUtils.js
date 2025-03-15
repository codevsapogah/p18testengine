// Create a safe filename for PDF downloads
export const createSafeFilename = (userData, view) => {
  const name = userData.user_name 
    ? userData.user_name.replace(/[^a-zA-Z0-9]/g, '_')
    : 'results';
  const date = new Date(userData.created_at).toISOString().split('T')[0];
  return `p18_${name}_${date}_${view}`;
}; 