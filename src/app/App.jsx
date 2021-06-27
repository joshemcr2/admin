import '../index.css';
import React from 'react';
import { Provider } from 'react-redux';
import { Router, Switch, Route } from 'react-router-dom';
import { GlobalCss, MatxSuspense } from '../matx';
import { AuthProvider } from './contexts/JWTAuthContext';
import history from '../history';
import MatxTheme from './MatxLayout/MatxTheme/MatxTheme';
import AppContext from './appContext';

import routes from './RootRoutes';
import Store from './redux/Store';
import sessionRoutes from './views/sessions/routes';
import MatxLayout from './MatxLayout/MatxLayoutSFC';
import AuthGuard from './auth/AuthGuard';

const App = () => (
  <AppContext.Provider value={{ routes }}>
    <Provider store={Store}>
      <MatxTheme>
        <GlobalCss>
          <Router history={history}>
            <AuthProvider>
              <MatxSuspense>
                <Switch>
                  {/* AUTHENTICATION PAGES */}
                  {sessionRoutes.map((item, ind) => (
                    <Route
                      // eslint-disable-next-line react/no-array-index-key
                      key={ind}
                      path={item.path}
                      component={item.component}
                    />
                  ))}
                  {/* AUTH PROTECTED PAGES */}
                  <AuthGuard>
                    <MatxLayout />
                  </AuthGuard>
                </Switch>
              </MatxSuspense>
            </AuthProvider>
          </Router>
        </GlobalCss>
      </MatxTheme>
    </Provider>
  </AppContext.Provider>
);

export default App;
