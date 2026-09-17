import React, { useState, useEffect } from 'react';

import {
  Building2,
  ShieldAlert,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import api from '../services/api';
import { useNavigate } from 'react-router-dom';


/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState(null);
  const [riskDist, setRiskDist] = useState({});
  const [highRiskProjects, setHighRiskProjects] = useState([]);
  const [loading, setLoading] = useState(true);


  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const [
        kpiRes,
        distRes,
        projRes,
      ] = await Promise.all([
        api.get('/risk/summary'),
        api.get('/analytics/risk-distribution'),
        api.get('/projects?limit=6&risk_category=HIGH'),
      ]);

      setKpis(kpiRes.data);
      setRiskDist(distRes.data || {});
      setHighRiskProjects(
        projRes.data?.items || []
      );

    } catch (error) {
      console.error(
        'Failed to load dashboard data:',
        error
      );
    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-spinner"></div>

        <h2>
          Loading Infrastructure Intelligence Center...
        </h2>

        <p>
          Connecting to InfraPredict AI...
        </p>

      </div>
    );
  }


  /* =======================================================
     KPI DATA
  ======================================================= */

  const totalProjects =
    kpis?.total_projects ?? 1775;

  const highRiskCount =
    kpis?.high_risk_projects ?? 235;

  const delayRiskCount =
    kpis?.schedule_delay_risk_projects ?? 482;

  const costRiskCount =
    kpis?.cost_overrun_risk_projects ?? 304;

  const mediumRisk =
    kpis?.medium_risk_projects ??
    riskDist?.medium ??
    405;

  const lowRisk =
    kpis?.low_risk_projects ??
    riskDist?.low ??
    1135;

  const criticalRisk =
    kpis?.critical_risk_projects ??
    riskDist?.critical ??
    0;


  /* =======================================================
     PIE CHART
  ======================================================= */

  const pieData = [
    {
      name: 'Low',
      value: lowRisk,
      color: '#2563eb',
    },
    {
      name: 'Medium',
      value: mediumRisk,
      color: '#eab308',
    },
    {
      name: 'High',
      value: highRiskCount,
      color: '#f43f5e',
    },
    {
      name: 'Critical',
      value: criticalRisk,
      color: '#fb7185',
    },
  ].filter(
    item => item.value > 0
  );


  /* =======================================================
     TREND DATA
  ======================================================= */

  const trendData = [
    {
      month: 'Apr',
      costOverrun: 120,
      timeOverrun: 180,
    },
    {
      month: 'May',
      costOverrun: 160,
      timeOverrun: 230,
    },
    {
      month: 'Jun',
      costOverrun: 210,
      timeOverrun: 290,
    },
    {
      month: 'Jul',
      costOverrun: 250,
      timeOverrun: 350,
    },
    {
      month: 'Aug',
      costOverrun: 285,
      timeOverrun: 410,
    },
    {
      month: 'Sep',
      costOverrun: costRiskCount,
      timeOverrun: delayRiskCount,
    },
  ];


  /* =======================================================
     MAIN UI
  ======================================================= */

  return (

    <div className="dashboard-container">


      {/* =================================================
          HERO SECTION
      ================================================= */}

      <section className="dashboard-hero">

        <h1>
          See{' '}
          <span className="cyan-text">
            risks
          </span>{' '}
          before they
          <br />
          become{' '}
          <span className="red-text">
            delays
          </span>
          .
        </h1>

        <p>
          AI-powered monitoring and predictive
          insights for infrastructure projects.
        </p>

      </section>



      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="kpi-grid">


        {/* TOTAL PROJECTS */}

        <KpiCard
          title="TOTAL PROJECTS"
          value={totalProjects.toLocaleString()}
          change="↑ 12%"
          description="Under monitoring"
          icon={
            <Building2 size={20} />
          }
          background="#0a223d"
          border="#14355a"
          iconBackground="#14355a"
          iconColor="#00d2ff"
          changeColor="#00d2ff"
        />


        {/* HIGH RISK */}

        <KpiCard
          title="HIGH RISK"
          value={highRiskCount.toLocaleString()}
          change="↑ 8%"
          description="Need immediate attention"
          icon={
            <ShieldAlert size={20} />
          }
          background="#260e1d"
          border="#4a1531"
          iconBackground="#4a1531"
          iconColor="#f43f5e"
          changeColor="#f43f5e"
        />


        {/* DELAY RISK */}

        <KpiCard
          title="DELAY RISK"
          value={delayRiskCount.toLocaleString()}
          change="↑ 5%"
          description="At risk of delay"
          icon={
            <Clock size={20} />
          }
          background="#eab308"
          border="#eab308"
          iconBackground="rgba(69,26,3,0.15)"
          iconColor="#451a03"
          changeColor="#451a03"
          light
        />


        {/* COST RISK */}

        <KpiCard
          title="COST RISK"
          value={costRiskCount.toLocaleString()}
          change="↑ 5%"
          description="At risk of cost overrun"
          icon={
            <DollarSign size={20} />
          }
          background="#07182c"
          border="#14355a"
          iconBackground="#14355a"
          iconColor="#00d2ff"
          changeColor="#00d2ff"
        />

      </section>



      {/* =================================================
          ANALYTICS SECTION
      ================================================= */}

      <section className="analytics-grid">


        {/* =================================================
            PROJECT STATUS
        ================================================= */}

        <Panel>

          <PanelHeader
            title="Project Status Overview"
            subtitle="Portfolio health at a glance"
            action="View All →"
            onClick={() =>
              navigate('/projects')
            }
          />


          <div className="donut-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={4}
                >

                  {pieData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}

                </Pie>


                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      '#17243a',

                    border:
                      '1px solid #334155',

                    borderRadius:
                      '8px',

                    color:
                      '#ffffff',

                    fontSize:
                      '13px',
                  }}
                />

              </PieChart>

            </ResponsiveContainer>


            {/* CENTER VALUE */}

            <div className="donut-center">

              <div>
                {totalProjects.toLocaleString()}
              </div>

              <span>
                Projects
              </span>

            </div>

          </div>

        </Panel>



        {/* =================================================
            RISK DISTRIBUTION
        ================================================= */}

        <Panel>

          <PanelHeader
            title="Risk Distribution Across Projects"
            subtitle="Portfolio exposure by risk level"
            action="View Map →"
          />


          <div className="risk-distribution">


            {/* MAP ICON */}

            <div className="risk-map">

              <MapPin
                size={36}
                color="#00d2ff"
                strokeWidth={1.8}
              />

            </div>


            {/* RISK VALUES */}

            <div className="risk-list">

              <RiskRow
                color="#fb7185"
                label="Critical"
                value={criticalRisk}
              />

              <RiskRow
                color="#f43f5e"
                label="High"
                value={highRiskCount}
              />

              <RiskRow
                color="#eab308"
                label="Medium"
                value={mediumRisk}
              />

              <RiskRow
                color="#2563eb"
                label="Low"
                value={lowRisk}
              />

            </div>

          </div>

        </Panel>



        {/* =================================================
            COST & DELAY TREND
        ================================================= */}

        <Panel>

          <PanelHeader
            title="Cost & Delay Trend"
            subtitle="Last 6 months"
            action="View Details →"
            onClick={() =>
              navigate('/analytics')
            }
          />


          <div className="trend-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={trendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 0,
                }}
              >

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: '#8192a9',
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: '#334155',
                  }}
                  tickLine={false}
                />


                <YAxis
                  tick={{
                    fill: '#8192a9',
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />


                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      '#17243a',

                    border:
                      '1px solid #334155',

                    borderRadius:
                      '8px',

                    color:
                      '#ffffff',

                    fontSize:
                      '13px',
                  }}
                />


                <Line
                  type="monotone"
                  dataKey="costOverrun"
                  name="Cost Overrun"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                  }}
                />


                <Line
                  type="monotone"
                  dataKey="timeOverrun"
                  name="Time Overrun"
                  stroke="#00d2ff"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </Panel>

      </section>



      {/* =================================================
          SUMMARY STRIP
      ================================================= */}

      <section className="summary-strip">


        <div className="summary-metrics">

          <SummaryMetric
            value={highRiskCount}
            label="Critical / High Risk"
          />

          <SummaryMetric
            value={delayRiskCount}
            label="Schedule Delays"
          />

          <SummaryMetric
            value="45.1%"
            label="Avg Budget Utilization"
          />

        </div>


        <button
          className="view-all-button"
          onClick={() =>
            navigate('/projects')
          }
        >
          View All →
        </button>

      </section>



      {/* =================================================
          HIGH RISK PROJECTS TABLE
      ================================================= */}

      <section className="projects-panel">


        {/* HEADER */}

        <div className="projects-header">

          <div>

            <h3>
              Recent High-Risk Projects
            </h3>

            <p>
              Highest priority projects
              from the live database
            </p>

          </div>


          <button
            className="view-projects-button"
            onClick={() =>
              navigate('/projects')
            }
          >
            View All Projects →
          </button>

        </div>



        {/* TABLE */}

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  PROJECT NAME
                </th>

                <th>
                  MINISTRY
                </th>

                <th>
                  SECTOR
                </th>

                <th>
                  COST (₹ CR)
                </th>

                <th>
                  EXPENDITURE (₹ CR)
                </th>

                <th>
                  DELAY
                </th>

                <th>
                  RISK
                </th>

              </tr>

            </thead>


            <tbody>

              {highRiskProjects.map(
                (project) => (

                  <tr
                    key={project.id}
                  >

                    <td className="project-name">

                      {project.project_name}

                    </td>


                    <td>
                      {project.ministry}
                    </td>


                    <td>
                      {project.sector}
                    </td>


                    <td className="cost-value">

                      {project.current_cost}

                    </td>


                    <td>

                      {project.expenditure}

                    </td>


                    <td className="muted-value">

                      —

                    </td>


                    <td>

                      <span className="risk-badge">
                        High
                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>



      {/* =================================================
          RESPONSIVE CSS
      ================================================= */}

      <style>{`

        /* ================================================
           MAIN DASHBOARD
        ================================================ */

        .dashboard-container {
          width: 100%;
          max-width: 1800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* ================================================
           LOADING
        ================================================ */

        .dashboard-loading {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          text-align: center;
        }

        .dashboard-loading h2 {
          margin-top: 18px;
          color: #ffffff;
          font-size: 20px;
        }

        .dashboard-loading p {
          margin-top: 6px;
          font-size: 14px;
          color: #718198;
        }

        .loading-spinner {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 4px solid #1e3a5f;
          border-top-color: #00d2ff;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* ================================================
           HERO
        ================================================ */

        .dashboard-hero {
          padding:
            4px
            0
            2px;
        }

        .dashboard-hero h1 {
          margin: 0;
          color: #ffffff;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .dashboard-hero p {
          margin-top: 8px;
          color: #9fb0c7;
          font-size: 15px;
          line-height: 1.5;
        }

        .cyan-text {
          color: #00d2ff;
        }

        .red-text {
          color: #f43f5e;
        }


        /* ================================================
           KPI GRID
        ================================================ */

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
        }


        /* ================================================
           ANALYTICS GRID
        ================================================ */

        .analytics-grid {
          display: grid;
          grid-template-columns:
            1fr
            1fr
            1.15fr;
          gap: 14px;
        }


        /* ================================================
           DONUT
        ================================================ */

        .donut-container {
          height: 200px;
          position: relative;
          margin-top: 2px;
        }

        .donut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform:
            translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .donut-center div {
          color: #ffffff;
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
        }

        .donut-center span {
          display: block;
          margin-top: 4px;
          color: #8192a9;
          font-size: 12px;
        }


        /* ================================================
           RISK DISTRIBUTION
        ================================================ */

        .risk-distribution {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          gap: 25px;
        }

        .risk-map {
          width: 100px;
          height: 110px;
          flex-shrink: 0;

          background-color: #14253d;

          clip-path:
            polygon(
              50% 0%,
              100% 38%,
              82% 100%,
              18% 100%,
              0% 38%
            );

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .risk-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 150px;
        }


        /* ================================================
           TREND
        ================================================ */

        .trend-container {
          height: 200px;
          margin-top: 2px;
        }


        /* ================================================
           SUMMARY
        ================================================ */

        .summary-strip {
          min-height: 78px;

          background-color: #07182c;

          border:
            1px solid #14355a;

          border-radius: 12px;

          padding:
            15px
            22px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .summary-metrics {
          display: flex;
          align-items: center;
          gap: 60px;
        }

        .view-all-button,
        .view-projects-button {
          border: none;
          background: transparent;
          color: #00d2ff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .view-all-button:hover,
        .view-projects-button:hover {
          color: #67e8f9;
        }


        /* ================================================
           PROJECTS TABLE
        ================================================ */

        .projects-panel {
          background-color: #0b1626;
          border: 1px solid #182840;
          border-radius: 12px;
          padding: 20px;
          overflow: hidden;
        }

        .projects-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .projects-header h3 {
          margin: 0;
          color: #ffffff;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
        }

        .projects-header p {
          margin-top: 5px;
          color: #718198;
          font-size: 13px;
          line-height: 1.4;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .table-wrapper table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .table-wrapper thead tr {
          border-bottom:
            1px solid #20324d;

          color: #8192a9;

          font-size: 12px;

          font-weight: 700;

          letter-spacing: 0.4px;
        }

        .table-wrapper th {
          padding:
            12px
            10px;

          white-space: nowrap;
        }

        .table-wrapper tbody tr {
          border-bottom:
            1px solid #182840;

          transition:
            background-color
            0.2s
            ease;
        }

        .table-wrapper tbody tr:hover {
          background-color:
            rgba(20, 50, 80, 0.25);
        }

        .table-wrapper td {
          padding:
            13px
            10px;

          color: #a8b6c9;

          font-size: 14px;

          line-height: 1.4;

          white-space: nowrap;
        }

        .table-wrapper td.project-name {
          max-width: 380px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #ffffff;
          font-weight: 650;
        }

        .table-wrapper td.cost-value {
          color: #ffffff;
          font-weight: 700;
        }

        .table-wrapper td.muted-value {
          color: #718198;
        }


        /* ================================================
           RESPONSIVE
        ================================================ */

        @media (max-width: 1250px) {

          .kpi-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .analytics-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .analytics-grid > :last-child {
            grid-column:
              1 / -1;
          }

        }


        @media (max-width: 900px) {

          .dashboard-hero h1 {
            font-size: 28px;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .analytics-grid > :last-child {
            grid-column: auto;
          }

          .summary-metrics {
            gap: 30px;
          }

        }


        @media (max-width: 700px) {

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-hero h1 {
            font-size: 26px;
          }

          .dashboard-hero p {
            font-size: 14px;
          }

          .summary-strip {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .summary-metrics {
            width: 100%;
            justify-content: space-between;
            gap: 15px;
          }

          .projects-header {
            align-items: flex-start;
            flex-direction: column;
          }

        }


        @media (max-width: 500px) {

          .summary-metrics {
            flex-direction: column;
            align-items: flex-start;
          }

          .risk-distribution {
            justify-content: center;
          }

          .risk-map {
            width: 80px;
            height: 90px;
          }

          .risk-list {
            min-width: 130px;
          }

        }

      `}</style>

    </div>
  );
}



/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  change,
  description,
  icon,
  background,
  border,
  iconBackground,
  iconColor,
  changeColor,
  light = false,
}) {

  return (

    <div
      style={{
        backgroundColor: background,
        border:
          `1px solid ${border}`,
        borderRadius: '12px',
        padding: '18px',
        minHeight: '120px',
        color:
          light
            ? '#0f172a'
            : '#ffffff',
        boxShadow:
          light
            ? '0 8px 22px rgba(234,179,8,0.25)'
            : 'none',
      }}
    >

      {/* TOP */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          color:
            light
              ? '#451a03'
              : '#a8b6c9',
          fontSize: '12px',
          fontWeight: '750',
          textTransform: 'uppercase',
          letterSpacing: '0.3px',
        }}
      >

        <span>
          {title}
        </span>

        <span
          style={{
            color: changeColor,
            whiteSpace: 'nowrap',
          }}
        >
          {change}
        </span>

      </div>


      {/* VALUE */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '11px',
        }}
      >

        <div
          style={{
            width: '38px',
            height: '38px',
            minWidth: '38px',
            borderRadius: '50%',
            backgroundColor:
              iconBackground,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          {icon}
        </div>


        <div
          style={{
            fontSize: '31px',
            lineHeight: '1',
            fontWeight: '800',
            letterSpacing: '-0.7px',
            color:
              light
                ? '#0f172a'
                : '#ffffff',
          }}
        >
          {value}
        </div>

      </div>


      {/* DESCRIPTION */}

      <div
        style={{
          fontSize: '13px',
          lineHeight: '1.3',
          color:
            light
              ? '#78350f'
              : '#8192a9',
          marginTop: '9px',
        }}
      >
        {description}
      </div>

    </div>
  );
}



