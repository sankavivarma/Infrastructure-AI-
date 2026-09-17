import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';

const SIDEBAR_WIDTH = '250px';

export default function MainLayout() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get('/alerts?status_filter=New')
      .then((res) => {
        setAlertCount(res.data?.length || 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#060d19',
        color: '#ffffff',
      }}
    >
      <Sidebar />

      <div
        style={{
          minHeight: '100vh',
          marginLeft: SIDEBAR_WIDTH,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar alertCount={alertCount} />

        <main
          style={{
            flex: 1,
            padding: '24px',
            minWidth: 0,
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}