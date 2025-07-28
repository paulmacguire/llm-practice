import { ChatGroq } from '@langchain/groq';
import { Injectable } from '@nestjs/common';
import {
  START,
  END,
  StateGraph,
  MessagesAnnotation,
  MemorySaver,
  Annotation,
} from '@langchain/langgraph';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  trimMessages,
} from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: 'human',
});

@Injectable()
export class ChatbotService {
  private readonly llm: ChatGroq;
  private readonly callModel;
  private readonly workflow;
  private readonly memory;
  private readonly app;
  private readonly promptTemplate;
  private readonly GraphAnnotation;

  constructor() {
    this.llm = new ChatGroq({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY || '',
      temperature: 0,
    });

    this.GraphAnnotation = Annotation.Root({
      ...MessagesAnnotation.spec,
      language: Annotation<string>(),
    });

    this.promptTemplate = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You talk like a pirate. Answer all questions to the best of your ability in {language}',
      ],
      ['placeholder', '{messages}'],
    ]);

    // Define the function that calls the model
    this.callModel = async (state: typeof this.GraphAnnotation.State) => {
      const trimmedMesage = await trimmer.invoke(state.messages);
      const prompt = await this.promptTemplate.invoke({
        messages: trimmedMesage,
        language: state.language,
      });
      const response = await this.llm.invoke(prompt);
      return { messages: [response] };
    };

    // Define a new graph
    this.workflow = new StateGraph(this.GraphAnnotation)
      .addNode('model', this.callModel)
      .addEdge(START, 'model')
      .addEdge('model', END);

    this.app = this.workflow.compile({
      checkpointer: new MemorySaver(),
    });
  }

  async chat(userMessage: string) {
    const config = {
      configurable: {
        thread_id: 'default-thread3',
      },
    };

    const messages = [
      new SystemMessage("you're a good assistant"),
      new HumanMessage("hi! I'm bob"),
      new AIMessage('hi!'),
      new HumanMessage('I like vanilla ice cream'),
      new AIMessage('nice'),
      new HumanMessage('whats 2 + 2'),
      new AIMessage('4'),
      new HumanMessage('thanks'),
      new AIMessage('no problem!'),
      new HumanMessage('having fun?'),
      new AIMessage('yes!'),
    ];

    const input = {
      messages: [...messages, new HumanMessage(userMessage)],
      language: 'Spanish',
    };

    const output = await this.app.invoke(input, config);
    return output.messages[output.messages.length - 1];
  }
}
