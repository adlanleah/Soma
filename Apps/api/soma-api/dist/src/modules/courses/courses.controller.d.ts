import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
export declare class CoursesController {
    private coursesService;
    constructor(coursesService: CoursesService);
    create(admin: jwtPayload.JwtPayload, dto: CreateCourseDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        cohortId: string | null;
    }>;
    findAll(user: jwtPayload.JwtPayload): Promise<({
        cohort: {
            name: string;
            id: string;
            createdAt: Date;
            endDate: Date;
        } | null;
    } & {
        name: string;
        id: string;
        description: string | null;
        cohortId: string | null;
    })[]>;
}
