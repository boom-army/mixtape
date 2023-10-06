-- CreateTable
CREATE TABLE "NftEmote" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "image" TEXT NOT NULL,
    "cImage" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "description" TEXT,
    "symbol" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftEmote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintEmote" (
    "id" SERIAL NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "emoteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MintEmote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" SERIAL NOT NULL,
    "points" INTEGER NOT NULL,
    "awardedId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "mintAddress" TEXT,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NftEmote_name_key" ON "NftEmote"("name");

-- CreateIndex
CREATE INDEX "NftEmote_name_idx" ON "NftEmote"("name");

-- AddForeignKey
ALTER TABLE "MintEmote" ADD CONSTRAINT "MintEmote_mintAddress_fkey" FOREIGN KEY ("mintAddress") REFERENCES "Mint"("mintAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintEmote" ADD CONSTRAINT "MintEmote_emoteId_fkey" FOREIGN KEY ("emoteId") REFERENCES "NftEmote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintEmote" ADD CONSTRAINT "MintEmote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_mintAddress_fkey" FOREIGN KEY ("mintAddress") REFERENCES "Mint"("mintAddress") ON DELETE SET NULL ON UPDATE CASCADE;
