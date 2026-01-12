import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import { ReportData } from '@/app/actions/reports';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('T')[0].split('-');
  // If format is YYYY-MM-DD
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

interface LedgerPDFProps {
  data: ReportData;
}

export default function LedgerPDF({ data }: LedgerPDFProps) {
  const { organization, period, entries, accounts, initialBalances } = data;

  // Filter accounts that have activity or balance
  const activeAccounts = accounts.filter(acc => {
    const hasBalance = Math.abs(initialBalances[acc.code] || 0) > 0.001;
    const hasEntries = entries.some(e => e.account_code === acc.code);
    return hasBalance || hasEntries;
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{organization?.name || 'Organización Sin Nombre'}</Text>
            <Text style={styles.orgDetail}>{organization?.rif ? `RIF: ${organization.rif}` : ''}</Text>
            <Text style={styles.orgDetail}>{organization?.address || ''}</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>LIBRO MAYOR</Text>
            <Text style={styles.reportPeriod}>
              Desde: {formatDate(period.start)} - Hasta: {formatDate(period.end)}
            </Text>
          </View>
        </View>

        {/* CONTENT BY ACCOUNT */}
        {activeAccounts.map((account) => {
          const accountEntries = entries.filter(e => e.account_code === account.code);
          const initialBalance = initialBalances[account.code] || 0;

          let runningBalance = initialBalance;
          const totalDebit = accountEntries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
          const totalCredit = accountEntries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);
          const finalBalance = initialBalance + totalDebit - totalCredit;

          return (
            <View key={account.code} style={styles.section}>
              {/* Account Title */}
              <Text style={styles.sectionTitle}>
                {account.code} - {account.name}
              </Text>

              {/* Table */}
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={[styles.tableCell, { width: '12%' }]}>
                    <Text>FECHA</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '43%' }]}>
                    <Text>DESCRIPCIÓN</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.textRight}>DEBE</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.textRight}>HABER</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
                    <Text style={styles.textRight}>SALDO</Text>
                  </View>
                </View>

                {/* Initial Balance Row */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, { width: '12%' }]}>
                    <Text>{formatDate(period.start)}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '43%' }]}>
                    <Text style={styles.bold}>SALDO INICIAL</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.textRight}>-</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.textRight}>-</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
                    <Text style={styles.textRight}>{formatCurrency(initialBalance)}</Text>
                  </View>
                </View>

                {/* Entries Rows */}
                {accountEntries.map((entry, idx) => {
                  const debit = Number(entry.debit) || 0;
                  const credit = Number(entry.credit) || 0;

                  // Update running balance logic depends on account type normally,
                  // but here we assume Assets/Expenses are positive, Liability/Income negative storage or similar?
                  // Based on reports.ts logic: "initialBalances[e.account_code] = current + (e.debit || 0) - (e.credit || 0)"
                  // So Balance = Previous + Debit - Credit
                  runningBalance = runningBalance + debit - credit;

                  return (
                    <View key={entry.id || idx} style={styles.tableRow}>
                      <View style={[styles.tableCell, { width: '12%' }]}>
                        <Text>{formatDate(entry.date)}</Text>
                      </View>
                      <View style={[styles.tableCell, { width: '43%' }]}>
                        <Text>{entry.description}</Text>
                      </View>
                      <View style={[styles.tableCell, { width: '15%' }]}>
                        <Text style={styles.textRight}>{debit > 0 ? formatCurrency(debit) : '-'}</Text>
                      </View>
                      <View style={[styles.tableCell, { width: '15%' }]}>
                        <Text style={styles.textRight}>{credit > 0 ? formatCurrency(credit) : '-'}</Text>
                      </View>
                      <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
                        <Text style={styles.textRight}>{formatCurrency(runningBalance)}</Text>
                      </View>
                    </View>
                  );
                })}

                {/* Total Row */}
                <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 0 }]}>
                  <View style={[styles.tableCell, { width: '55%', borderRightWidth: 0 }]}>
                    <Text style={[styles.textRight, styles.bold, { paddingRight: 10 }]}>SALDO FINAL:</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%', borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
                    <Text style={[styles.textRight, styles.bold]}>{formatCurrency(totalDebit)}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={[styles.textRight, styles.bold]}>{formatCurrency(totalCredit)}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
                    <Text style={[styles.textRight, styles.bold]}>{formatCurrency(finalBalance)}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Generado automáticamente por ETHOS v2.0 - Sistema de Gestión Contable</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
