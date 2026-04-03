import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#111827', // Gray 900
    flexDirection: 'column',
  },
  // Header Section
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10,
  },
  orgInfo: {
    flexDirection: 'column',
    maxWidth: '60%',
  },
  orgName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  orgDetail: {
    fontSize: 9,
    color: '#4B5563', // Gray 600
    marginBottom: 2,
  },
  reportInfo: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1F2937', // Gray 800
    marginBottom: 4,
  },
  reportPeriod: {
    fontSize: 10,
    color: '#4B5563',
  },

  // Table Layout
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 20,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableCell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },

  // Typography Helpers
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  textRight: {
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 8,
  },
  currency: {
    fontFamily: 'Helvetica',
  },

  // Utilities
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 2,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
