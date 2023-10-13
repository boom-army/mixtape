import React, { useEffect, useState } from "react";
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
            <TableCell sx={{ fontWeight: 100 }}>MixtApe Address</TableCell>
            <TableCell sx={{ fontWeight: 100 }} align="right">
              Points
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topItems.map((item, index) => {
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
                    {index < 3 ? (
                      <WorkspacePremiumIcon
                        sx={{ fill: medalColor, marginRight: 1 }}
                      />
                    ) : (
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
                      <Typography variant="body2">{user?.id}</Typography>
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
