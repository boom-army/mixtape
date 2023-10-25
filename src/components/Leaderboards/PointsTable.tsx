import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import Image from "next/image";
import { truncatePublicKey } from "../../utils";

interface TopItem {
  mint?: any;
  user?: any;
  totalPoints: number;
}

export default function PointsTable({ topItems }: { topItems: TopItem[] }) {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {topItems && topItems.length > 0 && topItems[0]?.mint ? (
              <TableCell sx={{ fontWeight: 100 }}>Mixtape Address</TableCell>
            ) : (
              <TableCell sx={{ fontWeight: 100 }}>Wallet Address</TableCell>
            )}
            <TableCell sx={{ fontWeight: 100 }} align="right">
              Points
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topItems &&
            topItems.length > 0 &&
            topItems.map((item, index) => {
              const { totalPoints } = item;
              const { nftMetadata, mintAddress } = item.mint || {};
              const { name, description, properties } = nftMetadata || {};
              const user = item.user || null;
              const link = mintAddress ? `/sol/${mintAddress}` : null;

              let backgroundColor, medalColor;
              if (index === 0) {
                backgroundColor = "#fff8d2";
                medalColor = "gold";
              } else if (index === 1) {
                backgroundColor = "#f2f2f2";
                medalColor = "silver";
              } else if (index === 2) {
                backgroundColor = "#ffeecf";
                medalColor = "#ffa500";
              }

              return (
                <TableRow
                  key={mintAddress || item.user?.id}
                  style={{ backgroundColor }}
                >
                  <TableCell component="th" scope="row">
                    <Box display="flex" alignItems="center">
                      {nftMetadata && (
                        <Box mr={1}>
                          <Image
                            src={
                              properties?.files[0]?.uri ||
                              "/images/mixtape-1024.png"
                            }
                            alt={name}
                            width={22}
                            height={22}
                          />
                        </Box>
                      )}
                      {link ? (
                        <Link href={link}>
                          {name} | {description}
                        </Link>
                      ) : (
                        <Typography variant="body2">
                          {truncatePublicKey(user?.id, 5)}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{totalPoints}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
