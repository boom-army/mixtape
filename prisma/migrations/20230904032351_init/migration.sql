-- CreateTable
CREATE TABLE "User" (
    "id" VARCHAR(44) NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mint" (
    "id" SERIAL NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "nftMetadata" JSONB NOT NULL,
    "template" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "location" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Mint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mint_mintAddress_key" ON "Mint"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Mint_signature_key" ON "Mint"("signature");

-- AddForeignKey
ALTER TABLE "Mint" ADD CONSTRAINT "Mint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
