// React Form Validation using yup
import * as Yup from 'yup';

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import activityFill from '@iconify/icons-eva/activity-fill';
import backIcon from '@iconify/icons-eva/arrow-back-fill';
import closeIcon from '@iconify/icons-eva/close-square-fill';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
// material
import {
  Alert,
  AlertTitle,
  Card,
  Stack,
  Button,
  Container,
  Typography,
  Grid,
  Input,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Autocomplete,
  Box,
  IconButton
} from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DateTimePicker from '@mui/lab/DateTimePicker';
// React Form submission using Formik
import { useFormik, Form, FormikProvider } from 'formik';

// React-Notification to show the status for adding a new Venue
import { NotificationContainer, NotificationManager } from 'react-notifications';
// eslint-disable-next-line import/no-unresolved
import 'react-notifications/lib/notifications.css';

// components
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';

import * as config from './_Config';
import symbol from './assets.json';
// ----------------------------------------------------------------------

export default function OrderDetail(prop) {
  const [vid, setVId] = useState();
  const [orderType, setOrderType] = useState('Client');
  const [dt, setDT] = useState(new Date());
  const [clientData, setClientData] = useState([]); // client data
  const [clientList, setClientList] = useState([]); // sort by autocomplete data ( label, id)
  const [selClient, setSelClient] = useState(null); // selected client
  const [selSymbol, setSelSymbol] = useState(null); // selected client symbol
  const [venueData, setVenueData] = useState([]); // venue data
  const [venueList, setVenueList] = useState([]); // sort by autocomplete data ( for venue)
  const [selVenue, setSelVenue] = useState(null); // selected venue
  const [cBankInfo, setCBankInfo] = useState({}); // full bank info for client
  const [cWalletInfo, setCWalletInfo] = useState({}); // full wallet info for client
  const [cBankList, setCBankList] = useState([]);
  const [cWalletList, setCWalletList] = useState([]);
  const [cHTMList, setCHTMList] = useState([
    { type: 'Bank', label: 'HTM Bank', id: -1 },
    { type: 'Wallet', label: 'HTM HexSafe', id: -2 }
  ]);
  const [lbClient, setLBClient] = useState(0); // 0: buy, 1: sell in Client
  const [RFW, setRFW] = useState(null);
  const [RTW, setRTW] = useState(null);
  const [DFW, setDFW] = useState(null);
  const [DTW, setDTW] = useState(null);
  // market state

  // venue portion
  const [marketLeg, setMarketLeg] = useState([{ key: 0, rfw: [] }]);

  // search and navigate
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Validations for Formik properties
  const VenueSchema = Yup.object().shape({
    code: Yup.string().min(2, 'Too Short!').max(3, 'Too Long!').required('Code required!'),
    name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name required!'),
    trade_date: Yup.date().required('Trade Date is required'),
    client_comm: Yup.number()
      .positive()
      .typeError('Commission is between 0 to 100')
      .min(0, 'Min is 0%')
      .max(100, 'Max is 100%')
      .required('Commission is required'),
    client_quantity: Yup.string()
      .matches(/^\d{0,5}(?:\.\d{0,5}){0,1}$/, 'Quantity is not valid!')
      .required('Quantity is required!'),
    client_price: Yup.number()
      .positive()
      .typeError('Price is not valid!')
      .min(0, 'Min is 0')
      .required('Price is required!'),
    client_fee: Yup.string()
      .matches(/^\d{0,5}(?:\.\d{0,5}){0,1}$/, 'Fee is not valid!')
      .required('Fee is required!')
  });

  // Create new Formik instance
  const formik = useFormik({
    initialValues: {
      // code: '',
      // name: '',
      type: 'Client',
      client_comm: '',
      client_quantity: '',
      client_price: '',
      client_fee: '',
      market_leg_side: 'Sell'
    },
    validationSchema: VenueSchema,
    onSubmit: (values, { resetForm }) => {
      // submitData();
      console.log('11111111111111111111111');
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  const onRadioClick = (e) => {
    if (e === 'ClientBuy') {
      setLBClient(0);
      formik.setFieldValue('market_leg_side', 'Sell');
    } else if (e === 'ClientSell') {
      setLBClient(1);
      formik.setFieldValue('market_leg_side', 'Buy');
    } else if (e === 'MarketBuy' || e === 'MarketSell') {
      //
    } else {
      setOrderType(e);
    }
  };

  const handleDateTime = (e) => {
    setDT(e);
  };

  useEffect(() => {
    const id = searchParams.get('id');
    // console.log(id);
    if (id !== null) {
      fetch(`${config.SERVER_URL}/api/orders?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log('Response => ', data);
          const clientDATA = JSON.parse(data.client_leg);
          const marketDATA = JSON.parse(data.market_leg);
          const orderTYPE = data.type;
          const tradeDATE = data.trade_date;
          setVId(data.id);
          setDT(new Date(tradeDATE));
          if (orderTYPE === 'P') {
            formik.setFieldValue('type', 'Client');
          } else {
            formik.setFieldValue('type', 'Prop');
          }

          const clientOption = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          };

          // client load by id
          fetch(`${config.SERVER_URL}/api/clients`, clientOption)
            .then((response) => response.json())
            .then((data) => {
              if (data !== undefined) {
                const temp = [];
                let selectedClient = {};
                setClientData(data);
                for (let i = 0; i < data.length; i += 1) {
                  const item = data[i];

                  if (item.name === clientDATA.name) {
                    selectedClient = { label: item.name, id: item.id };
                    setSelClient(selectedClient);
                  }

                  temp.push({
                    id: item.id,
                    label: item.name
                  });
                }
                setClientList(temp);
                // select one
                formik.setFieldValue('client_quantity', clientDATA.quantity);
                formik.setFieldValue('client_price', clientDATA.price);
                formik.setFieldValue('client_fee', clientDATA.fee);
                formik.setFieldValue('client_comm', clientDATA.comm);
                setSelSymbol({ label: clientDATA.asset });

                if (clientDATA.side === 'BUY') {
                  setLBClient(0);
                } else {
                  setLBClient(1);
                }

                console.log('selected client =>>>>>>', selectedClient);

                // client's wallet and bank account
                fetch(`${config.SERVER_URL}/api/wallets?id=${selectedClient.id}`)
                  .then((res) => res.json())
                  .then((dp) => {
                    if (dp[0] !== undefined) {
                      const result = dp[0].wallet_info;
                      const walletInfo = JSON.parse(result);
                      const tempArray = [];
                      setCWalletInfo(walletInfo);

                      for (let i = 0; i < walletInfo.length; i += 1) {
                        tempArray.push({
                          type: 'Wallet',
                          label: walletInfo[i].wallet_name
                        });
                      }
                      setCWalletList(tempArray);
                    } else {
                      setCWalletInfo([]);
                      setCWalletList([]);
                    }
                  });

                fetch(`${config.SERVER_URL}/api/banks?id=${selectedClient.id}`)
                  .then((res) => res.json())
                  .then((dp) => {
                    if (dp[0] !== undefined) {
                      const result = dp[0].bank_info;
                      const BankInfo = JSON.parse(result);
                      const tempArray = [];
                      setCBankInfo(BankInfo);

                      for (let i = 0; i < BankInfo.length; i += 1) {
                        tempArray.push({
                          type: 'Bank',
                          label: BankInfo[i].bank_name
                        });
                      }
                      setCBankList(tempArray);
                    } else {
                      setCBankInfo([]);
                      setCBankList([]);
                    }
                  });

                setRFW(clientDATA.rfw !== null ? clientDATA.rfw : null);
                setRTW(clientDATA.rtw !== null ? clientDATA.rtw : null);
                setDFW(clientDATA.dfw !== null ? clientDATA.dfw : null);
                setDTW(clientDATA.dtw !== null ? clientDATA.dtw : null);
              }
            });

          // market leg by id
          fetch(`${config.SERVER_URL}/api/venues`, clientOption)
            .then((response) => response.json())
            .then((data) => {
              if (data !== undefined) {
                const temp = [];
                const reArray = [];

                setVenueData(data);
                for (let i = 0; i < data.length; i += 1) {
                  const item = data[i];
                  temp.push({
                    id: item.id,
                    label: item.name
                  });
                }
                setVenueList(temp);
                // here selection START
                for (let j = 0; j < marketDATA.length; j += 1) {
                  console.log(marketDATA[j]);
                  reArray.push({
                    key: j,
                    name: marketDATA[j].name,
                    side: marketDATA[j].side,
                    asset: marketDATA[j].asset,
                    quantity: marketDATA[j].quantity,
                    price: marketDATA[j].price,
                    comm: marketDATA[j].comm,
                    fee: marketDATA[j].fee,
                    rfw: [],
                    o_rfw: marketDATA[j].rfw,
                    o_rtw: marketDATA[j].rtw,
                    o_dfw: marketDATA[j].dfw,
                    o_dtw: marketDATA[j].dtw
                  });
                }
                setMarketLeg(reArray);
              }
            });
        });
    } else {
      const clientOption = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };

      // fetch clients
      fetch(`${config.SERVER_URL}/api/clients`, clientOption)
        .then((response) => response.json())
        .then((data) => {
          if (data !== undefined) {
            const temp = [];
            setClientData(data);
            for (let i = 0; i < data.length; i += 1) {
              const item = data[i];
              temp.push({
                id: item.id,
                label: item.name
              });
            }
            setClientList(temp);
          }
        });

      // fetch venues
      fetch(`${config.SERVER_URL}/api/venues`, clientOption)
        .then((response) => response.json())
        .then((data) => {
          if (data !== undefined) {
            const temp = [];
            setVenueData(data);
            for (let i = 0; i < data.length; i += 1) {
              const item = data[i];
              temp.push({
                id: item.id,
                label: item.name
              });
            }
            setVenueList(temp);
          }
        });
    }
  }, []);

  const onSelectClient = (e, newVal) => {
    // validate each fields to format
    formik.setFieldValue('client_quantity', '');
    formik.setFieldValue('client_price', '');
    formik.setFieldValue('client_fee', '');

    if (newVal) {
      setSelClient(newVal);

      for (let i = 0; i < clientData.length; i += 1) {
        const cl = clientData[i];

        if (cl.id === newVal.id) {
          formik.setFieldValue('client_comm', cl.commission);
          break;
        }
      }

      // client's wallet and bank account
      fetch(`${config.SERVER_URL}/api/wallets?id=${newVal.id}`)
        .then((res) => res.json())
        .then((dp) => {
          if (dp[0] !== undefined) {
            const result = dp[0].wallet_info;
            const walletInfo = JSON.parse(result);
            const tempArray = [];
            setCWalletInfo(walletInfo);

            for (let i = 0; i < walletInfo.length; i += 1) {
              tempArray.push({
                type: 'Wallet',
                label: walletInfo[i].wallet_name
              });
            }
            setCWalletList(tempArray);
          } else {
            setCWalletInfo([]);
            setCWalletList([]);
          }
        });

      fetch(`${config.SERVER_URL}/api/banks?id=${newVal.id}`)
        .then((res) => res.json())
        .then((dp) => {
          if (dp[0] !== undefined) {
            const result = dp[0].bank_info;
            const BankInfo = JSON.parse(result);
            const tempArray = [];
            setCBankInfo(BankInfo);

            for (let i = 0; i < BankInfo.length; i += 1) {
              tempArray.push({
                type: 'Bank',
                label: BankInfo[i].bank_name
              });
            }
            setCBankList(tempArray);
          } else {
            setCBankInfo([]);
            setCBankList([]);
          }
        });
    } else {
      formik.setFieldValue('client_comm', '');
      setSelClient(null);
      setRFW(null);
      setRTW(null);
      setDFW(null);
      setDTW(null);
    }
  };

  const onSelectVenue = (e, newVal, leg) => {
    if (newVal) {
      console.log(leg);
      console.log(newVal);
      console.log(venueData);
      for (let i = 0; i < venueData.length; i += 1) {
        const cl = venueData[i];

        if (cl.name === newVal.label) {
          console.log(cl);
          setSelVenue(cl);
          // display data
          const currentLegData = cl;
          currentLegData.key = leg.key;
          currentLegData.rfw = [
            { type: 'Bank', label: currentLegData.bank_name, id: currentLegData.id },
            { type: 'Wallet', label: currentLegData.wallet_name, id: currentLegData.id }
          ];

          console.log('updated leg => ', currentLegData);

          const newArr = [...marketLeg];
          for (let x = 0; x < newArr.length; x += 1) {
            if (newArr[x].key === currentLegData.key) {
              newArr[x] = currentLegData;
              break;
            }
          }

          setMarketLeg(newArr); // update market leg
          break;
        }
      }
    } else {
      //
    }
  };

  const onChangeRFW = (_, value) => {
    setRFW(value);
  };

  const onChangeRTW = (_, value) => {
    setRTW(value);
  };

  const onChangeDFW = (_, value) => {
    setDFW(value);
  };

  const onChangeDTW = (_, value) => {
    setDTW(value);
  };

  const addNewMarket = () => {
    // add market leg
    const temp = [...marketLeg];
    temp.push({ key: temp.length, rfw: [] });
    setMarketLeg(temp);
  };

  const onDeleteMarketLeg = (_, leg) => {
    const temp = [...marketLeg];
    console.log(temp);
    const data = temp.filter((item) => item.key !== leg.key);
    console.log(data);
    setMarketLeg(data);
  };

  const onMarketLegAsset = (_, val, leg) => {
    const temp = [...marketLeg];
    const data = [];
    if (val !== null) {
      for (let i = 0; i < temp.length; i += 1) {
        if (temp[i].name === leg.name) {
          temp[i].asset = val.label;
        }
        data.push(temp[i]);
      }
      setMarketLeg(data);
    }
  };

  const onMarketLegQuantity = (e, leg) => {
    const temp = [...marketLeg];
    const data = [];

    for (let i = 0; i < temp.length; i += 1) {
      if (temp[i].name === leg.name) {
        temp[i].quantity = e.target.value;
      }
      data.push(temp[i]);
    }
    setMarketLeg(data);
  };

  const onMarketLegPrice = (e, leg) => {
    const temp = [...marketLeg];
    const data = [];

    for (let i = 0; i < temp.length; i += 1) {
      if (temp[i].name === leg.name) {
        temp[i].price = e.target.value;
      }
      data.push(temp[i]);
    }
    setMarketLeg(data);
  };

  const onMarketLegComm = (e, leg) => {
    const temp = [...marketLeg];
    const data = [];

    for (let i = 0; i < temp.length; i += 1) {
      if (temp[i].name === leg.name) {
        temp[i].comm = e.target.value;
      }
      data.push(temp[i]);
    }
    setMarketLeg(data);
  };

  const onChangeWallet = (_, value, leg, property) => {
    const temp = [...marketLeg];
    const data = [];

    for (let i = 0; i < temp.length; i += 1) {
      if (temp[i].name === leg.name) {
        temp[i][property] = value.label;
      }
      data.push(temp[i]);
    }
    setMarketLeg(data);
  };

  const onChangeClientSymbol = (e, val) => {
    setSelSymbol(val.label);
  };

  const submitData = () => {
    if (selClient == null || selSymbol == null || RTW == null || DFW == null || DTW == null) {
      NotificationManager.error(`Please input all blanks`, 'Caution', 500);
      return;
    }
    if (prop.type === 'New') {
      /* 
      dt: trade date
      orderType
      
      // client
      BUY?SELL: lbClient : lbClient: 0 -> buy (client),  1 -> sell (client)
      symbol: 
      quantity: formik.client_quantity
      price: formik.client_price
      commission: formik.client_comm
      fee: formik.client_fee
      RFW, RTW, DFW, DTW
      */
      console.log(orderType);
      console.log(selClient);
      console.log(lbClient === 0 ? 'BUY' : 'SELL');
      console.log(formik.getFieldProps('client_price').value);
      console.log(selSymbol);
      console.log(DFW);
      console.log(marketLeg);

      const clientLeg = {
        name: selClient.label,
        side: lbClient === 0 ? 'BUY' : 'SELL',
        asset: selSymbol,
        quantity: formik.getFieldProps('client_quantity').value,
        price: formik.getFieldProps('client_price').value,
        comm: formik.getFieldProps('client_comm').value,
        fee: formik.getFieldProps('client_fee').value,
        rfw: RFW ? RFW.label : null,
        rtw: RTW ? RTW.label : null,
        dfw: DFW ? DFW.label : null,
        dtw: DTW ? DTW.label : null
      };

      const mLeg = [];

      for (let i = 0; i < marketLeg.length; i += 1) {
        const item = marketLeg[i];

        console.log(
          'bbbbbbbbbbbbbbbbbbbbb',
          item.name,
          ' ',
          item.asset,
          ' ',
          item.o_rtw,
          ' ',
          item.o_dfw,
          ' ',
          item.o_dtw,
          ' ',
          item.name
        );
        if (
          item.name == null ||
          item.asset == null ||
          item.o_rtw == null ||
          item.o_dfw == null ||
          item.o_dtw == null
        ) {
          NotificationManager.error(`Please input all blanks`, 'Caution', 500);
          return;
        }
        mLeg.push({
          name: item.name,
          side: lbClient === 1 ? 'BUY' : 'SELL',
          asset: item.asset,
          quantity: item.quantity,
          price: item.price,
          comm: item.comm,
          fee: item.fee,
          rfw: item.o_rfw ? item.o_rfw : null,
          rtw: item.o_rtw ? item.o_rtw : null,
          dfw: item.o_dfw ? item.o_dfw : null,
          dtw: item.o_dtw ? item.o_dtw : null
        });
      }

      console.log(clientLeg);
      console.log(mLeg);

      const bodyData = {
        type: orderType === 'Client' ? 'P' : 'E',
        trade_date: dt,
        client_leg: JSON.stringify(clientLeg),
        market_leg: JSON.stringify(mLeg),
        create_user: 0
      };

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      };
      fetch(`${config.SERVER_URL}/api/orders`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.Status === 1) {
            NotificationManager.success(
              'A new order has been added successfully !',
              'Success',
              500
            );
            navigate('/dashboard/order');
          } else if (data.Status === 0) {
            NotificationManager.error('Something went wrong...', 'Error', 500);
          }
        });
    } else {
      // Update record
      console.log(selSymbol.label);
      console.log(RFW);
      console.log(RTW);
      console.log(DFW);
      console.log(DTW);

      const clientLeg = {
        name: selClient.label,
        side: lbClient === 0 ? 'BUY' : 'SELL',
        asset: selSymbol.label,
        quantity: formik.getFieldProps('client_quantity').value,
        price: formik.getFieldProps('client_price').value,
        comm: formik.getFieldProps('client_comm').value,
        fee: formik.getFieldProps('client_fee').value,
        rfw: RFW || null,
        rtw: RTW || null,
        dfw: DFW || null,
        dtw: DTW || null
      };

      const mLeg = [];

      for (let i = 0; i < marketLeg.length; i += 1) {
        const item = marketLeg[i];
        if (
          item.name == null ||
          item.asset == null ||
          item.o_rtw == null ||
          item.o_dfw == null ||
          item.o_dtw == null
        ) {
          NotificationManager.error(`Please input all blanks`, 'Caution', 500);
          return;
        }
        mLeg.push({
          name: item.name,
          side: lbClient === 1 ? 'BUY' : 'SELL',
          asset: item.asset,
          quantity: item.quantity,
          price: item.price,
          comm: item.comm,
          fee: item.fee,
          rfw: item.o_rfw ? item.o_rfw : null,
          rtw: item.o_rtw ? item.o_rtw : null,
          dfw: item.o_dfw ? item.o_dfw : null,
          dtw: item.o_dtw ? item.o_dtw : null
        });
      }

      const bodyData = {
        type: orderType === 'Client' ? 'P' : 'E',
        trade_date: dt,
        client_leg: JSON.stringify(clientLeg),
        market_leg: JSON.stringify(mLeg),
        create_user: 0
      };

      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      };

      const id = searchParams.get('id');
      fetch(`${config.SERVER_URL}/api/orders?id=${id}`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.Status === 1) {
            NotificationManager.success(
              'A new order has been updated successfully !',
              'Success',
              500
            );
            navigate('/dashboard/order');
          } else if (data.Status === 0) {
            NotificationManager.error('Something went wrong...', 'Error', 500);
          }
        });
    }
  };

  return (
    <Page title="Order Detail | OTC Trade">
      <Container>
        <FormikProvider enableReinitialize value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Typography variant="h4" mb={5} gutterBottom>
              {prop.type} {orderType} Order
            </Typography>

            <Card>
              <Scrollbar>
                <Grid container spacing={2} p={5}>
                  <Grid item xs={6}>
                    Order ID <Input disabled value={vid} sx={{ marginLeft: '1em' }} />
                  </Grid>
                  <Grid item xs={6}>
                    Trade Date
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        value={dt}
                        onChange={handleDateTime}
                        renderInput={(params) => (
                          <TextField sx={{ marginTop: '-1em', marginLeft: '2em' }} {...params} />
                        )}
                      />
                    </LocalizationProvider>
                    <span className="error-message">
                      {Boolean(touched.trade_date && errors.trade_date) === true
                        ? `${touched.trade_date && errors.trade_date}`
                        : ''}
                    </span>
                    <Typography sx={{ fontSize: '0.7em' }}>(mm/dd/yyyy HH:mm)</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    Order Type
                    <RadioGroup
                      row
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="Client"
                      name="radio-buttons-group"
                      {...getFieldProps('type')}
                      sx={{ display: 'inline', marginLeft: '2em' }}
                    >
                      <FormControlLabel
                        value="Client"
                        control={<Radio onClick={(e) => onRadioClick('Client')} />}
                        label="Client"
                      />
                      <FormControlLabel
                        value="Prop"
                        control={<Radio onClick={(e) => onRadioClick('Prop')} />}
                        label="Prop"
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
                <Typography mt={2} ml={3} variant="h6">
                  Client Leg
                </Typography>
                <Grid container spacing={2} p={5}>
                  <Grid item xs={2}>
                    Client
                  </Grid>
                  <Grid item xs={10}>
                    <Autocomplete
                      disablePortal
                      id="combo-box-demo"
                      value={selClient}
                      options={clientList}
                      onChange={(e, val) => onSelectClient(e, val)}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Please select the Client" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    Buy/Sell
                    <RadioGroup
                      row
                      defaultValue="Buy"
                      name="radio-buttons-group-1"
                      sx={{ display: 'inline', marginLeft: '2em' }}
                    >
                      <FormControlLabel
                        value="Buy"
                        onClick={(e) => onRadioClick('ClientBuy')}
                        control={<Radio />}
                        label="Buy"
                      />
                      <FormControlLabel
                        value="Sell"
                        onClick={(e) => onRadioClick('ClientSell')}
                        control={<Radio />}
                        label="Sell"
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={6}>
                    Asset Pair{' '}
                    <Autocomplete
                      disablePortal
                      value={selSymbol}
                      onChange={(e, val) => onChangeClientSymbol(e, val)}
                      options={symbol}
                      sx={{ width: 200, float: 'right' }}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Select the asset" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    Quantity{' '}
                    <Input
                      type="number"
                      {...getFieldProps('client_quantity')}
                      placeholder="Please input the quantity"
                      sx={{ marginLeft: '1em', float: 'right' }}
                    />
                    <span className="error-message">
                      {Boolean(touched.client_quantity && errors.client_quantity) === true
                        ? `${touched.client_quantity && errors.client_quantity}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    Price{' '}
                    <Input
                      type="number"
                      {...getFieldProps('client_price')}
                      placeholder="Please input the price"
                      sx={{ marginLeft: '1em', float: 'right' }}
                    />
                    <span className="error-message">
                      {Boolean(touched.client_price && errors.client_price) === true
                        ? `${touched.client_price && errors.client_price}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    Commission (bps){' '}
                    <Input
                      type="number"
                      {...getFieldProps('client_comm')}
                      placeholder="Please input the commission"
                      sx={{ marginLeft: '1em', float: 'right' }}
                    />
                    <span className="error-message">
                      {Boolean(touched.client_comm && errors.client_comm) === true
                        ? `${touched.client_comm && errors.client_comm}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    Fee (bps){' '}
                    <Input
                      type="number"
                      {...getFieldProps('client_fee')}
                      placeholder="Please input the fee"
                      sx={{ marginLeft: '1em', float: 'right' }}
                    />
                    <span className="error-message">
                      {Boolean(touched.client_fee && errors.client_fee) === true
                        ? `${touched.client_fee && errors.client_fee}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    {lbClient === 0 ? (
                      <b>HTM receives from Client {selClient ? `( ${selClient.label} )` : null}</b>
                    ) : (
                      <b>Client {selClient ? `( ${selClient.label} )` : null} receives from HTM</b>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    {lbClient === 0 ? (
                      <b>HTM delivers to Client {selClient ? `( ${selClient.label} )` : null}</b>
                    ) : (
                      <b>Client {selClient ? `( ${selClient.label} )` : null} delivers to HTM</b>
                    )}
                  </Grid>
                  {/* START: wallet checking */}
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Deliver from Wallet/Bank Account</Typography>
                      <Autocomplete
                        value={DFW}
                        onChange={(e, val) => onChangeDFW(e, val)}
                        options={cHTMList}
                        // isOptionEqualToValue={(option, value) => option.label === value.label}
                        groupBy={(option) => option.type}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select the account" />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Receive from Wallet/Bank Account</Typography>
                      <Autocomplete
                        value={RFW}
                        onChange={(e, val) => onChangeRFW(e, val)}
                        options={[]}
                        // isOptionEqualToValue={(option, value) => option.label === value.label}
                        groupBy={(option) => option.type}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Deliver to Wallet/Bank Account</Typography>
                      <Autocomplete
                        value={DTW}
                        onChange={(e, val) => onChangeDTW(e, val)}
                        // isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={cBankList.concat(...cWalletList)}
                        groupBy={(option) => option.type}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select the account" />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography>Receive to Wallet/Bank Account</Typography>
                      <Autocomplete
                        value={RTW}
                        onChange={(e, val) => onChangeRTW(e, val)}
                        // isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={cHTMList}
                        groupBy={(option) => option.type}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                          <TextField {...params} placeholder="Select the account" />
                        )}
                      />
                    </Stack>
                  </Grid>
                  {/* END: wallet checking */}
                </Grid>
                {/* START: Market Leg */}
                <Box>
                  {marketLeg.map((leg, index) => (
                    <Box key={index}>
                      <Typography mt={2} ml={3} variant="h6">
                        Market Leg
                      </Typography>
                      <Grid container spacing={2} p={5}>
                        <Grid item xs={2}>
                          Venue {index + 1}
                        </Grid>
                        <Grid item xs={10}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="baseline"
                            spacing={5}
                          >
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              value={leg.name ? leg.name : null}
                              options={venueList}
                              onChange={(e, val) => onSelectVenue(e, val, leg)}
                              sx={{ width: 500 }}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Select the Venue" />
                              )}
                            />
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={(e) => onDeleteMarketLeg(e, leg)}
                            >
                              Delete Leg
                            </Button>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          Buy/Sell
                          {/* lbClient === 0 ? 'Sell' : 'Buy' */}
                          <RadioGroup
                            row
                            defaultValue="Sell"
                            name="market-leg-side-1"
                            {...getFieldProps('market_leg_side')}
                            sx={{ display: 'inline', marginLeft: '2em' }}
                          >
                            <FormControlLabel
                              value="Buy"
                              control={<Radio />}
                              label="Buy"
                              disabled
                            />
                            <FormControlLabel
                              value="Sell"
                              control={<Radio />}
                              label="Sell"
                              disabled
                            />
                          </RadioGroup>
                        </Grid>
                        <Grid item xs={6}>
                          Asset Pair{' '}
                          <Autocomplete
                            disablePortal
                            value={leg.asset === undefined ? '' : leg.asset}
                            onChange={(e, val) => onMarketLegAsset(e, val, leg)}
                            options={symbol}
                            sx={{ width: 200, float: 'right' }}
                            renderInput={(params) => (
                              <TextField {...params} placeholder="Select the asset" />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          Quantity{' '}
                          <Input
                            type="number"
                            value={leg.quantity ? leg.quantity : ''}
                            placeholder="Please input the quantity"
                            sx={{ marginLeft: '1em', float: 'right' }}
                            onChange={(e) => onMarketLegQuantity(e, leg)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          Price{' '}
                          <Input
                            type="number"
                            value={leg.price ? leg.price : ''}
                            placeholder="Please input the price"
                            sx={{ marginLeft: '1em', float: 'right' }}
                            onChange={(e) => onMarketLegPrice(e, leg)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          Commission (bps){' '}
                          <Input
                            type="number"
                            value={leg.comm ? leg.comm : ''}
                            placeholder="Please input the Commission"
                            sx={{ marginLeft: '1em', float: 'right' }}
                            onChange={(e) => onMarketLegComm(e, leg)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          Fee (bps){' '}
                          <Input
                            type="number"
                            value={leg.fee}
                            placeholder="Please input the fee"
                            sx={{ marginLeft: '1em', float: 'right' }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          {lbClient === 1 ? (
                            <b>HTM receives from Venue {selVenue ? `( ${leg.name} )` : null}</b>
                          ) : (
                            <b>Venue {selVenue ? `( ${leg.name} )` : null} receives from HTM</b>
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          {lbClient === 1 ? (
                            <b>HTM delivers to Venue {selVenue ? `( ${leg.name} )` : null}</b>
                          ) : (
                            <b>Venue {selVenue ? `( ${leg.name} )` : null} delivers to HTM</b>
                          )}
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography>Deliver from Wallet/Bank Account</Typography>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo-3"
                              value={leg.o_dfw ? leg.o_dfw : ''}
                              onChange={(e, val) => onChangeWallet(e, val, leg, 'o_dfw')}
                              options={cHTMList}
                              // isOptionEqualToValue={(option, value) => option.label === value.label}
                              groupBy={(option) => option.type}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Select the account" />
                              )}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography>Receive from Wallet/Bank Account</Typography>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo-2"
                              value={leg.o_rfw ? leg.o_rfw : ''}
                              onChange={(e, val) => onChangeWallet(e, val, leg, 'o_rfw')}
                              options={[]}
                              // isOptionEqualToValue={(option, value) => option.label === value.label}
                              groupBy={(option) => option.type}
                              sx={{ width: 300 }}
                              renderInput={(params) => <TextField {...params} />}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography>Deliver to Wallet/Bank Account</Typography>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo-5"
                              value={leg.o_dtw ? leg.o_dtw : ''}
                              onChange={(e, val) => onChangeWallet(e, val, leg, 'o_dtw')}
                              options={leg.rfw ? leg.rfw : []}
                              // isOptionEqualToValue={(option, value) => option.label === value.label}
                              groupBy={(option) => option.type}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Select the account" />
                              )}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography>Receive to Wallet/Bank Account</Typography>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo-4"
                              value={leg.o_rtw ? leg.o_rtw : ''}
                              onChange={(e, val) => onChangeWallet(e, val, leg, 'o_rtw')}
                              options={cHTMList}
                              // isOptionEqualToValue={(option, value) => option.label === value.label}
                              groupBy={(option) => option.type}
                              sx={{ width: 300 }}
                              renderInput={(params) => (
                                <TextField {...params} placeholder="Select the account" />
                              )}
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>

                <Box mb={7} mr={2}>
                  <Button variant="contained" sx={{ float: 'right' }} onClick={addNewMarket}>
                    Add Venue
                  </Button>
                </Box>
              </Scrollbar>
            </Card>

            <Stack direction="row" spacing={3} mt={3} sx={{ float: 'right' }}>
              <Button
                size="medium"
                variant="contained"
                color="error"
                component={RouterLink}
                to="/dashboard/order"
                startIcon={<Icon icon={backIcon} />}
              >
                Cancel
              </Button>
              <Button
                size="medium"
                variant="contained"
                // type="submit"
                onClick={submitData}
                startIcon={<Icon icon={activityFill} />}
              >
                {prop.type === 'New' ? 'Create' : 'Update'}
              </Button>
            </Stack>
          </Form>
        </FormikProvider>
        <NotificationContainer />
      </Container>
    </Page>
  );
}
