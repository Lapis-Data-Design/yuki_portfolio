import { describe, it, expect } from "../tests/test-utils";
import {
    dashboardPathFor,
} from "./auth";

describe("dashboardPathFor", () => {
    it("returns the owner dashboard path for the owner role", () => {
        expect(dashboardPathFor("owner")).toBe("/dashboard/owner");
    });
    
    it("returns the admin dashboard path for the admin role", () => {
        expect(dashboardPathFor("admin")).toBe("/dashboard/admin");
    });
});