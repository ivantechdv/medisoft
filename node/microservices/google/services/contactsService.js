import { google } from 'googleapis';
import { textContains } from '../utils/textUtils.js';

export class ContactsService {
  constructor(auth) {
    this.auth = auth;
  }

  async searchContacts(searchTerm, limit = 100) {
    const service = google.people({ version: 'v1', auth: this.auth });
    let allConnections = [];
    let nextPageToken;

    do {
      const res = await service.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses,phoneNumbers',
        pageToken: nextPageToken,
      });

      allConnections = allConnections.concat(res.data.connections || []);
      nextPageToken = res.data.nextPageToken;
    } while (nextPageToken);

    const filtered = allConnections.filter(person => {
      const name = person.names?.[0]?.displayName || '';
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      return textContains(name, searchTerm)
          || textContains(email, searchTerm)
          || textContains(phone, searchTerm);
    });

    const contacts = filtered.slice(0, limit).map(person => ({
      name: person.names?.[0]?.displayName || 'Sin nombre',
      email: person.emailAddresses?.[0]?.value || 'Sin email',
      phone: person.phoneNumbers?.[0]?.value || 'Sin teléfono'
    }));

    return { searchTerm, totalFound: filtered.length, contacts };
  }
}
