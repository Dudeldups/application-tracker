import { describe, expect, it } from "vitest";

import {
  communicationFormSchema,
  contactFormSchema,
  statusFormSchema,
} from "./forms";

describe("contactFormSchema", () => {
  it("rejects empty contact names", () => {
    const result = contactFormSchema.safeParse({
      name: "   ",
      role: "",
      email: "",
      phone: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Name is required.");
  });

  it("accepts a valid contact with an empty email", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Recruiter",
      role: "HR",
      email: "",
      phone: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email addresses", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane Recruiter",
      role: "HR",
      email: "not-an-email",
      phone: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      "Please enter a valid email address.",
    );
  });
});

describe("communicationFormSchema", () => {
  it("requires type and summary", () => {
    const result = communicationFormSchema.safeParse({
      type: "   ",
      direction: "incoming",
      summary: "   ",
      body: "",
      date: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(issue => issue.message)).toEqual([
      "Type is required.",
      "Summary is required.",
    ]);
  });
});

describe("statusFormSchema", () => {
  it("accepts valid application statuses", () => {
    const result = statusFormSchema.safeParse({
      status: "interview",
      note: "Panel booked",
    });

    expect(result.success).toBe(true);
  });
});
