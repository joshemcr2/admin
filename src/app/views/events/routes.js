import React from 'react';

const routes = [
  {
    path: '/events/settings',
    exact: true,
    capabilities: ['read_organization'],
    component: React.lazy(() => import('./settings')),
  },
  {
    path: '/events/list',
    exact: true,
    component: React.lazy(() => import('./events')),
  },
  {
    path: '/events/NewEvent',
    exact: true,
    component: React.lazy(() => import('./forms/EventForm')),
  },
  {
    path: '/events/event/:eventId',
    exact: true,
    component: React.lazy(() => import('../dashboard/EventDashboard')),
  },
  {
    path: '/events/event/:id/edit',
    exact: true,
    component: React.lazy(() => import('./forms/EventForm')),
  },
  {
    path: '/events/host/:id',
    exact: true,
    component: React.lazy(() => import('./forms/Host')),
  },
  {
    path: '/events/attendees',
    exact: true,
    component: React.lazy(() => import('./attendees')),
  },
];

export default routes;
