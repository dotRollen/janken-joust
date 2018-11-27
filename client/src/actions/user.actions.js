import { userConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';
import { history } from '../helpers';

const login = (username, password) => {
  const request = (user) => ({ type: userConstants.LOGIN_REQUEST, user })
  const success = (user) => ({ type: userConstants.LOGIN_SUCCESS, user })
  const failure = (error) => ({ type: userConstants.LOGIN_FAILURE, error })

  return dispatch => {
    dispatch(request({ username }));
    userService.login(username, password)
      .then(
        user => {
          dispatch(success(user));
          history.push('/');
        },
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };
}

const logout = () => {
  userService.logout();
  return { type: userConstants.LOGOUT };
}

const getAll = () => {
  const request = () => ({ type: userConstants.GETALL_REQUEST });
  const success = (users) => ({ type: userConstants.GETALL_SUCCESS, users });
  const failure = (error) => ({ type: userConstants.GETALL_FAILURE, error });

  return dispatch => {
    dispatch(request());

    userService.getAll()
      .then(
        users => dispatch(success(users)),
        error => {
          dispatch(failure(error));
          dispatch(alertActions.error(error));
        }
      );
  };
}

export const userActions = {
  login,
  logout,
  getAll
}