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
    skill?: string[];   //임시
    mentorIntroduce?: string;
    portfolioLink?: string;
}