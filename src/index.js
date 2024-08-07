//import './wdyr.js';
import React from 'react';
import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorPage from './error.jsx';
import App from './App';
import * as serviceWorker from './serviceWorker';

const router = createBrowserRouter([
    {
      path: "/mapsok",
      element: <App/ >
      // children: [
      //   {
      //     path:":cdmcol/:cdmn",
      //     element: 
      //   }
      // ]
    }
  ]);
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode> 
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
