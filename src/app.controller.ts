import { Controller, Get, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get()
  @Render('index')
  root() {
    const chatServerIP = this.configService.get<string>('CHAT_SERVER_IP');
    console.log(chatServerIP);
    return { chatServerIP };
  }
}
