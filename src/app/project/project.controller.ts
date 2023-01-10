import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Project } from '@prisma/client';
import { GetCurrentUser } from 'src/common/decorator/auth.decorator';
import { UserIdentifier } from 'src/common/dto/auth.dto';
import { ConnectToProjectInCategories, CreateCategory, CreateProjectDto } from 'src/common/dto/project.dto';
import { AccessTokenGuard } from '../auth/jwt/jwt.guard';

import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
    constructor(
        private projectService: ProjectService,
    ){}

    @Post('/category')
    async createCategories
    (
        @Body() category: CreateCategory[]
    ){
        return await this.projectService.createCategoires(category)
    }

    @Post('/category/connect')
    async connectCategoryWithProject(
        @Body() dto: ConnectToProjectInCategories
    ){
        console.log(dto)
        return await this.projectService.connectCategoriesToProject(dto)
    }

    @UseGuards(AccessTokenGuard)
    @Post()
    async createProject(
        @Body() dto: CreateProjectDto,
        @GetCurrentUser()  userIdentifier : UserIdentifier   
    ){
        return await this.projectService.createProject(dto, userIdentifier)
    }    

    @UseGuards(AccessTokenGuard)
    @Get('/list/user')
    async getProjectByUserId(@GetCurrentUser() { userId } : UserIdentifier ):Promise<Project[]>
    {
        console.log(userId)
        return await this.projectService.userProjectList(userId)
    }
}
