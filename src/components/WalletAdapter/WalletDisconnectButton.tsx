import type { ButtonProps } from '@mui/material';
import React from 'react';
import { BaseWalletDisconnectButton } from './BaseWalletDisconnectButton';

const LABELS = {
    disconnecting: 'Disconnecting ...',
    'has-wallet': 'Disconnect',
    'no-wallet': 'Disconnect Wallet',
} as const;

export function WalletDisconnectButton(props: ButtonProps) {
    return <BaseWalletDisconnectButton {...props} labels={LABELS} />;
}
