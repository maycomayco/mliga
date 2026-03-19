-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "team1player1Id" TEXT NOT NULL,
    "team1player2Id" TEXT NOT NULL,
    "team2player1Id" TEXT NOT NULL,
    "team2player2Id" TEXT NOT NULL,
    "set1team1" INTEGER NOT NULL,
    "set1team2" INTEGER NOT NULL,
    "set2team1" INTEGER NOT NULL,
    "set2team2" INTEGER NOT NULL,
    "set3team1" INTEGER,
    "set3team2" INTEGER,
    "winnerTeam" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_team1player1Id_idx" ON "Match"("team1player1Id");

-- CreateIndex
CREATE INDEX "Match_team1player2Id_idx" ON "Match"("team1player2Id");

-- CreateIndex
CREATE INDEX "Match_team2player1Id_idx" ON "Match"("team2player1Id");

-- CreateIndex
CREATE INDEX "Match_team2player2Id_idx" ON "Match"("team2player2Id");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1player1Id_fkey" FOREIGN KEY ("team1player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1player2Id_fkey" FOREIGN KEY ("team1player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2player1Id_fkey" FOREIGN KEY ("team2player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2player2Id_fkey" FOREIGN KEY ("team2player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
