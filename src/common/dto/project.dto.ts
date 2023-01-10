import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class CreateCategory {
    @IsNotEmpty({
        context: {
          message: 'EMPTY_CATEGORY_NAME',
          code: '00002'
        },
    })
    name: string;   
}

export class CreateProjectStaCk {
    @IsNotEmpty({
        context: {
          message: 'EMPTY_CATEGORY_NAME',
          code: '00003'
        },
    })
    stack: string;   
}

export class ConnectToProjectInCategories {
    @IsNotEmpty({
        context: {
            message: 'PROJECT_ID_IS_NOT_EMPTY',
            code: '00004'
        },
    })
    projectId: number;
    
    category: CreateCategory[]
}

export class ConnectToStackInProject {
    @IsNotEmpty({
        context: {
            message: 'PROJECT_ID_IS_NOT_EMPTY',
            code: '00005'
        },
    })
    projectId: number;
    
    stack: CreateProjectStaCk[]
}

export class CreateProjectDto{
    @IsNotEmpty({
        context: {
            message: 'PROJECT_MUST_TO_NEED_TITLE',
            code: '00006'
        },
    })
    @IsString()
    title: string;

    @IsNotEmpty({
        context: {
            message: 'PROJECT_MUST_TO_NEED_START_DATE',
            code: '00007'
        },
    })
    @IsDate()
    startDate: Date;

    @IsNotEmpty({
        context: {
            message: 'PROJECT_MUST_TO_NEED_END_DATE',
            code: '00008'
        },
    })
    @IsDate()
    endDate: Date;
    @IsNotEmpty({
        context: {
            message: 'PROJECT_MUST_TO_NEED_PROJECT_DETAIL',
            code: '00009'
        },
    })
    @IsString()
    projectDetail: string;

    @IsNotEmpty({
        context: {
            message: 'DATA_CREATE_USER_NOT_DEFINED',
            code: '00010'
        },
    })
    @IsNumber()
    userId: number;
}

export class UserId {
    @IsNotEmpty({
        context: {
          message: 'EMPTY_CATEGORY_NAME',
          code: '00002'
        },
    })
    @IsNumber()
    userId: number;
}




