import { describe, it, expect } from "vitest";
import { scoreMatch } from "./match-score";

describe("scoreMatch", () => {
  describe("when the match ends in two sets", () => {
    it("returns team 1 as the winner when team 1 wins both sets", () => {
      const result = scoreMatch(
        { set1: [6, 4], set2: [6, 3], set3: [0, 0] },
        false
      );

      expect(result).toEqual({
        team1Sets: 2,
        team2Sets: 0,
        winnerTeam: 1,
        set3Played: false,
      });
    });

    it("returns team 2 as the winner when team 2 wins both sets", () => {
      const result = scoreMatch(
        { set1: [3, 6], set2: [2, 6], set3: [0, 0] },
        false
      );

      expect(result).toEqual({
        team1Sets: 0,
        team2Sets: 2,
        winnerTeam: 2,
        set3Played: false,
      });
    });
  });

  describe("when the first two sets are split", () => {
    it("plays and counts set 3 when isDraw is false", () => {
      const result = scoreMatch(
        { set1: [6, 3], set2: [2, 6], set3: [7, 5] },
        false
      );

      expect(result).toEqual({
        team1Sets: 2,
        team2Sets: 1,
        winnerTeam: 1,
        set3Played: true,
      });
    });

    it("awards set 3 to team 2 when team 2 wins it", () => {
      const result = scoreMatch(
        { set1: [6, 3], set2: [2, 6], set3: [4, 6] },
        false
      );

      expect(result).toEqual({
        team1Sets: 1,
        team2Sets: 2,
        winnerTeam: 2,
        set3Played: true,
      });
    });
  });

  describe("when isDraw is true", () => {
    it("returns winnerTeam 0 and does not play set 3", () => {
      const result = scoreMatch(
        { set1: [6, 3], set2: [2, 6], set3: [7, 5] },
        true
      );

      expect(result).toEqual({
        team1Sets: 1,
        team2Sets: 1,
        winnerTeam: 0,
        set3Played: false,
      });
    });

    it("ignores set 3 even if it has a clear winner", () => {
      const result = scoreMatch(
        { set1: [3, 6], set2: [6, 2], set3: [0, 6] },
        true
      );

      expect(result).toEqual({
        team1Sets: 1,
        team2Sets: 1,
        winnerTeam: 0,
        set3Played: false,
      });
    });

    it("does not play set 3 even if the first two sets were not split", () => {
      // isDraw is an explicit domain flag: the caller asserts the match
      // concluded without a third set. set3Played must remain false.
      const result = scoreMatch(
        { set1: [6, 3], set2: [6, 2], set3: [0, 6] },
        true
      );

      expect(result).toEqual({
        team1Sets: 2,
        team2Sets: 0,
        winnerTeam: 0,
        set3Played: false,
      });
    });
  });

  describe("ties within a set", () => {
    it("does not award a set to either team when scores are equal", () => {
      const result = scoreMatch(
        { set1: [6, 6], set2: [6, 4], set3: [0, 0] },
        false
      );

      expect(result).toEqual({
        team1Sets: 1,
        team2Sets: 0,
        winnerTeam: 1,
        set3Played: false,
      });
    });
  });
});
