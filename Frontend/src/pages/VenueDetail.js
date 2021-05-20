// React Form Validation using yup
import * as Yup from 'yup';

import { filter } from 'lodash';
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
  Paper
} from '@mui/material';

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
// import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
// import USERLIST from '../_mocks_/user';
import * as config from './_Config';
// ----------------------------------------------------------------------

export default function VenueDetail(prop) {
  const [vid, setVId] = useState();
  const [code, setCode] = useState();
  const [rows, setRows] = useState([1]);
  const [venueData, setVenueData] = useState();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Validations for Formik properties
  const VenueSchema = Yup.object().shape({
    code: Yup.string()
      .test('len', 'Must be exactly 3 characters', (val) =>
        val !== undefined ? val.trim().length === 3 : ''
      )
      .required('Code required!')
      .matches(/^\s*\S[\s\S]*$/, "Can't contain only blankspaces"),
    name: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Name required!')
      .matches(/^\s*\S[\s\S]*$/, "Can't contain only blankspaces"),
    fee: Yup.string()
      .matches(/^\d{0,5}(?:\.\d{0,5}){0,1}$/, 'Fee is not valid!')
      .required('Fee is required!'),
    wallet_name: Yup.string().required('Wallet Name is required!'),
    wallet_addr: Yup.string().required('Wallet Address is required!'),
    bank_name: Yup.string().required('Bank name is required!'),
    bank_number: Yup.string().required('Bank number is required!'),
    account_number: Yup.string().required('Account number is required!'),
    account_name: Yup.string().required('Account name is required!')
  });

  // Create new Formik instance
  const formik = useFormik({
    initialValues: {
      code: '',
      name: '',
      fee: '',
      wallet_name: '',
      wallet_addr: '',
      bank_name: '',
      bank_number: '',
      account_number: '',
      account_name: ''
    },
    validationSchema: VenueSchema,
    onSubmit: (values, { resetForm }) => {
      const clientInfo = {
        code: values.code,
        name: values.name,
        fee: parseFloat(values.fee),
        wallet_name: values.wallet_name,
        wallet_addr: values.wallet_addr,
        bank_name: values.bank_name,
        bank_number: values.bank_number,
        account_number: values.account_number,
        account_name: values.account_name,
        status: 'Active'
      };

      let requestOptions = {};

      if (prop.type === 'New') {
        requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientInfo)
        };
        fetch(`${config.SERVER_URL}/api/venues`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.Status === 1) {
              NotificationManager.success(
                'A new venue has been added successfully !',
                'Success',
                500
              );
            } else if (data.Status === 0) {
              NotificationManager.error('Venue Code already exists...', 'Error', 500);
            }
            resetForm();
          });
      } else {
        const id = searchParams.get('id');
        requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientInfo)
        };
        fetch(`${config.SERVER_URL}/api/venues?id=${id}`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.Status === 1) {
              NotificationManager.success(
                'A new venue has been update successfully !',
                'Success',
                500
              );
            } else if (data.Status === 0) {
              NotificationManager.error(
                'Something went wrong for update a new venue...',
                'Error',
                500
              );
            }
            resetForm();
          });
      }

      setTimeout(() => {
        navigate('/dashboard/venue');
      }, 2000);
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  useEffect(() => {
    const id = searchParams.get('id');
    console.log(id);
    if (id != null) {
      fetch(`${config.SERVER_URL}/api/venues?id=${id}`)
        .then((response) => response.json())
        .then((data) => {
          setVenueData(data);
          setVId(data.id);
          formik.setFieldValue('code', data.code);
          formik.setFieldValue('name', data.name);
          formik.setFieldValue('fee', data.fee);
          formik.setFieldValue('wallet_name', data.wallet_name);
          formik.setFieldValue('wallet_addr', data.wallet_addr);
          formik.setFieldValue('bank_name', data.bank_name);
          formik.setFieldValue('bank_number', data.bank_number);
          formik.setFieldValue('account_number', data.account_number);
          formik.setFieldValue('account_name', data.account_name);
        });
    }
  }, []);

  return (
    <Page title="Venue Detail | OTC Trade">
      <Container>
        <FormikProvider enableReinitialize value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
              <Typography variant="h4" gutterBottom>
                {prop.type} Venue
              </Typography>
              <Button
                size="large"
                variant="contained"
                type="submit"
                startIcon={<Icon icon={activityFill} />}
              >
                Save
              </Button>
            </Stack>

            <Card>
              <Scrollbar>
                <Grid container spacing={2} p={5}>
                  <Grid item xs={6}>
                    Venue ID <Input disabled value={vid} sx={{ marginLeft: '1em' }} />
                  </Grid>
                  <Grid item xs={6}>
                    Venue Code <Input {...getFieldProps('code')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.code && errors.code) === true
                        ? `${touched.code && errors.code}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Venue Name{' '}
                  </Grid>
                  <Grid item xs={9}>
                    <Input {...getFieldProps('name')} sx={{ marginLeft: '1em', width: '50%' }} />
                    <span className="error-message">
                      {Boolean(touched.name && errors.name) === true
                        ? `${touched.name && errors.name}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Fee (bps)
                  </Grid>
                  <Grid item xs={9}>
                    <Input {...getFieldProps('fee')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.fee && errors.fee) === true
                        ? `${touched.fee && errors.fee}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Wallet Name
                  </Grid>
                  <Grid item xs={9}>
                    <Input {...getFieldProps('wallet_name')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.wallet_name && errors.wallet_name) === true
                        ? `${touched.wallet_name && errors.wallet_name}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Wallet Address
                  </Grid>
                  <Grid item xs={9}>
                    <Input {...getFieldProps('wallet_addr')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.wallet_addr && errors.wallet_addr) === true
                        ? `${touched.wallet_addr && errors.wallet_addr}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Bank Name
                  </Grid>
                  <Grid item xs={3}>
                    <Input {...getFieldProps('bank_name')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.bank_name && errors.bank_name) === true
                        ? `${touched.bank_name && errors.bank_name}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Account Name
                  </Grid>
                  <Grid item xs={3}>
                    <Input {...getFieldProps('account_name')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.account_name && errors.account_name) === true
                        ? `${touched.account_name && errors.account_name}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Bank Number
                  </Grid>
                  <Grid item xs={3}>
                    <Input {...getFieldProps('bank_number')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.bank_number && errors.bank_number) === true
                        ? `${touched.bank_number && errors.bank_number}`
                        : ''}
                    </span>
                  </Grid>
                  <Grid item xs={3}>
                    Account Number
                  </Grid>
                  <Grid item xs={3}>
                    <Input {...getFieldProps('account_number')} sx={{ marginLeft: '1em' }} />
                    <span className="error-message">
                      {Boolean(touched.account_number && errors.account_number) === true
                        ? `${touched.account_number && errors.account_number}`
                        : ''}
                    </span>
                  </Grid>
                  {prop.type === 'Update' ? (
                    <>
                      <Grid item xs={3}>
                        Create at
                      </Grid>
                      <Grid item xs={3}>
                        <Paper sx={{ paddingLeft: '1em' }}>
                          {venueData ? moment(venueData.create_at).format('YYYY/MM/DD kk:mm') : ''}
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        Update at
                      </Grid>
                      <Grid item xs={3} sx={{ paddingLeft: '1em' }}>
                        <Paper sx={{ paddingLeft: '1em' }}>
                          {venueData ? moment(venueData.update_at).format('YYYY/MM/DD kk:mm') : ''}
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        Status
                      </Grid>
                      <Grid item xs={3} sx={{ paddingLeft: '1em' }}>
                        <Paper sx={{ paddingLeft: '1em', color: 'green' }}>
                          {venueData ? venueData.status : ''}
                        </Paper>
                      </Grid>
                    </>
                  ) : null}
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
