import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Project } from '@prisma/client';
import { GetCurrentUser } from 'src/common/decorator/auth.decorator';
import { UserIdentifier } from 'src/common/dto/auth.dto';
import { ConnectToProjectInCategories, CreateCategory, ProjectDto, projectIdentifier, reviseProject } from 'src/common/dto/project.dto';
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

    @Post('/category/connect/:id')
    async connectCategoryWithProject(
        @Param('id', new ParseIntPipe()) projectId: number,
        @Body() {category}: ConnectToProjectInCategories,
    ){
        return await this.projectService.connectCategoriesToProject({category,projectId})
    }

    @UseGuards(AccessTokenGuard)
    @Post()
    async createProject(
        @GetCurrentUser() {userId}: UserIdentifier,
        @Body() dto: ProjectDto,
    ){ 
        return await this.projectService.createProject(dto, userId)
    }    

    @UseGuards(AccessTokenGuard)
    @Get('/list/user')
    async getProjectByUserId(@GetCurrentUser() userIdentifier: number ):Promise<Project[]>
    {   
        return await this.projectService.userProjectList(userIdentifier)
    }

    @Get()
    async projectList():Promise<Project[]>{
        return await this.projectService.projectList()
    }

    @UseGuards(AccessTokenGuard)
    @Patch('/:id')
    async updateProject(
        @GetCurrentUser() { userId }: UserIdentifier,
        @Body() dto: reviseProject,
        @Param('id', new ParseIntPipe()) projectId: number
    ){
        console.log(typeof projectId)
        return await this.projectService.updateProject(dto, {projectId, userId})
    }
}
