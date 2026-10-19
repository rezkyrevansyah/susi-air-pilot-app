import { Controller, Get } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Get()
  getDocuments() {
    return this.documents.getDocuments();
  }
}
