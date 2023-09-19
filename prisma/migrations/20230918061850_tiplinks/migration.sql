-- CreateTable
CREATE TABLE "TipLink" (
    "id" SERIAL NOT NULL,
    "tipLink" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mint" TEXT NOT NULL,

    CONSTRAINT "TipLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TipLink_tipLink_key" ON "TipLink"("tipLink");

-- CreateIndex
CREATE UNIQUE INDEX "TipLink_signature_key" ON "TipLink"("signature");

-- AddForeignKey
ALTER TABLE "TipLink" ADD CONSTRAINT "TipLink_mint_fkey" FOREIGN KEY ("mintAddress") REFERENCES "Mint"("mintAddress") ON DELETE RESTRICT ON UPDATE CASCADE;