/* =========================================================
   PANEL
========================================================= */

function Panel({
  children,
}) {

  return (

    <div
      style={{
        backgroundColor: '#0b1626',
        border:
          '1px solid #182840',
        borderRadius: '12px',
        padding: '18px',
        minWidth: 0,
      }}
    >

      {children}

    </div>

  );
}



/* =========================================================
   PANEL HEADER
========================================================= */

function PanelHeader({
  title,
  subtitle,
  action,
  onClick,
}) {

  return (

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >

      <div>

        <h3
          style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: '1.3',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            marginTop: '5px',
            color: '#718198',
            fontSize: '13px',
            lineHeight: '1.4',
          }}
        >
          {subtitle}
        </p>

      </div>


      {action && (

        <button
          onClick={onClick}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#00d2ff',
            fontSize: '13px',
            fontWeight: '650',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            padding: '2px 0',
          }}
        >
          {action}
        </button>

      )}

    </div>

  );
}



/* =========================================================
   RISK ROW
========================================================= */

function RiskRow({
  color,
  label,
  value,
}) {

  return (

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        fontSize: '14px',
      }}
    >

      <span
        style={{
          width: '9px',
          height: '9px',
          minWidth: '9px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />


      <span
        style={{
          width: '70px',
          color: '#a8b6c9',
        }}
      >
        {label}
      </span>


      <strong
        style={{
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '700',
        }}
      >
        {Number(value).toLocaleString()}
      </strong>

    </div>

  );
}



/* =========================================================
   SUMMARY METRIC
========================================================= */

function SummaryMetric({
  value,
  label,
}) {

  return (

    <div>

      <div
        style={{
          color: '#ffffff',
          fontSize: '21px',
          fontWeight: '800',
          lineHeight: '1.1',
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: '#8fa1b8',
          fontSize: '12px',
          marginTop: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>

    </div>

  );
}