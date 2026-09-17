// Pure route-mapping helper

export type Role = "owner" | "admin";

export function dashboardPathFor(role: Role): string {
    return role === "owner" ? "/dashboard/owner" : "/dashboard/admin";
}