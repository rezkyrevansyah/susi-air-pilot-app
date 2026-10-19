import { Injectable } from '@nestjs/common';
import { daysBetween, REFERENCE_DATE } from '../common/date.js';
import { SeedService } from '../data/seed.service.js';

@Injectable()
export class DocumentsService {
  constructor(private readonly seed: SeedService) {}

  getDocuments() {
    return {
      asOf: REFERENCE_DATE,
      documents: this.seed.documents.documents.map((document) => {
        const daysRemaining = daysBetween(REFERENCE_DATE, document.expiryDate);
        const status =
          daysRemaining <= 0
            ? 'expired'
            : daysRemaining <= this.seed.documents.thresholds.warningDays
              ? 'soon'
              : 'safe';
        return { ...document, daysRemaining, status };
      }),
    };
  }
}
