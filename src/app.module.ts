import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { LlmModule } from './llm/llm.module';
import { ChatbotModule } from './chatbot/chatbot.module';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   // type: 'postgres',
    //   // host: process.env.DB_HOST,
    //   // port: parseInt(process.env.DB_PORT ?? '5432'),
    //   // username: process.env.DB_USERNAME,
    //   // password: process.env.DB_PASSWORD,
    //   // database: process.env.DB_NAME,
    //   // entities: [],
    //   synchronize: true,
    // }),
    LlmModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
