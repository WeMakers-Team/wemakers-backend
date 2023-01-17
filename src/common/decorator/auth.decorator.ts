import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserIdentifier } from '../dto/auth.dto';

export const GetCurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): UserIdentifier => {
    const req = ctx.switchToHttp().getRequest();

    const resposne: UserIdentifier = {
      userId : req[data] || req.user,
    }
    
    return resposne
  },
);
