declare class BulkUserRow {
    firstName: string;
    lastName: string;
    role: 'TEACHER' | 'STUDENT' | 'PARENT';
    grade?: string;
    ageGroup?: string;
    linkedStudentEmail?: string;
}
export declare class BulkImportDto {
    users: BulkUserRow[];
}
export { BulkUserRow };
