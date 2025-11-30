import React from 'react';
import { motion } from 'framer-motion';

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '—';
  const crores = val / 1e7;
  const absVal = Math.abs(crores);
  const formatted = absVal.toLocaleString('en-IN', { maximumFractionDigits: 1 });
  const sign = crores < 0 ? '-' : '';
  return `₹${sign}${formatted} Cr`;
};

const Card = ({ title, children, accent = "ink" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="border-3 border-ledger-ink bg-ledger-bg shadow-hard"
  >
    <div className={`border-b-3 border-ledger-ink px-4 py-2 bg-ledger-${accent} text-ledger-bg`}>
      <h3 className="font-serif font-bold uppercase tracking-wider text-xs">{title}</h3>
    </div>
    <div className="p-4 space-y-2">
      {children}
    </div>
  </motion.div>
);

const MetricRow = ({ label, value, subtext, isGood }) => (
  <div className="flex items-center justify-between py-2 border-b border-dashed border-ledger-ink/20 last:border-0">
    <div>
      <div className="text-xs uppercase font-semibold text-ledger-ink/70">{label}</div>
      {subtext && <div className="text-[10px] text-ledger-ink/40">{subtext}</div>}
    </div>
    <div className={`text-base font-bold font-mono ${isGood === false ? 'text-ledger-red' : 'text-ledger-ink'}`}>
      {value}
    </div>
  </div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase bg-ledger-ink text-ledger-bg px-2 py-0.5">
    {children}
  </span>
);

const FinancialTable = ({ title, rows, series }) => {
  const periods = (() => {
    for (const key of Object.keys(series || {})) {
      if (series[key] && series[key].length) {
        return series[key].map((item) => item.period);
      }
    }
    return [];
  })();

  const getValueFor = (key, period) => {
    const rowSeries = series[key] || [];
    const match = rowSeries.find((entry) => entry.period === period);
    return match ? formatCurrency(match.value) : '—';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-3 border-ledger-ink bg-ledger-bg shadow-hard"
    >
      <div className="border-b-3 border-ledger-ink bg-ledger-ink text-ledger-bg px-4 py-2">
        <span className="font-serif font-bold uppercase tracking-wider text-xs">{title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-ledger-paper border-b-2 border-ledger-ink/30">
              <th className="text-left px-4 py-2 uppercase tracking-wider text-[10px] text-ledger-ink/60">Metric</th>
              {periods.map((p) => (
                <th key={p} className="text-right px-3 py-2 uppercase tracking-wider text-[10px] text-ledger-ink/60">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-ledger-ink/10 last:border-0 hover:bg-ledger-paper/50">
                <td className="px-4 py-2 font-semibold uppercase text-[10px] text-ledger-ink/70">{row.label}</td>
                {periods.map((p) => (
                  <td key={p} className="px-3 py-2 text-right">{getValueFor(row.key, p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ data }) => {
  if (!data) return null;
  const statements = data.statements || {};
  const incomeStatement = statements.income_statement || {};
  const balanceSheet = statements.balance_sheet || {};
  const cashFlow = statements.cash_flow || {};

  return (
    <div className="space-y-6">
      {/* COMPANY HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start justify-between gap-6"
      >
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>NSE INDIA</Pill>
            <Pill>{data.meta.currency}</Pill>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-tight">{data.meta.ticker}</h2>
          <p className="font-serif text-base leading-relaxed text-ledger-ink/80 border-l-3 border-ledger-red pl-4 italic">
            "{data.ai_summary}"
          </p>
        </div>
        
        <div className="shrink-0 border-3 border-ledger-ink p-4 text-center bg-ledger-paper shadow-hard w-full md:w-48">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ledger-ink/60 mb-1">Stability Score</div>
          <div className={`text-4xl font-mono font-bold ${data.score.risk_level === 'High' ? 'text-ledger-red' : 'text-ledger-blue'}`}>
            {data.score.altman_z}
          </div>
          <div className="text-xs font-bold uppercase bg-ledger-ink text-ledger-bg py-1 mt-2">
            {data.score.risk_level} RISK
          </div>
        </div>
      </motion.div>

      {/* QUICK STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cash Conv. Cycle', value: `${data.liquidity.ccc_days} days` },
          { label: 'Inventory Days', value: `${data.liquidity.inv_days} days` },
          { label: 'Receivable Days', value: `${data.liquidity.rec_days} days` },
          { label: 'Current Ratio', value: data.liquidity.current_ratio },
        ].map((stat) => (
          <div key={stat.label} className="border-3 border-ledger-ink bg-ledger-paper p-3 text-center shadow-hard">
            <div className="text-[10px] uppercase text-ledger-ink/60 font-semibold">{stat.label}</div>
            <div className="font-mono text-lg font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ANALYSIS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Solvency Analysis" accent="red">
          <MetricRow 
            label="Altman Z-Score" 
            value={data.score.altman_z} 
            subtext="Target: > 3.0"
            isGood={data.score.altman_z > 1.8}
          />
          <MetricRow 
            label="Debt / Equity" 
            value={`${data.solvency.debt_to_equity}x`}
            subtext="Leverage ratio"
            isGood={data.solvency.debt_to_equity < 2.0} 
          />
          <MetricRow 
            label="Int. Coverage" 
            value={`${data.solvency.interest_coverage}x`}
            subtext="EBITDA / Interest"
            isGood={data.solvency.interest_coverage > 2.0}
          />
        </Card>

        <Card title="Liquidity Cycle" accent="blue">
          <MetricRow 
            label="Cash Conv. Cycle" 
            value={`${data.liquidity.ccc_days} Days`}
            subtext="Capital trapped"
            isGood={data.liquidity.ccc_days < 120}
          />
          <MetricRow 
            label="Inventory Days" 
            value={`${data.liquidity.inv_days} Days`}
            subtext="Stock sitting"
          />
          <MetricRow 
            label="Receivable Days" 
            value={`${data.liquidity.rec_days} Days`}
            subtext="Collections speed"
          />
        </Card>

        <Card title="Operational Truth" accent="ink">
          <MetricRow 
            label="Gross Margin" 
            value={`${data.quality.gross_margin}%`}
            subtext="Pricing power"
          />
          <MetricRow 
            label="Operating Cash" 
            value={formatCurrency(data.quality.ocf)}
            subtext="Real cash flow"
            isGood={data.quality.ocf > 0}
          />
          <MetricRow 
            label="Quality Gap" 
            value={formatCurrency(data.quality.quality_gap)}
            subtext="CFO - Net Profit"
            isGood={data.quality.quality_gap > 0}
          />
        </Card>

        <Card title="Ledger Data" accent="ink">
          <MetricRow 
            label="Total Debt" 
            value={formatCurrency(data.solvency.total_debt)}
          />
          <MetricRow 
            label="Net Income" 
            value={formatCurrency(data.quality.net_income)}
            subtext="Reported profit"
          />
          <div className="pt-2">
            <div className="text-[10px] uppercase text-ledger-ink/60 mb-1">Receivables Days</div>
            <div className="w-full bg-ledger-paper border-2 border-ledger-ink h-2">
              <div 
                className="bg-ledger-blue h-full" 
                style={{ width: `${Math.min(data.liquidity.rec_days, 120)}%` }}
              />
            </div>
            <div className="text-right text-[10px] mt-1 text-ledger-ink/60">{data.liquidity.rec_days} Days</div>
          </div>
        </Card>
      </div>

      {/* FINANCIAL STATEMENTS */}
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ledger-red">
            Historical Ledger (Last 5 Periods)
          </p>
          <h3 className="font-serif text-xl font-bold uppercase">Financial Statements</h3>
        </div>
        
        <FinancialTable
          title="Income Statement"
          series={incomeStatement}
          rows={[
            { key: 'revenue', label: 'Total Revenue' },
            { key: 'gross_profit', label: 'Gross Profit' },
            { key: 'ebitda', label: 'EBITDA' },
            { key: 'net_income', label: 'Net Income' },
          ]}
        />
        <FinancialTable
          title="Balance Sheet"
          series={balanceSheet}
          rows={[
            { key: 'total_assets', label: 'Total Assets' },
            { key: 'total_liabilities', label: 'Total Liabilities' },
            { key: 'equity', label: 'Equity' },
            { key: 'total_debt', label: 'Total Debt' },
          ]}
        />
        <FinancialTable
          title="Cash Flow"
          series={cashFlow}
          rows={[
            { key: 'operating_cash_flow', label: 'Operating Cash Flow' },
            { key: 'capital_expenditure', label: 'Capital Expenditure' },
            { key: 'free_cash_flow', label: 'Free Cash Flow' },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
