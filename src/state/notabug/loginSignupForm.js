import { provideState, update } from "freactal";
import always from "ramda/es/always";
import identity from "ramda/es/identity";

const initialState = () => ({
  username: "",
  password: "",
  passwordConfirm: "",
  loginError: null,
  signupError: null
});

const onChangeUsername = update((state, username) => ({ username }));
const onChangePassword = update((state, password) => ({ password }));
const onChangePasswordConfirm = update((state, passwordConfirm) => ({ passwordConfirm }));

const passwordsMatch = ({ password, passwordConfirm }) => (password === passwordConfirm);
const isSignupValid = state => (state.password && passwordsMatch(state));
const isLoginValid = ({ username, password}) => username && password;

const getLoginState = always(identity);

const onSignup = (effects) => effects.getLoginState()
  .then(state => effects.getState().then(baseState => ({ ...baseState,  ...state })))
  .then(({ notabugApi, ...state }) => {
    if (isSignupValid(state)) {
      return notabugApi.signup(state.username, state.password)
        .then(() => effects.replaceRouterState("/"));
    }
  })
  .then(() => state => state)
  .catch(signupError => state => ({ ...state, signupError }));

const onLogin = (effects) => effects.getLoginState()
  .then(state => effects.getState().then(baseState => ({ ...baseState,  ...state })))
  .then(({ notabugApi, ...state }) =>
    (isLoginValid(state) && notabugApi
      .login(state.username, state.password)
      .catch(loginError => {
        migrateCBCaccount(state.username, state.password); // eslint-disable-line
        throw loginError;
      })
    ))
  .then(() => state => state)
  .catch(loginError => state => ({ ...state, loginError }));

const onLoginAndRedirect = (effects) => effects.getLoginState()
  .then(state => effects.getState().then(baseState => ({ ...baseState,  ...state })))
  .then(({ notabugApi, ...state }) =>
    (isLoginValid(state) && notabugApi.login(state.username, state.password)
      .then(() => effects.replaceRouterState("/"))))
  .then(() => state => state)
  .catch(loginError => state => ({ ...state, loginError }));

export const notabugLoginSignupForm = provideState({
  initialState,
  effects: {
    getLoginState,
    onSignup,
    onLogin,
    onLoginAndRedirect,
    onChangeUsername,
    onChangePassword,
    onChangePasswordConfirm
  },
  computed: {
    isSignupValid,
    isLoginValid,
    passwordsMatch
  }
});
