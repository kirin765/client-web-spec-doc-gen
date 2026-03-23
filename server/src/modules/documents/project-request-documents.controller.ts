import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@Controller('project-requests/:projectRequestId/documents')
@UseGuards(JwtAuthGuard)
export class ProjectRequestDocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('generate')
  async generateDocument(
    @Param('projectRequestId') projectRequestId: string,
    @Request() req: { user?: { id?: string } },
  ) {
    await this.documentsService.listDocuments(projectRequestId, req.user?.id);
    return this.documentsService.generateDocument(projectRequestId);
  }

  @Get()
  async listDocuments(
    @Param('projectRequestId') projectRequestId: string,
    @Request() req: { user?: { id?: string } },
  ) {
    const documents = await this.documentsService.listDocuments(
      projectRequestId,
      req.user?.id,
    );

    return { documents };
  }
}
