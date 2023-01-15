import { PartialType } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { AuthCreateDto } from "./auth.dto";

export class UpdateAccountDto extends PartialType(AuthCreateDto) {
    introduce?: string;
}

export class UpdateMentorProfileDto {
    major?: string;
    company?: string;
    category?: string[]; //임시
    skillsId?: number[];    //id
    mentorIntroduce?: string;
    portfolioLink?: string;
}

export class CreateSkillDto {
    name: string;
}