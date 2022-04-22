import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import axios from 'axios';
import { Backdrop, CircularProgress, Container } from '@mui/material';

import { useMetaMask } from 'metamask-react';

import { EscrowData, EscrowTable, MetaMaskConnectCard, NavBar } from '@components';

import { mapApiEscrowToEscrow } from 'utils';
import { useSnackbar } from 'notistack';

const TradeListPage: NextPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [escrows, setEscrows] = useState([] as EscrowData[]);

  useEffect(() => {
    if (status !== 'connected') {
      setEscrows([]);
      return;
    }

    setOpenBackdrop(true);
    const getEscrowsPromise = axios.get(process.env.NEXT_PUBLIC_BACKEND_BASE_URL + '/api/trades?offset=0&limit=10')
      .then(({ data }) => {
        setEscrows(data.map(mapApiEscrowToEscrow));
        setOpenBackdrop(false);
      })
      .catch((error) => {
        enqueueSnackbar('Something went wrong :(', { variant: 'error' });
        setOpenBackdrop(false);
      });

    return () => {
      setEscrows([]);
      setOpenBackdrop(false);
    }
  }, [status, chainId]);

  return (
    <Container>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Backdrop open={openBackdrop}>
        <CircularProgress />
      </Backdrop>

      <NavBar />

      <MetaMaskConnectCard />

      <Container style={{ display: status === 'connected' ? 'flex' : 'none' }}>
        <EscrowTable escrows={escrows} setters={{ setEscrows, setOpenBackdrop }} />
      </Container>
    </Container>
  );
}

export default TradeListPage;
