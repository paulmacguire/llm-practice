import { Injectable } from '@nestjs/common';
import { ChatGroq } from '@langchain/groq';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class LlmService {
  private model: ChatGroq;
  private systemTemplate: string;
  private promptTemplate: ChatPromptTemplate;

  constructor() {
    this.model = new ChatGroq({
      model: process.env.GROQ_MODEL ?? '',
      apiKey: process.env.GROQ_API_KEY ?? '',
      temperature: 0,
    });
    this.systemTemplate =
      'Translate the following from English into {language}';

    this.promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', this.systemTemplate],
      ['user', '{text}'],
    ]);
  }

  async getResponse() {
    const messages = [
      new SystemMessage('Translate the following from English into Italian'),
      new HumanMessage('hi!'),
    ];

    // The following are equivalent:
    // await this.model.invoke('Hello');
    // await this.model.invoke([{ role: 'user', content: 'Hello' }]);
    // await this.model.invoke([new HumanMessage('Hello')]);

    const response = await this.model.invoke(messages);
    return response;
  }

  async getResponseWithStreaming() {
    const messages = [
      new SystemMessage('Translate the following from English into Italian'),
      new HumanMessage('hi!'),
    ];

    const stream = await this.model.stream(messages);
    for await (const chunk of stream) {
      console.log(chunk);
    }
    return 'Streaming completed';
  }

  async getResponseWithPromptTemplate() {
    const promptValue = await this.promptTemplate.invoke({
      language: 'Italian',
      text: 'hi!',
    });

    const response = await this.model.invoke(promptValue);
    return response.content;
  }
}
