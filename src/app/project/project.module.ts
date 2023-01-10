import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessTokenStrategy, JwtRefreshTokenStrategy } from '../auth/jwt/jwt.strategy';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

@Module({
  imports: [PassportModule],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
