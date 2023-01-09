import { Body, Controller, Post } from '@nestjs/common';
import { ConnectToProjectInCategories, CreateCategory, CreateProjectDto } from 'src/common/dto/project.dto';

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

    @Post('/create')
    async createProject(
        @Body() dto: CreateProjectDto
        
    ){
        const { title, startDate, endDate, projectDetail, userId } = dto
        return await this.projectService.createProject({title, startDate, endDate, projectDetail, userId})
    }
}
