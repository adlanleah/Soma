"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserEmail = generateUserEmail;
exports.generateStudentCode = generateStudentCode;
exports.generateTempPassword = generateTempPassword;
function generateUserEmail(firstName, lastName, schoolEmailPrefix) {
    const first = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const last = lastName.toLowerCase().replace(/[^a-z]/g, '');
    return `${first}.${last}@${schoolEmailPrefix}.soma.com`;
}
function generateStudentCode(schoolEmailPrefix) {
    const prefix = schoolEmailPrefix.toUpperCase().slice(0, 4);
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-STU-${num}`;
}
function generateTempPassword(length = 12) {
    return Math.random().toString(36).slice(-length) + '!A1';
}
//# sourceMappingURL=generate-email.js.map