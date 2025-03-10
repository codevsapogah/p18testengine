const bcrypt = require('bcrypt');
const { supabase } = require('../utils/supabase');

// Get all coaches
exports.getCoaches = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('approved_coaches')
      .select('id, email, name, phone, is_admin, created_at')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json({ coaches: data });
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return res.status(500).json({ message: 'Server error fetching coaches' });
  }
};

// Create new coach
exports.createCoach = async (req, res) => {
  try {
    const { email, name, phone, password, is_admin = false } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Email, name, and password are required' });
    }
    
    // Insert new coach
    const { data, error } = await supabase
      .from('approved_coaches')
      .insert([
        { email, name, phone, password, is_admin }
      ])
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(201).json({ coach: data });
  } catch (error) {
    console.error('Error creating coach:', error);
    return res.status(500).json({ message: 'Server error creating coach' });
  }
};

// Update existing coach
exports.updateCoach = async (req, res) => {
  try {
    const coachId = req.params.id;
    const { email, name, phone, password, is_admin } = req.body;
    
    // Prepare update object
    const updates = {};
    if (email) updates.email = email;
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (password) updates.password = password;
    if (is_admin !== undefined) updates.is_admin = is_admin;
    
    // Update the coach
    const { data, error } = await supabase
      .from('approved_coaches')
      .update(updates)
      .eq('id', coachId)
      .select()
      .single();
      
    if (error) throw error;
    
    return res.status(200).json({ coach: data });
  } catch (error) {
    console.error('Error updating coach:', error);
    return res.status(500).json({ message: 'Server error updating coach' });
  }
};

// Delete coach
exports.deleteCoach = async (req, res) => {
  try {
    const coachId = req.params.id;
    
    const { error } = await supabase
      .from('approved_coaches')
      .delete()
      .eq('id', coachId);
      
    if (error) throw error;
    
    return res.status(200).json({ message: 'Coach deleted successfully' });
  } catch (error) {
    console.error('Error deleting coach:', error);
    return res.status(500).json({ message: 'Server error deleting coach' });
  }
};

// Get all clients (admin access)
exports.getAllClients = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json({ clients: data });
  } catch (error) {
    console.error('Error fetching all clients:', error);
    return res.status(500).json({ message: 'Server error fetching clients' });
  }
};

// Get all results (admin access)
exports.getAllResults = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return res.status(200).json({ results: data });
  } catch (error) {
    console.error('Error fetching all results:', error);
    return res.status(500).json({ message: 'Server error fetching results' });
  }
}; 