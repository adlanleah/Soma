export declare class CreateSchoolDto {
    name: string;
    country: string;
    city: string;
    address: string;
    phone: string;
    website?: string;
    plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPhone: string;
}
