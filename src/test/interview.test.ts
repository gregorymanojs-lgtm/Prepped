import { describe, it, expect } from "vitest";
import { parseAIResponse, buildSystemMessage } from "@/lib/parseResponse";
import { getSimulatedFirstQuestion, generateSimulatedResponse } from "@/lib/simulation";
import { getGroqApiKey, setGroqApiKey } from "@/lib/groq";

describe("Interview parsing & simulation", () => {
  it("builds a system message with setup parameters", () => {
    const setup = {
      role: "Software Engineer",
      type: "Technical",
      difficulty: "Senior",
      jobDescription: "React + Node experience required",
      resumeText: "Led migration to microservices",
    };
    const sys = buildSystemMessage(setup);
    expect(sys).toContain("Senior level Technical interview for a Software Engineer");
    expect(sys).toContain("React + Node experience required");
    expect(sys).toContain("Led migration to microservices");
  });

  it("parses AI formatted response correctly", () => {
    const raw = `Strength: Clear explanation of Redis caching and distributed locks.
Gap: Missed discussing network partition edge cases.
Score: 8 / 10
Ideal Answer: Layered caching with TTL and local fallback.

Next Question: How do you handle database migrations with zero downtime?`;

    const parsed = parseAIResponse(raw);
    expect(parsed.feedback).not.toBeNull();
    expect(parsed.feedback?.score).toBe(8);
    expect(parsed.feedback?.strength).toContain("Clear explanation");
    expect(parsed.feedback?.gap).toContain("Missed discussing");
    expect(parsed.feedback?.idealAnswer).toContain("Layered caching");
    expect(parsed.nextQuestion).toContain("How do you handle database migrations");
  });

  it("provides simulated first question and evaluates candidate answer", () => {
    const setup = {
      role: "Software Engineer",
      type: "Technical",
      difficulty: "Senior",
    };

    const firstQ = getSimulatedFirstQuestion(setup);
    expect(firstQ).toBeTruthy();
    expect(typeof firstQ).toBe("string");

    const sim = generateSimulatedResponse(
      "In my previous project, we reduced p99 latency by 35% by implementing Redis caching with exponential backoff and database indexing.",
      0,
      setup
    );

    expect(sim.feedback).toBeTruthy();
    expect(sim.feedback.score).toBeGreaterThanOrEqual(6);
    expect(sim.feedback.strength).toBeTruthy();
    expect(sim.feedback.gap).toBeTruthy();
    expect(sim.feedback.idealAnswer).toBeTruthy();
  });

  it("manages Groq API key in storage", () => {
    setGroqApiKey("gsk_test_key_12345");
    expect(getGroqApiKey()).toBe("gsk_test_key_12345");
    setGroqApiKey("");
    expect(getGroqApiKey()).toBeNull();
  });
});
