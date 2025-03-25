const { supabase, supabaseAdmin } = require('../utils/supabase');

// Get all clients for the logged-in coach
exports.getClients = async (req, res) => {
  try {
    const coachId = req.user.id;
    
    // Use standard supabase client to respect RLS policy
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', coachId);
      
    if (error) throw error;
    
    return res.status(200).json({ clients: data });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return res.status(500).json({ message: 'Server error fetching clients' });
  }
};

// Get single client by ID (ensure coach has access)
exports.getClientById = async (req, res) => {
  try {
    const coachId = req.user.id;
    const clientId = req.params.id;
    
    // Use standard supabase client to respect RLS policy
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('coach_id', coachId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return res.status(404).json({ message: 'Client not found or access denied' });
      }
      throw error;
    }
    
    return res.status(200).json({ client: data });
  } catch (error) {
    console.error('Error fetching client:', error);
    return res.status(500).json({ message: 'Server error fetching client' });
  }
};

// Get all results for the logged-in coach's clients
exports.getResults = async (req, res) => {
  try {
    const coachId = req.user.id;
    
    // First get all clients for this coach
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id')
      .eq('coach_id', coachId);
      
    if (clientsError) throw clientsError;
    
    if (!clients.length) {
      return res.status(200).json({ results: [] });
    }
    
    const clientIds = clients.map(client => client.id);
    
    // Then get all results for these clients
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .in('client_id', clientIds);
      
    if (error) throw error;
    
    return res.status(200).json({ results: data });
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ message: 'Server error fetching results' });
  }
};

// Get single result by ID (ensure coach has access)
exports.getResultById = async (req, res) => {
  try {
    const coachId = req.user.id;
    const resultId = req.params.id;
    
    // Verify coach has access to this result through client
    const { data, error } = await supabase
      .from('results')
      .select('*, clients!inner(*)')
      .eq('id', resultId)
      .eq('clients.coach_id', coachId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return res.status(404).json({ message: 'Result not found or access denied' });
      }
      throw error;
    }
    
    return res.status(200).json({ result: data });
  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ message: 'Server error fetching result' });
  }
}; 