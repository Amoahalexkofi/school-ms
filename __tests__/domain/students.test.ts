import {
  generateAdmissionNumber,
  validateStudentAge,
  formatStudentName,
  type AdmissionContext,
} from "@/lib/domain/students";

describe("generateAdmissionNumber", () => {
  const ctx: AdmissionContext = { sessionYear: 2025, sequenceNumber: 1 };

  it("generates admission number with year and zero-padded sequence", () => {
    expect(generateAdmissionNumber(ctx)).toBe("ADM-2025-0001");
  });

  it("pads sequence to 4 digits", () => {
    expect(generateAdmissionNumber({ sessionYear: 2025, sequenceNumber: 42 })).toBe(
      "ADM-2025-0042"
    );
  });

  it("handles large sequence numbers without truncation", () => {
    expect(generateAdmissionNumber({ sessionYear: 2025, sequenceNumber: 10000 })).toBe(
      "ADM-2025-10000"
    );
  });

  it("throws when sequenceNumber is less than 1", () => {
    expect(() =>
      generateAdmissionNumber({ sessionYear: 2025, sequenceNumber: 0 })
    ).toThrow("sequenceNumber must be at least 1");
  });

  it("throws when sessionYear is invalid (< 2000 or > 2100)", () => {
    expect(() =>
      generateAdmissionNumber({ sessionYear: 1999, sequenceNumber: 1 })
    ).toThrow("invalid sessionYear");
    expect(() =>
      generateAdmissionNumber({ sessionYear: 2101, sequenceNumber: 1 })
    ).toThrow("invalid sessionYear");
  });

  it("accepts an optional prefix override", () => {
    expect(
      generateAdmissionNumber({ sessionYear: 2025, sequenceNumber: 5 }, "STU")
    ).toBe("STU-2025-0005");
  });
});

describe("validateStudentAge", () => {
  const today = new Date("2025-06-03");

  it("passes for a student between 3 and 25 years old", () => {
    const dob = new Date("2015-01-01"); // 10 years old
    expect(() => validateStudentAge(dob, today)).not.toThrow();
  });

  it("throws when student is younger than 3", () => {
    const dob = new Date("2024-01-01"); // ~1.5 years
    expect(() => validateStudentAge(dob, today)).toThrow("student must be at least 3 years old");
  });

  it("throws when student is older than 25", () => {
    const dob = new Date("1998-01-01"); // 27 years
    expect(() => validateStudentAge(dob, today)).toThrow("student cannot be older than 25");
  });

  it("throws when date of birth is in the future", () => {
    const dob = new Date("2030-01-01");
    expect(() => validateStudentAge(dob, today)).toThrow("date of birth cannot be in the future");
  });

  it("passes for exactly 3 years old", () => {
    const dob = new Date("2022-06-03");
    expect(() => validateStudentAge(dob, today)).not.toThrow();
  });
});

describe("formatStudentName", () => {
  it("trims and title-cases firstName and lastName", () => {
    expect(formatStudentName("  john  ", "  doe  ")).toEqual({
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("handles multi-word names", () => {
    expect(formatStudentName("mary anne", "van der berg")).toEqual({
      firstName: "Mary Anne",
      lastName: "Van Der Berg",
    });
  });

  it("throws when firstName is empty", () => {
    expect(() => formatStudentName("", "Doe")).toThrow("firstName is required");
  });

  it("throws when lastName is empty", () => {
    expect(() => formatStudentName("John", "  ")).toThrow("lastName is required");
  });
});
