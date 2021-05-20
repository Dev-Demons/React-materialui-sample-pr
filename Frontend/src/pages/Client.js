import React, { useState, useEffect } from 'react';
import { filter } from 'lodash';
import { Icon } from '@iconify/react';
import { sentenceCase } from 'change-case';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
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
  TablePagination
} from '@mui/material';
// components
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// components
import { NotificationContainer, NotificationManager } from 'react-notifications';
import Page from '../components/Page';
import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import SearchNotFound from '../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../components/_dashboard/user';
// eslint-disable-next-line import/no-unresolved
import 'react-notifications/lib/notifications.css';

import * as config from './_Config';

//
// import USERLIST from '../_mocks_/user';
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'id', label: 'ID', alignRight: false },
  { id: 'code', label: 'Client Code', alignRight: false },
  { id: 'name', label: 'Client Name', alignRight: false },
  { id: 'type', label: 'Client Type', alignRight: false },
  { id: 'comm', label: 'Comm. (bps)', alignRight: false },
  { id: '' }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  if (array.length > 0) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    if (query) {
      return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
    }
    return stabilizedThis.map((el) => el[0]);
  }
}

export default function Client() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [USERLIST, setUSERLIST] = useState([]);

  const requestOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  useEffect(() => {
    fetch(`${config.SERVER_URL}/api/clients`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setUSERLIST(data);
      });
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - (USERLIST === undefined ? 0 : USERLIST.length))
      : 0;
  const filteredUsers = applySortFilter(
    USERLIST === undefined ? [] : USERLIST,
    getComparator(order, orderBy),
    filterName
  );
  const isUserNotFound = filteredUsers === undefined ? 0 : filteredUsers.length === 0;

  const handleDeleteItem = (name, id) => {
    confirmAlert({
      title: 'Confirm to delete?',
      message: `Client ${name} is selected.`,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            const options = {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: 'Deleted'
              })
            };
            fetch(`${config.SERVER_URL}/api/clients?id=${id}`, options);
            const updateArray = USERLIST.filter((item) => item.id !== id);
            setUSERLIST(updateArray);

            NotificationManager.success(
              `${name} client has been removed successfully !`,
              'Success',
              500
            );
          }
        },
        {
          label: 'No'
          // onClick: () => alert('Click No')
        }
      ]
    });
  };

  return (
    <Page title="Client | OTC Trade">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Client
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/dashboard/client-new"
            startIcon={<Icon icon={plusFill} />}
          >
            New Client
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers === undefined
                    ? []
                    : filteredUsers
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => {
                          const { id, code, name, commission, type } = row;
                          const isItemSelected = selected.indexOf(name) !== -1;

                          return (
                            <TableRow
                              hover
                              key={id}
                              tabIndex={-1}
                              role="checkbox"
                              selected={isItemSelected}
                              aria-checked={isItemSelected}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={isItemSelected}
                                  onChange={(event) => handleClick(event, name)}
                                />
                              </TableCell>
                              <TableCell align="left">{id}</TableCell>
                              <TableCell align="left">{code}</TableCell>
                              <TableCell component="th" scope="row" padding="none">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar alt={name} />
                                  {name.length <= 20 ? (
                                    <Typography variant="subtitle2" noWrap>
                                      {name}
                                    </Typography>
                                  ) : (
                                    <Typography variant="subtitle2" noWrap>
                                      {name.substr(0, 20)}...
                                    </Typography>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell align="left">{type}</TableCell>
                              <TableCell align="left">{commission}</TableCell>

                              <TableCell align="right">
                                <Button
                                  variant="contained"
                                  color="success"
                                  sx={{ marginRight: '1em' }}
                                  component={RouterLink}
                                  to={`/dashboard/client-modify?id=${id}`}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={(event) => {
                                    handleDeleteItem(name, id);
                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
                {isUserNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={USERLIST.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
      <NotificationContainer />
    </Page>
  );
}
