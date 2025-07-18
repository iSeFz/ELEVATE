export type Role = 'admin' | 'brandManager' | 'brandOwner' | 'customer';

export const roles: Record<Role, string> = {
    admin: 'admin',
    brandManager: 'brandManager',
    brandOwner: 'brandOwner',
    customer: 'customer',
}
