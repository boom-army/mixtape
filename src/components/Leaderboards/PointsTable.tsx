import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Link from "next/link";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

export default function PointsTable() {
  const [topMints, setTopMints] = useState([]);

  useEffect(() => {
    const fetchTopMints = async () => {
      try {
        const response = await fetch("/api/points/mix-leaders");
        const data = await response.json();
        console.log("data", data);

        setTopMints(data.topMints);
      } catch (error) {
        console.error("Failed to fetch top mints:", error);
      }
    };
    fetchTopMints();
  }, []);

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
          {topMints.map((row: any, index: number) => {
            const { totalPoints } = row;
            const { nftMetadata, mintAddress } = row.mint;
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
              <TableRow key={mintAddress} style={{ backgroundColor }}>
                <TableCell component="th" scope="row">
                  <Box display="flex" alignItems="center">
                    {index < 3 && (
                      <WorkspacePremiumIcon
                        sx={{ fill: medalColor, marginRight: 1 }}
                      />
                    )}
                    <Link href={`/sol/${mintAddress}`}>{nftMetadata.name} | {nftMetadata.description}</Link>
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
