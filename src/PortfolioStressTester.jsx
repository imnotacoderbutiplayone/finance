import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const PortfolioStressTester = () => {
  const [portfolio, setPortfolio] = useState([
    { asset: 'US Large Cap Equity', allocation: 40, volatility: 16, beta: 1.0 },
    { asset: 'US Small Cap Equity', allocation: 10, volatility: 22, beta: 1.2 },
    { asset: 'International Equity', allocation: 20, volatility: 18, beta: 0.9 },
    { asset: 'Bonds', allocation: 25, volatility: 4, beta: 0.1 },
    { asset: 'REITs', allocation: 5, volatility: 24, beta: 0.8 }
  ]);

  const [portfolioValue, setPortfolioValue] = useState(1000000);
  const [stressResults, setStressResults] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('2008_crisis');

  const stressScenarios = {
    '2008_crisis': {
      name: '2008 Financial Crisis',
      description: 'Peak-to-trough decline during 2008-2009',
      factors: {
        'US Large Cap Equity': -37.0,
        'US Small Cap Equity': -33.8,
        'International Equity': -43.4,
        'Bonds': 5.2,
        'REITs': -37.7
      }
    },
    '2020_covid': {
      name: 'COVID-19 Crash (Q1 2020)',
      description: 'Rapid market decline in March 2020',
      factors: {
        'US Large Cap Equity': -19.6,
        'US Small Cap Equity': -30.6,
        'International Equity': -23.4,
        'Bonds': 8.7,
        'REITs': -20.2
      }
    },
    'dotcom_crash': {
      name: 'Dot-Com Crash (2000-2002)',
      description: 'Technology bubble burst',
      factors: {
        'US Large Cap Equity': -49.1,
        'US Small Cap Equity': -22.8,
        'International Equity': -45.5,
        'Bonds': 21.1,
        'REITs': 13.9
      }
    },
    'interest_rate_shock': {
      name: 'Interest Rate Shock',
      description: 'Hypothetical 300bp rate increase',
      factors: {
        'US Large Cap Equity': -15.0,
        'US Small Cap Equity': -20.0,
        'International Equity': -18.0,
        'Bonds': -12.0,
        'REITs': -25.0
      }
    },
    'inflation_shock': {
      name: 'Inflation Shock',
      description: 'Persistent high inflation scenario',
      factors: {
        'US Large Cap Equity': -20.0,
        'US Small Cap Equity': -25.0,
        'International Equity': -22.0,
        'Bonds': -15.0,
        'REITs': 10.0
      }
    }
  };

  const [summaryResults, setSummaryResults] = useState({
    totalLoss: 0,
    totalLossPercent: 0,
    worstAsset: { name: '', loss: 0 },
    bestAsset: { name: '', gain: 0 },
    finalValue: 0
  });

  const calculateStressTest = () => {
    const scenario = stressScenarios[selectedScenario];
    const results = [];

    let totalLoss = 0;
    let worstAsset = { name: '', loss: 0 };
    let bestAsset = { name: '', gain: 0 };

    portfolio.forEach(asset => {
      const stressFactor = scenario.factors[asset.asset] || 0;
      const assetValue = portfolioValue * (asset.allocation / 100);
      const stressedValue = assetValue * (1 + stressFactor / 100);
      const loss = stressedValue - assetValue;

      totalLoss += loss;

      if (loss < worstAsset.loss) {
        worstAsset = { name: asset.asset, loss: loss };
      }

      if (loss > bestAsset.gain) {
        bestAsset = { name: asset.asset, gain: loss };
      }

      results.push({
        asset: asset.asset,
        allocation: asset.allocation,
        originalValue: assetValue,
        stressedValue: stressedValue,
        dollarChange: loss,
        percentChange: stressFactor,
        contributionToLoss: (loss / portfolioValue) * 100
      });
    });

    setStressResults(results);
    setSummaryResults({
      totalLoss,
      totalLossPercent: (totalLoss / portfolioValue) * 100,
      worstAsset,
      bestAsset,
      finalValue: portfolioValue + totalLoss
    });
  };

  useEffect(() => {
    calculateStressTest();
  }, [selectedScenario, portfolio, portfolioValue]);

  return <div>Portfolio Stress Tester Component</div>; // Simplified for demo
};

export default PortfolioStressTester;
