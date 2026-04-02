import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { MarkChatReadDto } from './dto/mark-chat-read.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async listRooms(@User() user: any) {
    return this.chatService.listRooms(user.id);
  }

  @Get('rooms/:roomId')
  async getRoom(@Param('roomId') roomId: string, @User() user: any) {
    return this.chatService.getRoom(roomId, user.id);
  }

  @Get('rooms/:roomId/messages')
  async listMessages(
    @Param('roomId') roomId: string,
    @Query('cursor') cursor: string | undefined,
    @User() user: any,
  ) {
    return this.chatService.listMessages(roomId, user.id, cursor);
  }

  @Post('rooms/:roomId/messages')
  async createMessage(
    @Param('roomId') roomId: string,
    @Body() dto: CreateChatMessageDto,
    @User() user: any,
  ) {
    return this.chatService.createMessage(roomId, user.id, dto.body);
  }

  @Patch('rooms/:roomId/read')
  async markRead(
    @Param('roomId') roomId: string,
    @Body() dto: MarkChatReadDto,
    @User() user: any,
  ) {
    return this.chatService.markRead(roomId, user.id, dto.lastReadMessageId);
  }
}
