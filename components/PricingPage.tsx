import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { PLANS, PlanId } from '../constants';

type Props = {
  onBack: () => void;
  onAuthRequired: () => void;
};

type JazzCashInitiateResponse = {
  actionUrl: string;
  fields: Record<string, string>;
};

const PricingPage: React.FC<Props> = ({ onBack, onAuthRequired }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('premium');
  const [isPaying, setIsPaying] = useState(false);
  const [redirectPayload, setRedirectPayload] = useState<JazzCashInitiateResponse | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selected = useMemo(() => PLANS.find(p => p.id === selectedPlan) ?? PLANS[0], [selectedPlan]);

  useEffect(() => {
    if (!redirectPayload) return;
    if (!formRef.current) return;
    formRef.current.submit();
  }, [redirectPayload]);

  const startJazzCashPayment = async () => {
    setIsPaying(true);
    try {
      const { data } = await supabase.auth.getSession();
      const session = data.session ?? null;
      if (!session?.access_token) {
        onAuthRequired();
        return;
      }

      const res = await fetch('/api/payments/jazzcash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId: selectedPlan }),
      });

      const json = (await res.json()) as Partial<JazzCashInitiateResponse> & { error?: string };
      if (!res.ok || !json.actionUrl || !json.fields) {
        throw new Error(json.error || 'Payment initialization failed');
      }

      setRedirectPayload({ actionUrl: json.actionUrl, fields: json.fields });
    } catch (e: any) {
      toast.error(e?.message || 'Could not start the payment');
    } finally {
      setIsPaying(false);
    }
  };

  if (redirectPayload) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 w-full max-w-md text-center">
          <div className="text-lg font-extrabold text-gray-900">Redirecting to JazzCash…</div>
          <div className="text-sm text-gray-500 mt-2">Please wait, the payment portal is opening.</div>
          <form ref={formRef} method="POST" action={redirectPayload.actionUrl}>
            {Object.entries(redirectPayload.fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold font-serif text-gray-900">Pricing</div>
            <div className="text-sm text-gray-500 mt-1">Upgrade via JazzCash hosted checkout.</div>
          </div>
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {PLANS.map(plan => {
            const active = plan.id === selectedPlan;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`text-left rounded-3xl p-6 border transition shadow-sm ${
                  active ? 'border-pakGreen-500 bg-pakGreen-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600 mt-1">PKR {plan.pricePkr}</div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      active ? 'border-pakGreen-600 bg-pakGreen-600' : 'border-gray-300'
                    }`}
                  >
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Includes</div>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700">
                    {plan.features.map(f => (
                      <li key={f} className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-pakGreen-500 mt-2" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.restrictions?.length ? (
                    <div className="mt-4">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Restrictions</div>
                      <ul className="mt-2 space-y-2 text-sm text-gray-600">
                        {plan.restrictions.map(r => (
                          <li key={r} className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500">Selected</div>
            <div className="text-xl font-extrabold text-gray-900">
              {selected.name} <span className="text-gray-400 font-bold">•</span> PKR {selected.pricePkr}
            </div>
          </div>
          <button
            onClick={startJazzCashPayment}
            disabled={isPaying}
            className="px-6 py-3 rounded-2xl bg-pakGreen-600 hover:bg-pakGreen-700 disabled:opacity-50 text-white font-extrabold transition"
          >
            {isPaying ? 'Starting…' : 'Pay with JazzCash'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
