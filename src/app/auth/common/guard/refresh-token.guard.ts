import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuadrd extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
