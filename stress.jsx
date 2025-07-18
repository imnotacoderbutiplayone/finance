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

  // Historical stress scenarios
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

  const handleAllocationChange = (index, newAllocation) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index].allocation = parseFloat(newAllocation);
    setPortfolio(newPortfolio);
  };
  const totalAllocation = portfolio.reduce((sum, asset) => sum + asset.allocation, 0);

  // Data for charts
  const contributionData = stressResults.map(result => ({
    asset: result.asset.replace(' ', '\n'),
    contribution: result.contributionToLoss,
    dollarLoss: result.dollarChange
  }));

  const recoveryData = [];
  for (let months = 0; months <= 60; months++) {
    const recoveryValue = summaryResults.finalValue * Math.pow(1 + 0.08/12, months);
    recoveryData.push({
      months: months,
      value: recoveryValue,
      recovered: recoveryValue >= portfolioValue
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Stress Testing</h1>
        <p className="text-gray-600">Analyze portfolio performance under various market stress scenarios</p>
      </div>

      {/* Portfolio Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Portfolio Configuration</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Value ($)
            </label>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            {portfolio.map((asset, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">{asset.asset}</span>
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    step="0.1"
                    value={asset.allocation}
                    onChange={(e) => handleAllocationChange(index, e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <span className="text-sm text-gray-500 w-6">%</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocation:</span>
              <span className={`font-bold ${totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAllocation.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Stress Scenario</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Scenario
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(stressScenarios).map(([key, scenario]) => (
                <option key={key} value={key}>{scenario.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-gray-900 mb-2">
              {stressScenarios[selectedScenario].name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {stressScenarios[selectedScenario].description}
            </p>
            
            <div className="space-y-2">
              {Object.entries(stressScenarios[selectedScenario].factors).map(([asset, factor]) => (
                <div key={asset} className="flex justify-between text-sm">
                  <span className="text-gray-700">{asset}</span>
                  <span className={`font-medium ${factor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {factor > 0 ? '+' : ''}{factor.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stress Test Results */}
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Stress Test Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <div className="text-sm text-gray-600">Total Portfolio Loss</div>
            <div className="text-2xl font-bold text-red-600">
              ${Math.abs(summaryResults.totalLoss).toLocaleString()}
            </div>
            <div className="text-sm text-red-600">
              {summaryResults.totalLossPercent.toFixed(2)}% decline
            </div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <div className="text-sm text-gray-600">Final Portfolio Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ${summaryResults.finalValue.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <div className="text-sm text-gray-600">Worst Performing Asset</div>
            <div className="text-lg font-bold text-red-600">
              {summaryResults.worstAsset.name}
            </div>
            <div className="text-sm text-red-600">
              ${Math.abs(summaryResults.worstAsset.loss).toLocaleString()} loss
            </div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <div className="text-sm text-gray-600">Best Performing Asset</div>
            <div className="text-lg font-bold text-green-600">
              {summaryResults.bestAsset.name}
            </div>
            <div className="text-sm text-green-600">
              ${Math.abs(summaryResults.bestAsset.gain).toLocaleString()} {summaryResults.bestAsset.gain >= 0 ? 'gain' : 'loss'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Loss Contribution by Asset</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="asset" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Loss Contribution']} />
              <Bar dataKey="contribution" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Recovery Timeline (8% Annual Return)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={recoveryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="months" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey={portfolioValue} stroke="#dc2626" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Results Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Detailed Asset Impact</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stressed Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">$ Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution to Loss</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stressResults.map((result, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.allocation.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${result.originalValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${result.stressedValue.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${result.dollarChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.dollarChange >= 0 ? '+' : ''}${result.dollarChange.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${result.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.percentChange >= 0 ? '+' : ''}{result.percentChange.toFixed(1)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${result.contributionToLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.contributionToLoss.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Risk Assessment</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Portfolio would lose {Math.abs(summaryResults.totalLossPercent).toFixed(1)}% in this scenario</li>
              <li>• Recovery to original value would take approximately {recoveryData.findIndex(d => d.recovered)} months</li>
              <li>• {summaryResults.worstAsset.name} contributes most to portfolio risk</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Potential Actions</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Consider reducing allocation to high-risk assets</li>
              <li>• Evaluate adding defensive positions</li>
              <li>• Review client risk tolerance vs. portfolio risk</li>
              <li>• Consider hedging strategies for downside protection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioStressTester;
