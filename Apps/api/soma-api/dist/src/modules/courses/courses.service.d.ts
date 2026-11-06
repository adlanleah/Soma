import { TenantConnectionService } from '../../database/tenant-connection/tenant-connection.service';
import { JwtPayload } from '../../common/interfaces/jwt-payload';
import { CreateCourseDto } from './dto/create-course.dto';
export declare class CoursesService {
    private tenantConnection;
    constructor(tenantConnection: TenantConnectionService);
    create(admin: JwtPayload, dto: CreateCourseDto): Promise<{
        name: string;
        id: string;
        description: string | null;
        cohortId: string | null;
    }>;
    findAll(admin: JwtPayload): Promise<({
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
