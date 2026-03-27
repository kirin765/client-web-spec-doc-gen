import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { CustomersModule } from './modules/customers/customers.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import configuration from './common/config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
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
    RegionsModule,
    ProposalsModule,
    QuoteSharesModule,
    ReviewsModule,
    UploadsModule,
    NotificationsModule,
    AdminModule,
    StorageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
