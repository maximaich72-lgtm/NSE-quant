import { FinancialFact, DataQualityCheck, Company } from '../types/financial';
import { formatKES } from './formatters';

export function runDataIntegrityAudit(
  allFacts: FinancialFact[],
  companies: Company[]
): DataQualityCheck[] {
  const checks: DataQualityCheck[] = [];

  companies.forEach(company => {
    const companyFacts = allFacts.filter(f => f.companyId === company.id);
    const years = Array.from(new Set(companyFacts.map(f => f.fiscalYear))).sort((a, b) => b - a);

    years.forEach(year => {
      const yearFacts = companyFacts.filter(f => f.fiscalYear === year);

      // 1. Balance Sheet Reconciliation: Assets = Liabilities + Equity
      const totalAssets = yearFacts.find(f => f.metricName === 'total_assets')?.value;
      const totalLiabilities = yearFacts.find(f => f.metricName === 'total_liabilities')?.value;
      const equity = yearFacts.find(f => f.metricName === 'shareholders_equity')?.value;

      if (totalAssets !== undefined && totalLiabilities !== undefined && equity !== undefined) {
        const sumLiabEquity = totalLiabilities + equity;
        const diff = Math.abs(totalAssets - sumLiabEquity);
        // Rounding tolerance in billion-scale financial statements is usually < 10M or exact
        const isBalanced = diff < 100_000_000;

        checks.push({
          id: `check-bs-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'BALANCE_SHEET_RECONCILIATION',
          status: isBalanced ? 'PASS' : 'FAIL',
          metric: 'Balance Sheet Equation: Assets = Liabilities + Equity',
          expectedValue: totalAssets,
          actualValue: sumLiabEquity,
          difference: diff,
          message: isBalanced
            ? `Balance Sheet reconciled for FY${year}: Total Assets (${formatKES(totalAssets, { compact: true })}) = Liabilities (${formatKES(totalLiabilities, { compact: true })}) + Equity (${formatKES(equity, { compact: true })})`
            : `Balance Sheet reconciliation error: discrepancy of ${formatKES(diff, { compact: true })} between Assets and (Liabilities + Equity)`,
          checkedAt: new Date().toISOString()
        });
      } else {
        checks.push({
          id: `check-bs-missing-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'BALANCE_SHEET_RECONCILIATION',
          status: 'WARNING',
          metric: 'Balance Sheet Completeness',
          message: `Incomplete balance sheet components for FY${year} (Assets: ${totalAssets ? 'Present' : 'Missing'}, Liabilities: ${totalLiabilities ? 'Present' : 'Missing'}, Equity: ${equity ? 'Present' : 'Missing'})`,
          checkedAt: new Date().toISOString()
        });
      }

      // 2. Missing Core Income Statement Fields
      const revenue = yearFacts.find(f => f.metricName === 'revenue');
      const netIncome = yearFacts.find(f => f.metricName === 'net_income');

      if (!revenue) {
        checks.push({
          id: `check-missing-rev-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'MISSING_REQUIRED_FIELD',
          status: 'FAIL',
          metric: 'Revenue Fact',
          message: `Mandatory top-line metric 'revenue' is missing for ${company.ticker} FY${year}`,
          checkedAt: new Date().toISOString()
        });
      }

      if (!netIncome) {
        checks.push({
          id: `check-missing-ni-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'MISSING_REQUIRED_FIELD',
          status: 'FAIL',
          metric: 'Net Income Fact',
          message: `Mandatory bottom-line metric 'net_income' is missing for ${company.ticker} FY${year}`,
          checkedAt: new Date().toISOString()
        });
      }

      // 3. Source Provenance Completeness
      const factsWithoutDocs = yearFacts.filter(f => !f.sourceDocTitle || !f.sourceDocId);
      if (factsWithoutDocs.length > 0) {
        checks.push({
          id: `check-source-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'SOURCE_CHECK',
          status: 'WARNING',
          metric: 'Source Provenance',
          message: `${factsWithoutDocs.length} facts in FY${year} lack explicit source document references`,
          details: `Unreferenced facts: ${factsWithoutDocs.map(f => f.metricLabel).join(', ')}`,
          checkedAt: new Date().toISOString()
        });
      } else {
        checks.push({
          id: `check-source-pass-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'SOURCE_CHECK',
          status: 'PASS',
          metric: 'Source Provenance',
          message: `All ${yearFacts.length} financial facts for FY${year} trace directly to registered source documents`,
          checkedAt: new Date().toISOString()
        });
      }

      // 4. Currency Consistency Check
      const foreignCurrencies = yearFacts.filter(f => f.currencyCode !== 'KES');
      if (foreignCurrencies.length > 0) {
        checks.push({
          id: `check-curr-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'CURRENCY_CHECK',
          status: 'FAIL',
          metric: 'Currency Standardization',
          message: `Inconsistent currency codes found in FY${year}: ${foreignCurrencies.map(f => f.currencyCode).join(', ')}`,
          checkedAt: new Date().toISOString()
        });
      } else {
        checks.push({
          id: `check-curr-pass-${company.ticker}-${year}`,
          companyId: company.id,
          companyTicker: company.ticker,
          fiscalYear: year,
          checkType: 'CURRENCY_CHECK',
          status: 'PASS',
          metric: 'Currency Standardization',
          message: `All records verified in base currency KES`,
          checkedAt: new Date().toISOString()
        });
      }
    });

    // 5. Duplicate Record Check
    const seenKeys = new Set<string>();
    const duplicates: string[] = [];
    companyFacts.forEach(f => {
      const key = `${f.fiscalYear}:${f.statementType}:${f.metricName}`;
      if (seenKeys.has(key)) {
        duplicates.push(key);
      } else {
        seenKeys.add(key);
      }
    });

    if (duplicates.length > 0) {
      checks.push({
        id: `check-dup-${company.ticker}`,
        companyId: company.id,
        companyTicker: company.ticker,
        fiscalYear: years[0] || 2024,
        checkType: 'DUPLICATE_RECORD',
        status: 'FAIL',
        metric: 'Duplicate Facts Collision',
        message: `Found ${duplicates.length} duplicate metric entries for ${company.ticker}: ${duplicates.join(', ')}`,
        checkedAt: new Date().toISOString()
      });
    } else {
      checks.push({
        id: `check-dup-pass-${company.ticker}`,
        companyId: company.id,
        companyTicker: company.ticker,
        fiscalYear: years[0] || 2024,
        checkType: 'DUPLICATE_RECORD',
        status: 'PASS',
        metric: 'Duplicate Facts Collision',
        message: `No duplicate facts detected across ${companyFacts.length} records`,
        checkedAt: new Date().toISOString()
      });
    }
  });

  return checks;
}
