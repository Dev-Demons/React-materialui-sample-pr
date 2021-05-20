// React Form Validation using yup
import * as Yup from 'yup';

import { filter, update } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import activityFill from '@iconify/icons-eva/activity-fill';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import * as moment from 'moment';
// material
import {
  Card,
  Table,
  Stack,
  Avatar,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TableHead,
  TablePagination,
  Grid,
  Input,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  TextField,
  Box
} from '@mui/material';

// React Form submission using Formik
import { useFormik, Form, FormikProvider } from 'formik';

// React-Notification to show the status for adding a new Client
import { NotificationContainer, NotificationManager } from 'react-notifications';
// eslint-disable-next-line import/no-unresolved
import 'react-notifications/lib/notifications.css';

// pages
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';

import * as config from './_Config';

export default function ClientDetail(prop) {
  const [vid, setVId] = useState();
  const [subEmail, setSubEmail] = useState([]);
  const [subWallet, setSubWallet] = useState([]);
  const [subBank, setSubBank] = useState([]);
  const [emailID, setEmailID] = useState('');
  const [walletID, setWalletID] = useState('');
  const [bankID, setBankID] = useState('');
  const [clientData, setClientData] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Validations for Formik properties
  const ClientSchema = Yup.object().shape({
    code: Yup.string()
      .test('len', 'Must be exactly 3 characters', (val) =>
        val !== undefined ? val.trim().length === 3 : ''
      )
      .required('Code required')
      .matches(/^\s*\S[\s\S]*$/, "Can't contain only blankspaces"),
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Name required')
      .matches(/^\s*\S[\s\S]*$/, "Can't contain only blankspaces"),
    commission: Yup.number()
      .positive()
      .typeError('Commission is between 0 to 100')
      .min(0, 'Min is 0%')
      .max(100, 'Max is 100%')
      .required('Commission is required')
  });

  // Create new Formik instance
  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      commission: '',
      type: 'External'
    },
    validationSchema: ClientSchema,
    onSubmit: (values, { resetForm }) => {
      const clientInfo = {
        code: values.code,
        name: values.name,
        commission: parseFloat(values.commission),
        type: values.type,
        status: 'Active'
      };

      let requestOptions = {};

      // bank, email, wallet validator;
      // let isCorrect = false;
      for (let i = 0; i < subEmail.length; i += 1) {
        const item = subEmail[i];

        if (validEmail(item.value) === false) {
          NotificationManager.error('Please add correct email address', 'Error', 1000);
          return;
        }
      }

      for (let i = 0; i < subWallet.length; i += 1) {
        const item = subWallet[i];

        if (item.wallet_name.length === 0 || item.wallet_addr.length === 0) {
          NotificationManager.error('Please fill wallet info correctly', 'Error', 1000);
          return;
        }
      }

      for (let i = 0; i < subBank.length; i += 1) {
        const item = subBank[i];

        if (
          item.bank_name.length === 0 ||
          item.bank_number.length === 0 ||
          item.account_name.length === 0 ||
          item.account_number.length === 0
        ) {
          NotificationManager.error('Please fill bank info correctly', 'Error', 1000);
          return;
        }
      }

      if (prop.type === 'New') {
        requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientInfo)
        };
        fetch(`${config.SERVER_URL}/api/clients`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.Status === 1) {
              NotificationManager.success(
                'A new client has been added successfully !',
                'Success',
                2500
              );

              const clientID = data.client_id;
              // subEmail, subWallet, subBank
              if (subEmail.length > 0) {
                const emailInfo = {
                  client_id: clientID,
                  email_info: JSON.stringify(subEmail),
                  status: 'Active'
                };
                const reqData = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(emailInfo)
                };
                fetch(`${config.SERVER_URL}/api/emails`, reqData);
              }
              if (subWallet.length > 0) {
                const emailInfo = {
                  client_id: clientID,
                  wallet_info: JSON.stringify(subWallet),
                  status: 'Active'
                };
                const reqData = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(emailInfo)
                };
                fetch(`${config.SERVER_URL}/api/wallets`, reqData);
              }
              if (subBank.length > 0) {
                const emailInfo = {
                  client_id: clientID,
                  bank_info: JSON.stringify(subBank),
                  status: 'Active'
                };
                const reqData = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(emailInfo)
                };
                fetch(`${config.SERVER_URL}/api/banks`, reqData);
              }
            } else if (data.Status === 0) {
              NotificationManager.error('Client Code already exists...', 'Error', 2500);
            }
            resetForm();
          });
      } else {
        // existing client
        const id = searchParams.get('id');
        requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientInfo)
        };
        fetch(`${config.SERVER_URL}/api/clients?id=${id}`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.Status === 1) {
              NotificationManager.success(
                'A new client has been update successfully !',
                'Success',
                2500
              );
              // subEmail, subWallet, subBank
              let reqBody;
              let reqData;

              if (subEmail.length > 0) {
                reqBody = {
                  client_id: id,
                  email_info: JSON.stringify(subEmail),
                  status: 'Active'
                };

                if (emailID === '') {
                  reqData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/emails`, reqData);
                } else {
                  reqData = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/emails?id=${emailID}`, reqData);
                }
              }

              if (subWallet.length > 0) {
                reqBody = {
                  client_id: id,
                  wallet_info: JSON.stringify(subWallet),
                  status: 'Active'
                };

                if (walletID === '') {
                  reqData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/wallets`, reqData);
                } else {
                  reqData = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/wallets?id=${walletID}`, reqData);
                }
              }

              if (subBank.length > 0) {
                reqBody = {
                  client_id: id,
                  bank_info: JSON.stringify(subBank),
                  status: 'Active'
                };

                if (bankID === '') {
                  reqData = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/banks`, reqData);
                } else {
                  reqData = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqBody)
                  };
                  fetch(`${config.SERVER_URL}/api/banks?id=${bankID}`, reqData);
                }
              }
            } else if (data.Status === 0) {
              NotificationManager.error(
                'Something went wrong for adding a new client...',
                'Error',
                2500
              );
            }
            resetForm();
          });
      }

      setTimeout(() => {
        navigate('/dashboard/client');
      }, 5000);
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  useEffect(() => {
    const id = searchParams.get('id');

    if (id != null) {
      fetch(`${config.SERVER_URL}/api/clients?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setClientData(data);
          setVId(data.id);
          formik.setFieldValue('code', data.code);
          formik.setFieldValue('commission', data.commission);
          formik.setFieldValue('name', data.name);
          formik.setFieldValue('type', data.type);

          fetch(`${config.SERVER_URL}/api/emails?id=${id}`)
            .then((res) => res.json())
            .then((dp) => {
              if (dp[0] !== undefined) {
                const result = dp[0].email_info;
                // console.log(dp[0].id);
                setEmailID(dp[0].id);
                setSubEmail(JSON.parse(result));
              } else {
                setSubEmail([]);
              }
            });
          fetch(`${config.SERVER_URL}/api/wallets?id=${id}`)
            .then((res) => res.json())
            .then((dp) => {
              if (dp[0] !== undefined) {
                const result = dp[0].wallet_info;
                // console.log(dp[0].id);
                setWalletID(dp[0].id);
                setSubWallet(JSON.parse(result));
              } else {
                setSubWallet([]);
              }
            });
          fetch(`${config.SERVER_URL}/api/banks?id=${id}`)
            .then((res) => res.json())
            .then((dp) => {
              if (dp[0] !== undefined) {
                const result = dp[0].bank_info;
                // console.log(dp[0].id);
                setBankID(dp[0].id);
                setSubBank(JSON.parse(result));
              } else {
                setSubBank([]);
              }
            });
        });
    }
  }, []);

  const onAddNewEmail = () => {
    const updatedData = [...subEmail, { value: '' }];
    setSubEmail(updatedData);
  };

  const deleteEmail = (e, key, obj) => {
    const updateData = subEmail.filter((item) => item.value !== obj.value);
    setSubEmail(updateData);
  };

  const updateEmail = (e, key, value) => {
    const updateData = [...subEmail];

    updateData[key].value = e.target.value;
    setSubEmail(updateData);
  };

  const onAddNewWallet = () => {
    const updatedData = [...subWallet, { wallet_name: '', wallet_addr: '' }];
    setSubWallet(updatedData);
  };

  const deleteWallet = (e, key, obj) => {
    const updateData = subWallet.filter(
      (item) => item.wallet_name !== obj.wallet_name || item.wallet_addr !== obj.wallet_addr
    );
    setSubWallet(updateData);
  };

  const updateWalletName = (e, key) => {
    const updateData = [...subWallet];

    updateData[key].wallet_name = e.target.value;
    setSubWallet(updateData);
  };

  const updateWalletAddr = (e, key) => {
    const updateData = [...subWallet];

    updateData[key].wallet_addr = e.target.value;
    setSubWallet(updateData);
  };

  const onAddNewBank = () => {
    const updateData = [
      ...subBank,
      { bank_name: '', bank_number: '', account_name: '', account_number: '' }
    ];
    setSubBank(updateData);
  };

  const onChangeBankName = (e, key) => {
    const updateData = [...subBank];

    updateData[key].bank_name = e.target.value;
    setSubBank(updateData);
  };

  const onChangeBankNumber = (e, key) => {
    const updateData = [...subBank];

    updateData[key].bank_number = e.target.value;
    setSubBank(updateData);
  };

  const onChangeAccountName = (e, key) => {
    const updateData = [...subBank];

    updateData[key].account_name = e.target.value;
    setSubBank(updateData);
  };

  const onChangeAccountNumber = (e, key) => {
    const updateData = [...subBank];

    updateData[key].account_number = e.target.value;
    setSubBank(updateData);
  };

  const deleteBank = (e, key, obj) => {
    const updateData = [...subBank];

    updateData.splice(key, 1);

    console.log(updateData);
    setSubBank(updateData);
  };

  const validEmail = (e) => {
    const filter = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);
    return filter.test(e);
  };

  return (
    <Page title="Client Detail | OTC Trade">
      <Container>
        <FormikProvider enableReinitialize value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
              <Typography variant="h4" gutterBottom>
                {prop.type} Client
              </Typography>
              <Button
                size="large"
                type="submit"
                variant="contained"
                startIcon={<Icon icon={activityFill} />}
              >
                Save
              </Button>
              {/* component={RouterLink} */}
            </Stack>

            <Card>
              <Scrollbar>
                <Grid container spacing={2} p={5}>
                  <Grid item xs={6}>
                    Client ID <Input disabled value={vid} sx={{ marginLeft: '1em' }} />
                  </Grid>
                  <Grid item xs={6}>
                    Client Code
                    <Input {...getFieldProps('code')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.code && errors.code) === true
                        ? `${touched.code && errors.code}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={12}>
                    Client Name
                    <Input {...getFieldProps('name')} sx={{ marginLeft: '1em', width: '50%' }} />
                    <span className="error-message">
                      {Boolean(touched.name && errors.name) === true
                        ? `${touched.name && errors.name}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    Client Commission (bps)
                    <Input {...getFieldProps('commission')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message-commission">
                      {Boolean(touched.commission && errors.commission) === true
                        ? `${touched.commission && errors.commission}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={6}>
                    Client Type
                    <RadioGroup
                      row
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="External"
                      name="radio-buttons-group"
                      {...getFieldProps('type')}
                      sx={{ display: 'inline', marginLeft: '2em' }}
                    >
                      <FormControlLabel value="Internal" control={<Radio />} label="Internal" />
                      <FormControlLabel value="External" control={<Radio />} label="External" />
                    </RadioGroup>
                  </Grid>
                  {prop.type === 'Update' ? (
                    <Grid item xs={12} mb={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        spacing={2}
                      >
                        {/* moment(trade_date).format('YYYY/MM/DD kk:mm') */}
                        <Box>
                          Create at
                          <Box>
                            {clientData
                              ? moment(clientData.create_at).format('YYYY/MM/DD kk:mm')
                              : null}
                          </Box>
                        </Box>
                        <Box>
                          Update at
                          <Box>
                            {clientData
                              ? moment(clientData.update_at).format('YYYY/MM/DD kk:mm')
                              : null}
                          </Box>
                        </Box>
                        <Box>
                          Status <Box sx={{ color: 'green' }}>Active</Box>
                        </Box>
                      </Stack>
                    </Grid>
                  ) : null}

                  <Grid item xs={12}>
                    <Typography variant="h5" mb={2}>
                      Email Address
                    </Typography>
                    <Button variant="contained" onClick={onAddNewEmail}>
                      Add Email Address
                    </Button>
                    <Box>
                      {/* {...getFieldProps('code')} */}
                      {subEmail.map((item, key) => (
                        <Stack key={key} direction="row" spacing={2} mt={2}>
                          <Input
                            type="email"
                            placeholder="Email Address"
                            sx={{ marginLeft: 3 }}
                            value={item.value}
                            onChange={(e) => updateEmail(e, key, item)}
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={(e) => deleteEmail(e, key, item)}
                          >
                            Delete
                          </Button>
                          <span className="error-message-commission">
                            {validEmail(item.value) === false ? `Invalid Email Type` : ''}
                          </span>
                        </Stack>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" mb={2}>
                      Wallet Address
                    </Typography>
                    <Button variant="contained" onClick={onAddNewWallet}>
                      Add Wallet Address
                    </Button>
                    <Box>
                      {subWallet.map((item, key) => (
                        <Stack key={key} direction="row" spacing={2} mt={2}>
                          <Input
                            type="text"
                            placeholder="Wallet Name"
                            sx={{ marginLeft: 3 }}
                            value={item.wallet_name}
                            onChange={(e) => updateWalletName(e, key, item)}
                          />
                          <Input
                            type="email"
                            placeholder="Wallet Address"
                            sx={{ marginLeft: 3 }}
                            value={item.wallet_addr}
                            onChange={(e) => updateWalletAddr(e, key, item)}
                          />
                          <Button
                            variant="contained"
                            color="error"
                            onClick={(e) => deleteWallet(e, key, item)}
                          >
                            Delete
                          </Button>
                          <span className="error-message-commission">
                            {item.wallet_name.length === 0 || item.wallet_addr.length === 0
                              ? `Can't be blank`
                              : ''}
                          </span>
                        </Stack>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" mb={2}>
                      Bank Address
                    </Typography>
                    <Button variant="contained" onClick={onAddNewBank}>
                      Add Bank Address
                    </Button>
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Bank Name</TableCell>
                            <TableCell>Bank Number</TableCell>
                            <TableCell>Account Name</TableCell>
                            <TableCell>Account Number</TableCell>
                            <TableCell> </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {subBank.map((item, key) => (
                            <TableRow
                              key={key}
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell component="th" scope="row">
                                <Input
                                  placeholder=""
                                  sx={{ marginLeft: 1 }}
                                  value={item.bank_name}
                                  onChange={(e) => onChangeBankName(e, key)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Input
                                  placeholder=""
                                  sx={{ marginLeft: 1 }}
                                  value={item.bank_number}
                                  onChange={(e) => onChangeBankNumber(e, key)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Input
                                  placeholder=""
                                  sx={{ marginLeft: 1 }}
                                  value={item.account_name}
                                  onChange={(e) => onChangeAccountName(e, key)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Input
                                  placeholder=""
                                  sx={{ marginLeft: 1 }}
                                  value={item.account_number}
                                  onChange={(e) => onChangeAccountNumber(e, key)}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={(e) => deleteBank(e, key, item)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Scrollbar>
            </Card>
          </Form>
        </FormikProvider>
        <NotificationContainer />
      </Container>
    </Page>
  );
}
