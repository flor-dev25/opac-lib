import React, { useState, useEffect } from 'react';
import { BeveledBox } from '../common/BeveledBox';
import { GroupBox } from '../common/GroupBox';
import { TitleBar } from '../layout/TitleBar';
import { invoke } from '@tauri-apps/api/core';
import { Wallet, TrendingUp, History, Download, Printer } from 'lucide-react';

interface PaymentRecord {
  amount_pay: number;
  idno: string;
  dte_pay: string;
  cashier: string;
  patron_name: string | null;
}

interface FinancialSummary {
  total_collected: number;
  total_outstanding: number;
  recent_payments: PaymentRecord[];
}

interface FinancialReportsDialogProps {
  onClose: () => void;
}

export const FinancialReportsDialog: React.FC<FinancialReportsDialogProps> = ({ onClose }) => {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const result = await invoke<FinancialSummary>('get_financial_reports');
      setData(result);
    } catch (err) {
      console.error('Failed to load financial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
      <BeveledBox variant="raised" className="w-full max-w-4xl h-[80vh] flex flex-col bg-[#D4D0C8]">
        <TitleBar title="Financial Reports & Fine Collection" onClose={onClose} />
        
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center italic text-gray-600">
              Generating reports...
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GroupBox title="Collection Summary">
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3 bg-green-100 border border-green-600 text-green-700">
                      <Wallet size={32} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-gray-600">Total Fines Collected</div>
                      <div className="text-3xl font-bold text-green-800 font-mono">
                        ₱{data?.total_collected.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </GroupBox>

                <GroupBox title="Liability Summary">
                  <div className="flex items-center gap-4 p-2">
                    <div className="p-3 bg-red-100 border border-red-600 text-red-700">
                      <TrendingUp size={32} />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase text-gray-600">Total Outstanding Fines</div>
                      <div className="text-3xl font-bold text-red-800 font-mono">
                        ₱{data?.total_outstanding.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </GroupBox>
              </div>

              {/* Recent History */}
              <GroupBox title="Recent Payment History" className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden bg-white border-2 border-inset border-gray-400">
                  <div className="bg-[#808080] text-white flex font-bold text-xs p-1 sticky top-0 z-10">
                    <div className="w-32 px-1">Date/Time</div>
                    <div className="w-24 px-1">ID No.</div>
                    <div className="flex-1 px-1">Patron Name</div>
                    <div className="w-24 px-1 text-right">Amount</div>
                    <div className="w-24 px-1 text-right">Cashier</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-scroll">
                    {data?.recent_payments.map((payment, idx) => (
                      <div key={idx} className="flex text-xs p-1 border-b border-gray-100 hover:bg-blue-50">
                        <div className="w-32 px-1 text-gray-600">
                          {new Date(payment.dte_pay).toLocaleString()}
                        </div>
                        <div className="w-24 px-1 font-mono">{payment.idno}</div>
                        <div className="flex-1 px-1 font-bold">{payment.patron_name || 'Unknown'}</div>
                        <div className="w-24 px-1 text-right font-bold text-green-700">
                          ₱{payment.amount_pay.toLocaleString()}
                        </div>
                        <div className="w-24 px-1 text-right text-gray-500 uppercase">{payment.cashier}</div>
                      </div>
                    ))}
                    {data?.recent_payments.length === 0 && (
                      <div className="p-8 text-center text-gray-400 italic">No payment records found.</div>
                    )}
                  </div>
                </div>
              </GroupBox>

              {/* Actions */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="btn-classic px-4 h-8 flex items-center gap-2">
                    <Printer size={14} /> Print Report
                  </button>
                  <button className="btn-classic px-4 h-8 flex items-center gap-2">
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                <button onClick={onClose} className="btn-classic px-8 h-10 font-bold">
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </BeveledBox>
    </div>
  );
};
