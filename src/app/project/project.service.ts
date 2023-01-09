import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClient, Category, Skill, CategoriesOnProject, Project, StacksOnProject } from '@prisma/client';
import { ConnectToProjectInCategories, ConnectToStackInProject, CreateCategory, CreateProjectDto, CreateProjectStaCk} from 'src/common/dto/project.dto';



@Injectable()
export class ProjectService {
    prisma = new PrismaClient();

    async createCategoires(categoryData: CreateCategory[]): Promise<Category[]> {

        let findArray = []
        
        const response = categoryData.map((oneOfCategory)=> {
            const { name } = oneOfCategory
            findArray.push(name.toUpperCase()); 
            return name.toUpperCase()
        })
        
        try{
            const isExsitsCategory = await this.prisma.category.findMany({
                where: {
                    name: { in: findArray },
                }
            })
        
            if(isExsitsCategory.length === response.length) return isExsitsCategory
                
            isExsitsCategory.forEach((source) => {
                for(let i = 0; i < response.length; i++){ 
                    if (response[i] === source.name) { 
                      response.splice(i, 1); 
                      i--; 
                    }
                }
            })

            const categories = await this.prisma.$transaction(
                response.map((data) => this.prisma.category.create({ data: {
                    name: data
                } }))
            );

            return [...isExsitsCategory ,...categories]

    
        }catch(err){
            throw new HttpException(err.message, 500)
        }  
    }

    async createProjectStack(stack:CreateProjectStaCk[]): Promise<Skill[]>{
        let findArray = []
        
        const response = stack.map((oneOfStack)=> {
            const { stack } = oneOfStack
            findArray.push(stack.toUpperCase()); 
            return stack.toUpperCase()
        })
        
        try{
            const isExsitsStack = await this.prisma.skill.findMany({
                where: {
                    name: { in: findArray },
                }
            })
        
            if(isExsitsStack.length === response.length) return isExsitsStack
                
            isExsitsStack.forEach((source) => {
                for(let i = 0; i < response.length; i++){ 
                    if (response[i] === source.name) { 
                      response.splice(i, 1); 
                      i--; 
                    }
                }
            })

            const createStacks = await this.prisma.$transaction(
                response.map((data) => this.prisma.skill.create({ data: {
                    name: data
                } }))
            );

            return [...isExsitsStack ,...createStacks]
        }catch(err){
            throw new HttpException(err.message, 500)
        }
    }

    async connectCategoriesToProject(dto: ConnectToProjectInCategories): Promise<CategoriesOnProject[]>{
        const { projectId, category } = dto
        try{
            const createCategory = await this.createCategoires(category)

            
            const response = await this.prisma.$transaction(
                createCategory.map((data) => this.prisma.categoriesOnProject.create({ 
                    data: {
                        projectId,
                        categoryId: data.id
                    }
                 }))
            );

            return response
                
        }catch(err){
            throw new HttpException(err.message, 500)
        }
    }

    async connectStackToProject(dto: ConnectToStackInProject): Promise<StacksOnProject[]>{
        const { projectId, stack } = dto
        try{
            const createStacks = await this.createProjectStack(stack)

            
            const response = await this.prisma.$transaction(
                createStacks.map((data) => this.prisma.stacksOnProject.create({ 
                    data: {
                        projectId,
                        skillId: data.id
                    }
                 }))
            );

            return response
                
        }catch(err){
            throw new HttpException(err.message, 500)
        }
    }

    async createProject(dto: CreateProjectDto): Promise<Project>{
        const { title, startDate, endDate, projectDetail, userId:accountId} = dto

        try{
            const response = await this.prisma.project.create({
                data: {
                    title,
                    startDate,
                    endDate,
                    projectDetail,
                    Account: {
                        connect: {
                            id: accountId
                        }
                    }
                }
            })

            return response
        } catch(err){
            throw new HttpException(err.message, 500)
        }
    }
}
