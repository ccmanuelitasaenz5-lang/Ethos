export interface ReportData {
    organization: any;
    period: { start: string; end: string };
    entries: any[];
    accounts: any[];
    properties?: any[];
    initialBalances: Record<string, number>;
}
