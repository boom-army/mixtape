import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

export default function TopMints() {
  const [topMints, setTopMints] = useState([]);

  useEffect(() => {
    const fetchTopMints = async () => {
      try {
        const response = await fetch('/api/points/mix-leaders');
        const data = await response.json();
        console.log('data', data);
        
        setTopMints(data.topMints);
      } catch (error) {
        console.error('Failed to fetch top mints:', error);
      }
    };
    fetchTopMints();
  }, []);

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Mint Address</TableCell>
            <TableCell align="right">Points</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topMints.map((row: any) => (
            <TableRow key={row.mintAddress}>
              <TableCell component="th" scope="row">
                {row.mintAddress}
              </TableCell>
              <TableCell align="right">{row.totalPoints}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}