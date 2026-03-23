// [M5] 수정 필요: 라우트 `:projectRequestId/generate`가 `/documents` 프리픽스 아래에 있어 URL이 `/documents/:projectRequestId/generate`로 비직관적임. `/project-requests/:id/documents/generate` 구조로 재설계 검토 필요.
import { Controller, Get, Post, Param, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private documentsService: DocumentsService) {}

  @Post(':projectRequestId/generate')
  @UseGuards(JwtAuthGuard)
  async generateDocument(@Param('projectRequestId') projectRequestId: string, @Request() req: any) {
    this.logger.log(`Generate document for project ${projectRequestId}`);
    return this.documentsService.generateDocument(projectRequestId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listDocuments(
    @Query('projectRequestId') projectRequestId: string,
    @Request() req: any,
  ) {
    this.logger.log(`List documents for project ${projectRequestId}`);
    const documents = await this.documentsService.listDocuments(projectRequestId, req.user?.id);
    return { documents };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDocument(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Get document ${id}`);
    return this.documentsService.getDocumentById(id, req.user?.id);
  }

  @Get(':id/content')
  @UseGuards(JwtAuthGuard)
  async getDocumentContent(@Param('id') id: string, @Request() req: any) {
    this.logger.log(`Get content for document ${id}`);
    const document = await this.documentsService.getDocumentById(id, req.user?.id);
    return document.content;
  }
}
