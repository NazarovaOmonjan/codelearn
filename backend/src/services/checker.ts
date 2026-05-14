interface CheckResult {
  isCorrect: boolean;
  output?: string;
  error?: string;
}

/**
 * Checks a user's solution against the expected solution.
 * Normalizes both and compares.
 */
export async function checkSolution(
  userCode: string,
  language: string,
  solutions: Record<string, string>
): Promise<CheckResult> {
  try {
    const expectedSolution = solutions[language];

    if (!expectedSolution) {
      return { isCorrect: false, error: "No reference solution available for this language" };
    }

    const normalizedUser = normalizeSolution(userCode, language);
    const normalizedExpected = normalizeSolution(expectedSolution, language);

    const isCorrect = normalizedUser === normalizedExpected;

    return {
      isCorrect,
      output: isCorrect ? "Solution accepted" : "Wrong answer",
      error: isCorrect ? undefined : "Your solution does not match the expected output",
    };
  } catch (error) {
    return { isCorrect: false, error: "Error checking solution" };
  }
}

function normalizeSolution(code: string, language: string): string {
  let normalized = code.trim().toLowerCase();
  normalized = normalized.replace(/--.*$/gm, "");
  normalized = normalized.replace(/\/\/.*$/gm, "");
  normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, "");
  normalized = normalized.replace(/\s+/g, " ").trim();

  if (language === "SQL") {
    normalized = normalized.replace(/;+$/, "");
  }

  return normalized;
}
