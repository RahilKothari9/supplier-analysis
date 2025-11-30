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
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="border-3 border-ledger-ink bg-ledger-bg p-0 flex flex-col h-full shadow-hard"
  >
    <div className={`border-b-3 border-ledger-ink p-3 bg-ledger-${accent} text-ledger-bg`}>
      <h3 className="font-serif font-bold uppercase tracking-wider text-sm">{title}</h3>
    </div>
    <div className="p-4 flex-1 flex flex-col gap-3">
      {children}
    </div>
  </motion.div>
);

const MetricRow = ({ label, value, subtext, isGood }) => (
  <div className="flex items-start justify-between gap-4 pb-3 border-b border-dashed border-ledger-ink/30 last:border-0">
    <div className="space-y-1">
      <div className="text-xs uppercase font-bold text-ledger-ink/60">{label}</div>
      {subtext && <div className="text-[11px] text-ledger-ink/50">{subtext}</div>}
    </div>
    <div className={`text-lg md:text-xl font-bold font-mono text-right ${isGood === false ? 'text-ledger-red' : 'text-ledger-ink'}`}>
      {value}
    </div>
  </div>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase bg-ledger-ink text-ledger-bg px-3 py-1 border-3 border-ledger-ink shadow-hard">
    {children}
  </span>
);

const FinancialTable = ({ title, rows, series }) => {
  // Find a representative series to derive periods
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
    <div className="border-3 border-ledger-ink bg-ledger-bg shadow-hard">
      <div className="border-b-3 border-ledger-ink bg-ledger-ink text-ledger-bg px-4 py-2 font-serif font-bold uppercase tracking-wider text-sm">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-ledger-paper border-b-3 border-ledger-ink">
              <th className="text-left px-4 py-3 uppercase tracking-[0.15em] text-xs text-ledger-ink/70">Metric</th>
              {periods.map((p) => (
                <th key={p} className="text-right px-4 py-3 uppercase tracking-[0.15em] text-xs text-ledger-ink/70">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-b border-ledger-ink/20 last:border-0">
                <td className="px-4 py-2 font-semibold uppercase text-[11px] text-ledger-ink/80">{row.label}</td>
                {periods.map((p) => (
                  <td key={p} className="px-4 py-2 text-right">{getValueFor(row.key, p)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = ({ data }) => {
  if (!data) return null;
  const statements = data.statements || {};
  const incomeStatement = statements.income_statement || {};
  const balanceSheet = statements.balance_sheet || {};
  const cashFlow = statements.cash_flow || {};

  return (
    <div className="space-y-8 pb-20">
      {/* FINANCIAL STATEMENTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ledger-red">
              Historical Ledger (Last 5 Periods)
            </p>
            <h2 className="font-serif text-3xl font-bold uppercase">Financial Statements</h2>
          </div>
        </div>
        <div className="space-y-4">
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
      </section>
      
      {/* VERDICT HEADER */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="border-3 border-ledger-ink p-6 md:p-8 bg-ledger-bg shadow-hard"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Pill>NSE INDIA</Pill>
              <Pill>{data.meta.currency}</Pill>
              <Pill>REPORT #{Math.floor(Math.random() * 9000) + 1000}</Pill>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-tight">{data.meta.ticker}</h2>
            <p className="font-serif text-lg leading-relaxed border-l-4 border-ledger-red pl-4 italic max-w-3xl">
              "{data.ai_summary}"
            </p>
          </div>
          
          <div className="w-full md:w-72 border-3 border-ledger-ink p-5 text-center bg-ledger-paper shadow-hard">
            <div className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Stability Score</div>
            <div className={`text-5xl font-mono font-bold mb-2 ${data.score.risk_level === 'High' ? 'text-ledger-red' : 'text-ledger-blue'}`}>
              {data.score.altman_z}
            </div>
            <div className="text-sm font-bold uppercase bg-ledger-ink text-ledger-bg py-1">
              {data.score.risk_level} RISK
            </div>
            <div className="text-[11px] mt-2 text-ledger-ink/70">Target Altman Z &gt; 3.0</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="border-3 border-ledger-ink bg-ledger-paper p-3 text-center shadow-hard">
            <div className="text-[11px] uppercase text-ledger-ink/70">Cash Conv. Cycle</div>
            <div className="font-mono text-xl font-bold">{data.liquidity.ccc_days} days</div>
          </div>
          <div className="border-3 border-ledger-ink bg-ledger-paper p-3 text-center shadow-hard">
            <div className="text-[11px] uppercase text-ledger-ink/70">Inventory Days</div>
            <div className="font-mono text-xl font-bold">{data.liquidity.inv_days} days</div>
          </div>
          <div className="border-3 border-ledger-ink bg-ledger-paper p-3 text-center shadow-hard">
            <div className="text-[11px] uppercase text-ledger-ink/70">Receivable Days</div>
            <div className="font-mono text-xl font-bold">{data.liquidity.rec_days} days</div>
          </div>
          <div className="border-3 border-ledger-ink bg-ledger-paper p-3 text-center shadow-hard">
            <div className="text-[11px] uppercase text-ledger-ink/70">Current Ratio</div>
            <div className="font-mono text-xl font-bold">{data.liquidity.current_ratio}</div>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* SOLVENCY */}
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

        {/* LIQUIDITY */}
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
          <MetricRow 
            label="Current Ratio" 
            value={data.liquidity.current_ratio} 
            subtext="Assets / Liab"
            isGood={data.liquidity.current_ratio > 1.2}
          />
        </Card>

        {/* OPERATIONS */}
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
          <MetricRow 
            label="Net Income" 
            value={formatCurrency(data.quality.net_income)}
            subtext="Reported profit"
          />
        </Card>

        {/* RAW STATS */}
        <Card title="Ledger Data" accent="ink">
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span>Total Debt</span>
              <span>{formatCurrency(data.solvency.total_debt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Debt / Equity</span>
              <span>{data.solvency.debt_to_equity}x</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Coverage</span>
              <span>{data.solvency.interest_coverage}x</span>
            </div>
            <div className="pt-3 border-t border-ledger-ink/30">
              <div className="text-[11px] uppercase text-ledger-ink/70 mb-1">Receivables Days</div>
              <div className="w-full bg-ledger-paper border-3 border-ledger-ink h-3 shadow-hard">
                <div 
                  className="bg-ledger-blue h-full" 
                  style={{ width: `${Math.min(data.liquidity.rec_days, 120)}%` }}
                />
              </div>
              <div className="text-right text-xs mt-1">{data.liquidity.rec_days} Days</div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
