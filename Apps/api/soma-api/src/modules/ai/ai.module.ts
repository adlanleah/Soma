import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiSafetyService } from './ai-safety/ai-safety.service';
import { AiSessionService } from './ai-session/ai-session.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiSafetyService, AiSessionService],
})
export class AiModule {}
