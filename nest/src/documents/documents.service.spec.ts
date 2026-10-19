import { SeedService } from '../data/seed.service.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsService', () => {
  const seed = new SeedService();

  it('uses the brief date rather than the date in the document seed', () => {
    const result = new DocumentsService(seed).getDocuments();
    expect(result.asOf).toBe('2026-05-15');
    expect(
      result.documents.map(({ daysRemaining, status }) => ({
        daysRemaining,
        status,
      })),
    ).toEqual([
      { daysRemaining: 152, status: 'safe' },
      { daysRemaining: 224, status: 'safe' },
      { daysRemaining: 14, status: 'soon' },
      { daysRemaining: 27, status: 'soon' },
      { daysRemaining: -14, status: 'expired' },
    ]);
  });

  it('handles expiry today, tomorrow, and both sides of the warning threshold', () => {
    const documents = [
      '2026-05-15',
      '2026-05-16',
      '2026-06-14',
      '2026-06-15',
    ].map((expiryDate) => ({
      id: expiryDate,
      label: 'Test document',
      expiryDate,
    }));
    const service = new DocumentsService({
      ...seed,
      documents: { ...seed.documents, documents },
    });
    expect(
      service.getDocuments().documents.map(({ status }) => status),
    ).toEqual(['expired', 'soon', 'soon', 'safe']);
  });
});
