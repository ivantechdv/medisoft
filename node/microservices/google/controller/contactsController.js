import { ContactsService } from '../services/contactsService.js';
import { getAuthClient } from './auth.controller.js';

export const searchContacts = async (req, res) => {
  const { q, limit } = req.query;
  if (!q) return res.status(400).json({ error: 'Search term is required' });

  try {
    const auth = getAuthClient();
    const contactsService = new ContactsService(auth);
    const results = await contactsService.searchContacts(q, parseInt(limit) || 100);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
