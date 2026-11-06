import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { QuizAttemptService } from './quiz-attempt/quiz-attempt.service';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, QuizAttemptService],
})
export class QuizzesModule {}
