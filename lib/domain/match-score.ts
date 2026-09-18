export type MatchSet = [number, number];

export type MatchScore = {
  team1Sets: number;
  team2Sets: number;
  winnerTeam: 0 | 1 | 2;
  set3Played: boolean;
};

export type MatchSets = {
  set1: MatchSet;
  set2: MatchSet;
  set3: MatchSet;
};

/**
 * Computes the scoring result for a match from the raw set scores.
 *
 * @param sets - The three set scores as [team1Points, team2Points].
 * @param isDraw - True when the match ended without a third set at 1-1.
 *                 The caller (Zod schema) is responsible for validating
 *                 that the first two sets are actually 1-1 when this is true.
 * @returns The resolved score, including set counts, winner team, and whether
 *          the third set was played.
 */
export function scoreMatch(sets: MatchSets, isDraw: boolean): MatchScore {
  const team1Sets = countWonSets(sets, 0);
  const team2Sets = countWonSets(sets, 1);

  const set3Played = !isDraw && team1Sets === 1 && team2Sets === 1;

  const scoreAfterTwo = { team1Sets, team2Sets };
  const finalScore = set3Played
    ? applySet3(scoreAfterTwo, sets.set3)
    : scoreAfterTwo;

  const winnerTeam = isDraw
    ? 0
    : finalScore.team1Sets > finalScore.team2Sets
      ? 1
      : 2;

  return {
    team1Sets: finalScore.team1Sets,
    team2Sets: finalScore.team2Sets,
    winnerTeam,
    set3Played,
  };
}

function countWonSets(
  sets: MatchSets,
  teamIndex: 0 | 1
): number {
  let won = 0;
  if (sets.set1[teamIndex] > sets.set1[1 - teamIndex]) won++;
  if (sets.set2[teamIndex] > sets.set2[1 - teamIndex]) won++;
  return won;
}

function applySet3(
  score: { team1Sets: number; team2Sets: number },
  set3: MatchSet
): { team1Sets: number; team2Sets: number } {
  if (set3[0] > set3[1]) {
    return { team1Sets: score.team1Sets + 1, team2Sets: score.team2Sets };
  }
  return { team1Sets: score.team1Sets, team2Sets: score.team2Sets + 1 };
}
