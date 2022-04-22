import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Backdrop, Button, CircularProgress, Container, FormControl, TextField, Typography } from '@mui/material';

import { useMetaMask } from 'metamask-react';

import { NavBar } from '@components';

import { Swap2pInterface, addressRegexp, ERC20Interface, swap2pAddress } from 'utils';
import { useSnackbar } from 'notistack';
import { providers } from 'ethers';

const CreateTradePage: NextPage = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  const YOwnerDefault = '0x0000000000000000000000000000000000000000';
  const [XAssetAddress, setXAssetAddress] = useState('');
  const [XAmount, setXAmount] = useState('');
  const [YOwner, setYOwner] = useState('');
  const [YAssetAddress, setYAssetAddress] = useState('');
  const [YAmount, setYAmount] = useState('');

  const [buttonStatus, setButtonStatus] = useState<'create' | 'in_progress' | 'completed'>('create');

  useEffect(() => {
    const {
      XAssetAddress: XAssetAddressQuery,
      XAmount: XAmountQuery,
      YOwner: YOwnerQuery,
      YAssetAddress: YAssetAddressQuery,
      YAmount: YAmountQuery,
    } = router.query;

    setXAssetAddress(XAssetAddressQuery as string ?? '');
    setXAmount(XAmountQuery as string ?? '');
    setYOwner(YOwnerQuery as string ?? '');
    setYAssetAddress(YAssetAddressQuery as string ?? '');
    setYAmount(YAmountQuery as string ?? '');
  }, [router.isReady]);

  const XAssetAddressMatch = XAssetAddress.match(addressRegexp);
  const YOwnerMatch = YOwner.length ? YOwner.match(addressRegexp) : true;
  const YAssetAddressMatch = YAssetAddress.match(addressRegexp);

  const canCreate = Boolean(XAssetAddressMatch && XAmount !== null && YOwnerMatch && YAssetAddressMatch && YAmount !== null);

  const handleSubmit = async () => {
    try {
      setButtonStatus('in_progress');

      const provider = new providers.Web3Provider(ethereum)
      let tx;

      const approveData = ERC20Interface.encodeFunctionData('approve', [swap2pAddress, XAmount]);
      tx = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: XAssetAddress,
          from: ethereum.selectedAddress,
          chainId: chainId,
          data: approveData,
        }],
      });

      await provider.waitForTransaction(tx);

      // get fee
      const getFeeData = Swap2pInterface.encodeFunctionData('fee', []);
      const feeData = await ethereum.request({
        method: 'eth_call',
        params: [{
          to: swap2pAddress,
          from: ethereum.selectedAddress,
          chainId: chainId,
          data: getFeeData,
        }, 'latest'],
      });

      const [fee] = Swap2pInterface.decodeFunctionResult('fee', feeData);
      const escrowData = Swap2pInterface.encodeFunctionData('createEscrow', [XAssetAddress, XAmount, YAssetAddress, YAmount, YOwner.length ? YOwner : YOwnerDefault]);
      tx = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: swap2pAddress,
          from: ethereum.selectedAddress,
          chainId: chainId,
          value: fee.toString(),
          data: escrowData,
        }],
      });

      await provider.waitForTransaction(tx);

      setButtonStatus('completed');
    } catch (error) {
      setButtonStatus('create');
      enqueueSnackbar('Something went wrong :(', { variant: 'error' });
    }
  };

  return (
    <Container>
      <Head>
        <title>Swap2p - Create Escrow</title>
        <meta name="description" content="Swap2p escrow service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <FormControl component='form' style={{ display: status === 'connected' ? 'flex' : 'none' }}>
        <TextField
          label='ChainId'
          value={chainId ?? ''}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label='XOwner'
          value={account ?? ''}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          required
          label='XAssetAddress'
          value={XAssetAddress}
          onChange={e => setXAssetAddress(e.target.value)}
        />
        <TextField
          required
          label='XAmount'
          type="number"
          value={XAmount}
          onChange={e => setXAmount(e.target.value)}
        />
        <TextField
          label='YOwner'
          value={YOwner}
          onChange={e => setYOwner(e.target.value)}
        />
        <TextField
          required
          label='YAssetAddress'
          value={YAssetAddress}
          onChange={e => setYAssetAddress(e.target.value)}
        />
        <TextField
          required
          label='YAmount'
          type="number"
          value={YAmount}
          onChange={e => setYAmount(e.target.value)}
        />

        {
          {
            'create': <Button
              disabled={!canCreate}
              onClick={handleSubmit}
            ><Typography>Create</Typography></Button>,
            'in_progress': <Button
              disabled
              startIcon={<CircularProgress />}
            >
              In progress...
            </Button>,
            'completed': <Button
              disabled
            >
              Done!
            </Button>,
          }[buttonStatus]
        }
      </FormControl>
    </Container>
  );
};

export default CreateTradePage;
