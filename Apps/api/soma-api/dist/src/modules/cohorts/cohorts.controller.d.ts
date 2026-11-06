import * as jwtPayload from '../../common/interfaces/jwt-payload';
import { CohortsService } from './cohorts.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
export declare class CohortsController {
    private cohortsService;
    constructor(cohortsService: CohortsService);
    create(admin: jwtPayload.JwtPayload, dto: CreateCohortDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    }>;
    findAll(user: jwtPayload.JwtPayload): Promise<({
        students: {
            id: string;
            userId: string;
            grade: string;
            ageGroup: string;
            studentCode: string;
            classId: string | null;
        }[];
        courses: {
            name: string;
            id: string;
            description: string | null;
            cohortId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    })[]>;
    findOne(user: jwtPayload.JwtPayload, id: string): Promise<{
        students: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                email: string;
                passwordHash: string;
                role: import(".prisma/tenant-client/client").$Enums.UserRole;
                status: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            userId: string;
            grade: string;
            ageGroup: string;
            studentCode: string;
            classId: string | null;
        })[];
        courses: {
            name: string;
            id: string;
            description: string | null;
            cohortId: string | null;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        endDate: Date;
    }>;
}
