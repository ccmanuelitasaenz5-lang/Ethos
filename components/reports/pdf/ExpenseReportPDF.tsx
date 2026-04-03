import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import { ReportData } from '@/types/reports';

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

interface ExpenseReportPDFProps {
  data: ReportData;
}

export default function ExpenseReportPDF({ data }: ExpenseReportPDFProps) {
  const { organization, period, entries, accounts } = data;

  // Identify expense accounts (Class 5 or main_type EXPENSE)
  const expenseAccountCodes = new Set(
    accounts
      .filter(a => a.main_type === 'EXPENSE' || a.code.startsWith('5'))
      .map(a => a.code)
  );

  // Filter debit entries to expense accounts (Debit means expense increase)
  const expenseEntries = entries.filter(e =>
    expenseAccountCodes.has(e.account_code) && (Number(e.debit) > 0.001)
  );

  // Group by Account
  interface ExpenseGroup {
    name: string;
    code: string;
    items: any[];
    total: number;
  }

  const groupedExpenses = expenseEntries.reduce((acc, entry) => {
    const code = entry.account_code;
    if (!acc[code]) {
      acc[code] = {
        name: entry.account_name,
        code: code,
        items: [],
        total: 0
      };
    }
    acc[code].items.push(entry);
    acc[code].total += Number(entry.debit);
    return acc;
  }, {} as Record<string, ExpenseGroup>);

  // Sort groups by code
  const sortedGroups = (Object.values(groupedExpenses) as ExpenseGroup[]).sort((a, b) => a.code.localeCompare(b.code));

  const grandTotal = sortedGroups.reduce((sum: number, g: ExpenseGroup) => sum + g.total, 0);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{organization?.name || 'Organización'}</Text>
            <Text style={styles.orgDetail}>{organization?.rif ? `RIF: ${organization.rif}` : ''}</Text>
            <Text style={styles.orgDetail}>{organization?.address || ''}</Text>
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportTitle}>RELACIÓN DE GASTOS</Text>
            <Text style={styles.reportPeriod}>
              Desde: {formatDate(period.start)} - Hasta: {formatDate(period.end)}
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text>FECHA</Text>
            </View>
            <View style={[styles.tableCell, { width: '65%' }]}>
              <Text>DESCRIPCIÓN</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast, { width: '20%' }]}>
              <Text style={styles.textRight}>MONTO</Text>
            </View>
          </View>

          {sortedGroups.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.tableCellLast, { width: '100%', padding: 20 }]}>
                <Text style={[styles.textCenter, { color: '#6B7280' }]}>No hay gastos registrados en este periodo.</Text>
              </View>
            </View>
          ) : (
            sortedGroups.map((group) => (
              <View key={group.code} wrap={false}>
                {/* Group Header */}
                <View style={[styles.tableRow, { backgroundColor: '#F9FAFB' }]}>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '100%', borderRightWidth: 0 }]}>
                    <Text style={[styles.bold, { fontSize: 8 }]}>{group.code} - {group.name}</Text>
                  </View>
                </View>

                {/* Items */}
                {group.items.map((item: any, idx: number) => (
                  <View key={idx} style={styles.tableRow}>
                    <View style={[styles.tableCell, { width: '15%' }]}>
                      <Text>{formatDate(item.date)}</Text>
                    </View>
                    <View style={[styles.tableCell, { width: '65%' }]}>
                      <Text>{item.description}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.tableCellLast, { width: '20%' }]}>
                      <Text style={styles.textRight}>{formatCurrency(Number(item.debit))}</Text>
                    </View>
                  </View>
                ))}

                {/* Group Total */}
                <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.tableCell, { width: '80%', borderRightWidth: 0 }]}>
                    <Text style={[styles.textRight, styles.bold, { fontSize: 8, paddingRight: 10 }]}>Total {group.name}:</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '20%', borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
                    <Text style={[styles.textRight, styles.bold]}>{formatCurrency(group.total)}</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Grand Total */}
          {sortedGroups.length > 0 && (
            <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', marginTop: 10, borderBottomWidth: 0 }]}>
              <View style={[styles.tableCell, { width: '80%', borderRightWidth: 0 }]}>
                <Text style={[styles.textRight, styles.bold, { paddingRight: 10 }]}>TOTAL GASTOS DEL PERIODO:</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast, { width: '20%', borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
                <Text style={[styles.textRight, styles.bold]}>{formatCurrency(grandTotal)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Generado automáticamente por ETHOS v2.0 - Sistema de Gestión Contable</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
