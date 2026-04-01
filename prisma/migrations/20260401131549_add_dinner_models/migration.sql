-- CreateTable
CREATE TABLE "ArgentinianDinner" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArgentinianDinner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DinnerAttendance" (
    "id" TEXT NOT NULL,
    "dinnerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DinnerAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArgentinianDinner_date_idx" ON "ArgentinianDinner"("date");

-- CreateIndex
CREATE INDEX "DinnerAttendance_dinnerId_idx" ON "DinnerAttendance"("dinnerId");

-- CreateIndex
CREATE INDEX "DinnerAttendance_userId_idx" ON "DinnerAttendance"("userId");

-- CreateUnique
ALTER TABLE "DinnerAttendance" ADD CONSTRAINT "DinnerAttendance_dinnerId_userId_key" UNIQUE ("dinnerId", "userId");

-- AddForeignKey
ALTER TABLE "DinnerAttendance" ADD CONSTRAINT "DinnerAttendance_dinnerId_fkey" FOREIGN KEY ("dinnerId") REFERENCES "ArgentinianDinner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DinnerAttendance" ADD CONSTRAINT "DinnerAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;