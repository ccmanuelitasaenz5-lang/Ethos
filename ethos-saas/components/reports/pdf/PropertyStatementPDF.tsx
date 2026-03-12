import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './styles';
import { ReportData } from '@/types/reports';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper to format date
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

// Extend interface to include properties which will be added to the report data
interface ExtendedReportData extends ReportData {
  properties?: {
    id: string;
    number: string;
    owner_name: string;
    aliquot: number;
  }[];
}

interface PropertyStatementPDFProps {
  data: ExtendedReportData;
}

export default function PropertyStatementPDF({ data }: PropertyStatementPDFProps) {
  const { organization, period, entries, accounts, properties } = data;

  // 1. Calculate Total Expenses (Class 5 or 'EXPENSE' type)
  // Identify expense accounts
  const expenseAccountCodes = new Set(
    accounts
      .filter(a => a.main_type === 'EXPENSE' || a.code.startsWith('5'))
      .map(a => a.code)
  );

  // Sum debit entries for expense accounts
  const totalExpense = entries.reduce((sum, entry) => {
    if (expenseAccountCodes.has(entry.account_code)) {
      return sum + (Number(entry.debit) || 0);
    }
    return sum;
  }, 0);

  // 2. Prepare Distribution List
  // If properties are not provided yet, we'll handle gracefully
  const propertyList = properties || [];
  const sortedProperties = [...propertyList].sort((a, b) => a.number.localeCompare(b.number));

  const totalAliquot = sortedProperties.reduce((sum, p) => sum + (Number(p.aliquot) || 0), 0);
  const totalDistributed = sortedProperties.reduce((sum, p) => sum + (totalExpense * (Number(p.aliquot) / 100)), 0);

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
            <Text style={styles.reportTitle}>CUADRO DE GASTOS</Text>
            <Text style={styles.reportPeriod}>
              Desde: {formatDate(period.start)} - Hasta: {formatDate(period.end)}
            </Text>
          </View>
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESUMEN DEL PERIODO</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 4 }}>
            <Text>Total Gastos Comunes:</Text>
            <Text style={styles.bold}>{formatCurrency(totalExpense)}</Text>
          </View>
        </View>

        {/* DISTRIBUTION TABLE */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text>UNIDAD</Text>
            </View>
            <View style={[styles.tableCell, { width: '50%' }]}>
              <Text>PROPIETARIO</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text style={styles.textRight}>ALICUOTA %</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast, { width: '20%' }]}>
              <Text style={styles.textRight}>MONTO A PAGAR</Text>
            </View>
          </View>

          {sortedProperties.length === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.tableCellLast, { width: '100%', padding: 20 }]}>
                <Text style={[styles.textCenter, { color: '#6B7280' }]}>
                  No hay propiedades registradas para distribuir gastos.
                </Text>
              </View>
            </View>
          ) : (
            sortedProperties.map((prop, idx) => {
              const amountToPay = totalExpense * (Number(prop.aliquot) / 100);
              return (
                <View key={prop.id || idx} style={styles.tableRow}>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.bold}>{prop.number}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '50%' }]}>
                    <Text>{prop.owner_name || 'Sin propietario'}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%' }]}>
                    <Text style={styles.textRight}>{Number(prop.aliquot).toFixed(4)}%</Text>
                  </View>
                  <View style={[styles.tableCell, styles.tableCellLast, { width: '20%' }]}>
                    <Text style={styles.textRight}>{formatCurrency(amountToPay)}</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* TOTALS */}
          {sortedProperties.length > 0 && (
            <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 0 }]}>
              <View style={[styles.tableCell, { width: '65%', borderRightWidth: 0 }]}>
                <Text style={[styles.textRight, styles.bold, { paddingRight: 10 }]}>TOTAL DISTRIBUIDO:</Text>
              </View>
              <View style={[styles.tableCell, { width: '15%', borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
                <Text style={[styles.textRight, styles.bold]}>{totalAliquot.toFixed(2)}%</Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast, { width: '20%' }]}>
                <Text style={[styles.textRight, styles.bold]}>{formatCurrency(totalDistributed)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Este reporte muestra la distribución de gastos comunes basada en la alícuota de cada unidad.</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
