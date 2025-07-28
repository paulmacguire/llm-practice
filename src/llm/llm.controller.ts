import { Controller, Get } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Get('response')
  getResponse() {
    return this.llmService.getResponse();
  }

  @Get('response-streaming')
  getResponseWithStreaming() {
    return this.llmService.getResponseWithStreaming();
  }

  @Get('response-prompt-template')
  getResponseWithPromptTemplate() {
    return this.llmService.getResponseWithPromptTemplate();
  }
}
