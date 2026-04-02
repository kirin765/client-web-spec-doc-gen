import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';
import { PrismaModule } from './common/db/prisma.module';
import { QueueModule } from './common/queue/queue.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectRequestsModule } from './modules/project-requests/project-requests.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MatchingModule } from './modules/matching/matching.module';
import { DevelopersModule } from './modules/developers/developers.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { QuoteSharesModule } from './modules/quote-shares/quote-shares.module';
import { ChatModule } from './modules/chat/chat.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { RegionsModule } from './modules/regions/regions.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import configuration from './common/config/configuration';

const envFileCandidates = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), 'server/.env.local'),
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: envFileCandidates,
    }),
    PrismaModule,
    QueueModule,
    AuthModule,
    ProjectRequestsModule,
    PricingModule,
    DocumentsModule,
    MatchingModule,
    DevelopersModule,
    CustomersModule,
    ProposalsModule,
    QuoteSharesModule,
    ChatModule,
    ReviewsModule,
    RegionsModule,
    UploadsModule,
    NotificationsModule,
    AdminModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
