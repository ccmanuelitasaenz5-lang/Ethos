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
  // If format is YYYY-MM-DD
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

interface JournalPDFProps {
  data: ReportData;
}

export default function JournalPDF({ data }: JournalPDFProps) {
  const { organization, period, entries } = data;

  // Calculate totals
  const totalDebit = entries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
  const totalCredit = entries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);

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
            <Text style={styles.reportTitle}>LIBRO DIARIO</Text>
            <Text style={styles.reportPeriod}>
              Desde: {formatDate(period.start)} - Hasta: {formatDate(period.end)}
            </Text>
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { width: '12%' }]}>
              <Text>FECHA</Text>
            </View>
            <View style={[styles.tableCell, { width: '8%' }]}>
              <Text style={styles.textCenter}>ASI.</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text>CÓDIGO</Text>
            </View>
            <View style={[styles.tableCell, { width: '35%' }]}>
              <Text>DESCRIPCIÓN / CUENTA</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text style={styles.textRight}>DEBE</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
              <Text style={styles.textRight}>HABER</Text>
            </View>
          </View>

          {/* Table Rows */}
          {entries.map((entry, index) => (
            <View key={entry.id || index} style={styles.tableRow}>
              <View style={[styles.tableCell, { width: '12%' }]}>
                <Text>{formatDate(entry.date)}</Text>
              </View>
              <View style={[styles.tableCell, { width: '8%' }]}>
                <Text style={styles.textCenter}>{entry.entry_number}</Text>
              </View>
              <View style={[styles.tableCell, { width: '15%' }]}>
                <Text>{entry.account_code}</Text>
              </View>
              <View style={[styles.tableCell, { width: '35%' }]}>
                <Text style={styles.bold}>{entry.account_name}</Text>
                <Text style={{ fontSize: 7, color: '#6B7280', marginTop: 2 }}>{entry.description}</Text>
              </View>
              <View style={[styles.tableCell, { width: '15%' }]}>
                <Text style={styles.textRight}>
                  {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : '-'}
                </Text>
              </View>
              <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
                <Text style={styles.textRight}>
                  {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : '-'}
                </Text>
              </View>
            </View>
          ))}

          {/* TOTALS ROW */}
          <View style={[styles.tableRow, { backgroundColor: '#F3F4F6', borderBottomWidth: 0 }]}>
            <View style={[styles.tableCell, { width: '70%', borderRightWidth: 0 }]}>
              <Text style={[styles.textRight, styles.bold, { paddingRight: 10 }]}>TOTALES DEL PERIODO:</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%', borderLeftWidth: 1, borderColor: '#E5E7EB' }]}>
              <Text style={[styles.textRight, styles.bold]}>{formatCurrency(totalDebit)}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast, { width: '15%' }]}>
              <Text style={[styles.textRight, styles.bold]}>{formatCurrency(totalCredit)}</Text>
            </View>
          </View>
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
