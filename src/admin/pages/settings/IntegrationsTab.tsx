import React, { useState, useEffect } from 'react';
import { Button } from '../../components/untitledui/Button';
import { Input } from '../../components/untitledui/Input';
import { Badge } from '../../components/untitledui/Badge';
import { Modal } from '../../components/untitledui/Modal';
import { useNotifications } from '../../context/NotificationContext';
import { usePermissions } from '../../hooks/usePermissions';
import {
  CreditCard01,
  Check,
  Copy01,
  RefreshCw01,
  Eye,
  EyeOff,
  Link01,
  Zap,
  LayersThree01,
  MessageDotsSquare,
  Mail01,
  Activity,
  ShieldTick,
  Lock01,
  Globe01,
  Sliders01,
  Calendar,
} from '@untitledui/icons';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'ready' | 'planned';
  enabled: boolean;
  access_token_masked?: string;
}

export const IntegrationsTab: React.FC = () => {
  const { toast } = useNotifications();
  const { isOwner } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [savingPaystack, setSavingPaystack] = useState(false);
  const [savingRemita, setSavingRemita] = useState(false);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ gateway: string; ok: boolean; message: string } | null>(null);

  // Paystack Form State
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackMode, setPaystackMode] = useState<'test' | 'live'>('test');
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [paystackWebhookSecret, setPaystackWebhookSecret] = useState('');
  const [paystackCurrencies, setPaystackCurrencies] = useState<string[]>(['NGN', 'USD', 'GBP', 'EUR']);
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  const [showPaystackWebhookSecret, setShowPaystackWebhookSecret] = useState(false);
  const [paystackWebhookUrl, setPaystackWebhookUrl] = useState('');

  // Remita Form State
  const [remitaEnabled, setRemitaEnabled] = useState(false);
  const [remitaMode, setRemitaMode] = useState<'demo' | 'live'>('demo');
  const [remitaMerchantId, setRemitaMerchantId] = useState('');
  const [remitaServiceTypeId, setRemitaServiceTypeId] = useState('');
  const [remitaApiKey, setRemitaApiKey] = useState('');
  const [remitaPublicKey, setRemitaPublicKey] = useState('');
  const [showRemitaKey, setShowRemitaKey] = useState(false);
  const [remitaWebhookUrl, setRemitaWebhookUrl] = useState('');

  // Catalog State
  const [catalogItems, setCatalogItems] = useState<Record<string, CatalogItem>>({});
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogItem | null>(null);
  const [hubspotModalOpen, setHubspotModalOpen] = useState(false);
  const [hubspotAccessToken, setHubspotAccessToken] = useState('');
  const [hubspotSyncInquiries, setHubspotSyncInquiries] = useState(true);
  const [hubspotSyncApplications, setHubspotSyncApplications] = useState(true);

  // Fetch current integration settings
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/integrations');
      if (res.ok) {
        const data = await res.json();
        // Paystack
        setPaystackEnabled(Boolean(data.paystack?.enabled));
        setPaystackMode(data.paystack?.mode || 'test');
        setPaystackPublicKey(data.paystack?.public_key || '');
        setPaystackSecretKey(data.paystack?.secret_key_masked || '');
        setPaystackWebhookSecret(data.paystack?.webhook_secret_masked || '');
        setPaystackCurrencies(data.paystack?.currencies || ['NGN', 'USD', 'GBP', 'EUR']);
        setPaystackWebhookUrl(data.paystack?.webhook_url || `${window.location.origin}/api/webhooks/paystack`);

        // Remita
        setRemitaEnabled(Boolean(data.remita?.enabled));
        setRemitaMode(data.remita?.mode || 'demo');
        setRemitaMerchantId(data.remita?.merchant_id || '');
        setRemitaServiceTypeId(data.remita?.service_type_id || '');
        setRemitaApiKey(data.remita?.api_key_masked || '');
        setRemitaPublicKey(data.remita?.public_key || '');
        setRemitaWebhookUrl(data.remita?.webhook_url || `${window.location.origin}/api/webhooks/remita`);

        // Catalog
        if (data.catalog) {
          setCatalogItems(data.catalog);
        }
      }
    } catch (e) {
      console.error('Failed to load integration settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSavePaystack = async () => {
    if (!isOwner) {
      toast('Permission Denied', 'Only Owners can modify payment credentials.', 'error');
      return;
    }
    setSavingPaystack(true);
    setTestResult(null);
    try {
      const payload: Record<string, any> = {
        paystack_enabled: paystackEnabled,
        paystack_mode: paystackMode,
        paystack_public_key: paystackPublicKey,
        paystack_currencies: paystackCurrencies,
      };
      if (paystackSecretKey && !paystackSecretKey.includes('••••')) {
        payload.paystack_secret_key = paystackSecretKey;
      }
      if (paystackWebhookSecret && !paystackWebhookSecret.includes('••••')) {
        payload.paystack_webhook_secret = paystackWebhookSecret;
      }

      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Paystack Settings Saved', 'Credentials updated and hot-reloaded into active checkout engine.', 'success');
        fetchIntegrations();
      } else {
        const err = await res.json();
        toast('Save Failed', err.message || 'Could not update Paystack settings.', 'error');
      }
    } catch {
      toast('Network Error', 'Could not reach server to save settings.', 'error');
    } finally {
      setSavingPaystack(false);
    }
  };

  const handleSaveRemita = async () => {
    if (!isOwner) {
      toast('Permission Denied', 'Only Owners can modify payment credentials.', 'error');
      return;
    }
    setSavingRemita(true);
    setTestResult(null);
    try {
      const payload: Record<string, any> = {
        remita_enabled: remitaEnabled,
        remita_mode: remitaMode,
        remita_merchant_id: remitaMerchantId,
        remita_service_type_id: remitaServiceTypeId,
        remita_public_key: remitaPublicKey,
      };
      if (remitaApiKey && !remitaApiKey.includes('••••')) {
        payload.remita_api_key = remitaApiKey;
      }

      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast('Remita Settings Saved', 'Remita payment parameters updated.', 'success');
        fetchIntegrations();
      } else {
        const err = await res.json();
        toast('Save Failed', err.message || 'Could not update Remita settings.', 'error');
      }
    } catch {
      toast('Network Error', 'Could not reach server to save Remita settings.', 'error');
    } finally {
      setSavingRemita(false);
    }
  };

  const handleTestConnection = async (gateway: 'paystack' | 'remita') => {
    setTestingGateway(gateway);
    setTestResult(null);
    try {
      const payload: any = { gateway };
      if (gateway === 'paystack' && paystackSecretKey && !paystackSecretKey.includes('••••')) {
        payload.secret_key = paystackSecretKey;
      }
      if (gateway === 'remita') {
        payload.merchant_id = remitaMerchantId;
        if (remitaApiKey && !remitaApiKey.includes('••••')) {
          payload.api_key = remitaApiKey;
        }
      }

      const res = await fetch('/api/admin/integrations/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTestResult({ gateway, ok: Boolean(data.ok), message: data.message || 'Test complete.' });
      if (data.ok) {
        toast('Connection Verified', data.message, 'success');
      } else {
        toast('Connection Warning', data.message, 'warning');
      }
    } catch {
      setTestResult({ gateway, ok: false, message: 'Failed to communicate with test endpoint.' });
      toast('Test Error', 'Failed to test gateway connection.', 'error');
    } finally {
      setTestingGateway(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to Clipboard', `${label} copied successfully.`, 'info');
  };

  const toggleCurrency = (curr: string) => {
    setPaystackCurrencies((prev) =>
      prev.includes(curr) ? (prev.length > 1 ? prev.filter((c) => c !== curr) : prev) : [...prev, curr]
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#5D5E5F] animate-pulse">
        Loading integration credentials and connected gateways...
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left w-full">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[8px] bg-[#17645F]/10 text-[#17645F] mt-0.5">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#17191A]">
              Instant Zero-Downtime Integration Engine
            </h3>
            <p className="text-xs text-[#5D5E5F] mt-0.5">
              API credentials take effect immediately upon saving. When you plug in your Paystack keys, checkout activates automatically without requiring server restarts or code changes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Badge variant={paystackMode === 'live' ? 'brand' : 'gray'} size="sm">
            {paystackMode === 'live' ? 'Paystack: Live Production' : 'Paystack: Test Sandbox'}
          </Badge>
          <Badge variant={paystackEnabled ? 'brand' : 'gray'} size="sm">
            {paystackEnabled ? 'Gateway Active' : 'Gateway Inactive'}
          </Badge>
        </div>
      </div>

      {/* SECTION 1: PAYMENT GATEWAYS */}
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-[#17191A] flex items-center gap-2">
            <CreditCard01 className="w-5 h-5 text-[#17645F]" />
            Payment Gateways
          </h2>
          <p className="text-xs text-[#5D5E5F] mt-1">
            Configure automated consultation billing, multi-currency checkout, and webhook listeners.
          </p>
        </div>

        {/* PAYSTACK CARD */}
        <div className="rounded-[10px] border border-[#E1E0DD] bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E0DD]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#00C3F7]/10 flex items-center justify-center font-bold text-base text-[#008BB4]">
                P
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-[#17191A]">Paystack Payment Gateway</h3>
                  <Badge variant={paystackEnabled ? 'brand' : 'gray'} size="sm">
                    {paystackEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] text-[#5D5E5F] border border-[#E1E0DD]">
                    Inline Popup Modal
                  </span>
                </div>
                <p className="text-xs text-[#5D5E5F] mt-0.5">
                  Accept Naira (NGN), USD, GBP, and EUR cards, Apple Pay, USSD, and bank transfers with instant verification.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={paystackEnabled}
                onChange={(e) => setPaystackEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#17645F] rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#17191A]">Enable Paystack</span>
            </label>
          </div>

          {/* Test connection result banner */}
          {testResult?.gateway === 'paystack' && (
            <div
              className={`p-3 rounded-[8px] border text-xs flex items-center justify-between ${
                testResult.ok
                  ? 'bg-[#17645F]/10 border-[#17645F]/30 text-[#17645F]'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldTick className="w-4 h-4" />
                <span>{testResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Environment Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-[#17191A] mb-1">
                Operating Environment Mode
              </label>
              <div className="inline-flex rounded-[8px] border border-[#E1E0DD] p-1 bg-[#FAF9F6]">
                <button
                  type="button"
                  onClick={() => setPaystackMode('test')}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                    paystackMode === 'test'
                      ? 'bg-[#17645F] text-white'
                      : 'text-[#5D5E5F] hover:text-[#17191A]'
                  }`}
                >
                  Test Sandbox Mode (pk_test / sk_test)
                </button>
                <button
                  type="button"
                  onClick={() => setPaystackMode('live')}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                    paystackMode === 'live'
                      ? 'bg-[#17645F] text-white'
                      : 'text-[#5D5E5F] hover:text-[#17191A]'
                  }`}
                >
                  Live Production Mode (pk_live / sk_live)
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#17191A] mb-1">
                Active Multi-Currency Channels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['NGN', 'USD', 'GBP', 'EUR'].map((curr) => {
                  const active = paystackCurrencies.includes(curr);
                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => toggleCurrency(curr)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs font-mono font-medium border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#17645F]/10 border-[#17645F] text-[#17645F] font-semibold'
                          : 'bg-white border-[#E1E0DD] text-[#5D5E5F] hover:border-[#17645F]'
                      }`}
                    >
                      {active ? `✓ ${curr}` : `+ ${curr}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Credentials Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Paystack Public Key"
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
                placeholder={paystackMode === 'live' ? 'pk_live_...' : 'pk_test_...'}
              />
              <p className="text-[11px] text-[#5D5E5F] mt-1">
                Used in the browser for the Paystack Popup inline modal.
              </p>
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Paystack Secret Key"
                  type={showPaystackSecret ? 'text' : 'password'}
                  value={paystackSecretKey}
                  onChange={(e) => setPaystackSecretKey(e.target.value)}
                  placeholder={paystackMode === 'live' ? 'sk_live_...' : 'sk_test_...'}
                />
                <button
                  type="button"
                  onClick={() => setShowPaystackSecret(!showPaystackSecret)}
                  className="absolute right-3 top-8 text-[#5D5E5F] hover:text-[#17191A] cursor-pointer"
                  title={showPaystackSecret ? 'Hide secret key' : 'Show secret key'}
                >
                  {showPaystackSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-[#5D5E5F] mt-1">
                Never shared client-side. Used for HMAC webhook signatures &amp; charge verification.
              </p>
            </div>
          </div>

          {/* Webhook Configuration helper */}
          <div className="p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17191A] flex items-center gap-1.5">
                <Link01 className="w-3.5 h-3.5 text-[#17645F]" />
                Webhook Notification URL (Paste into your Paystack Dashboard)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(paystackWebhookUrl || `${window.location.origin}/api/webhooks/paystack`, 'Paystack Webhook URL')}
                className="text-xs text-[#17645F] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy01 className="w-3.5 h-3.5" />
                Copy URL
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={paystackWebhookUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/paystack` : '')}
                className="w-full h-11 px-3.5 py-2.5 text-xs font-mono text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] select-all cursor-text focus:outline-none focus:ring-1 focus:ring-[#17645F] shadow-xs"
              />
            </div>
            <p className="text-[11px] text-[#5D5E5F]">
              In your Paystack Dashboard under Settings &gt; Preferences, paste this Webhook URL so Zizo instantly records payments even if the client closes the browser.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => handleTestConnection('paystack')}
              disabled={Boolean(testingGateway)}
              iconLeading={<RefreshCw01 className={`w-4 h-4 ${testingGateway === 'paystack' ? 'animate-spin' : ''}`} />}
            >
              {testingGateway === 'paystack' ? 'Testing Connection...' : 'Test API Connection'}
            </Button>

            <Button
              variant="primary"
              type="button"
              onClick={handleSavePaystack}
              disabled={savingPaystack}
            >
              {savingPaystack ? 'Saving Credentials...' : 'Save Paystack Settings'}
            </Button>
          </div>
        </div>

        {/* REMITA CARD */}
        <div className="rounded-[10px] border border-[#E1E0DD] bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E1E0DD]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#E35205]/10 flex items-center justify-center font-bold text-base text-[#E35205]">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-[#17191A]">Remita Payment Gateway</h3>
                  <Badge variant={remitaEnabled ? 'brand' : 'gray'} size="sm">
                    {remitaEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-xs text-[#5D5E5F] mt-0.5">
                  Accept Remita Retrieval Reference (RRR), e-Naira, and commercial bank branch deposits in Nigeria.
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 cursor-pointer self-start sm:self-center">
              <input
                type="checkbox"
                checked={remitaEnabled}
                onChange={(e) => setRemitaEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#17645F] rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#17191A]">Enable Remita</span>
            </label>
          </div>

          {/* Test connection result banner */}
          {testResult?.gateway === 'remita' && (
            <div
              className={`p-3 rounded-[8px] border text-xs flex items-center justify-between ${
                testResult.ok
                  ? 'bg-[#17645F]/10 border-[#17645F]/30 text-[#17645F]'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldTick className="w-4 h-4" />
                <span>{testResult.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setTestResult(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Merchant ID"
              value={remitaMerchantId}
              onChange={(e) => setRemitaMerchantId(e.target.value)}
              placeholder="e.g. 2547912873"
            />
            <Input
              label="Service Type ID (RRR Type)"
              value={remitaServiceTypeId}
              onChange={(e) => setRemitaServiceTypeId(e.target.value)}
              placeholder="e.g. 4430731"
            />
            <div className="relative">
              <Input
                label="Remita API Key"
                type={showRemitaKey ? 'text' : 'password'}
                value={remitaApiKey}
                onChange={(e) => setRemitaApiKey(e.target.value)}
                placeholder="Secret API Key"
              />
              <button
                type="button"
                onClick={() => setShowRemitaKey(!showRemitaKey)}
                className="absolute right-3 top-8 text-[#5D5E5F] hover:text-[#17191A] cursor-pointer"
              >
                {showRemitaKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remita Webhook Notification helper */}
          <div className="p-4 rounded-[10px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#17191A] flex items-center gap-1.5">
                <Link01 className="w-3.5 h-3.5 text-[#17645F]" />
                Webhook Notification URL (Paste into your Remita Dashboard)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(remitaWebhookUrl || `${window.location.origin}/api/webhooks/remita`, 'Remita Webhook URL')}
                className="text-xs text-[#17645F] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Copy01 className="w-3.5 h-3.5" />
                Copy URL
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={remitaWebhookUrl || (typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/remita` : '')}
                className="w-full h-11 px-3.5 py-2.5 text-xs font-mono text-[#17191A] bg-white border border-[#E1E0DD] rounded-[8px] select-all cursor-text focus:outline-none focus:ring-1 focus:ring-[#17645F] shadow-xs"
              />
            </div>
            <p className="text-[11px] text-[#5D5E5F]">
              In your Remita merchant profile under Webhooks, paste this URL so payments settled offline or via bank transfer are automatically credited to bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => handleTestConnection('remita')}
              disabled={Boolean(testingGateway)}
              iconLeading={<RefreshCw01 className={`w-4 h-4 ${testingGateway === 'remita' ? 'animate-spin' : ''}`} />}
            >
              {testingGateway === 'remita' ? 'Testing Connection...' : 'Test Connection'}
            </Button>

            <Button
              variant="primary"
              type="button"
              onClick={handleSaveRemita}
              disabled={savingRemita}
            >
              {savingRemita ? 'Saving Remita...' : 'Save Remita Settings'}
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION 2: EXTENSIBLE CATALOG OF OTHER INTEGRATIONS */}
      <div className="space-y-6 pt-6 border-t border-[#E1E0DD]">
        <div>
          <h2 className="text-base font-semibold text-[#17191A] flex items-center gap-2">
            <Sliders01 className="w-5 h-5 text-[#17645F]" />
            External Services &amp; CRM Integrations Catalog
          </h2>
          <p className="text-xs text-[#5D5E5F] mt-1">
            Connect enterprise tools for patient pipelines, automated calendar invites, and clinical laboratory sync. Click any service to view readiness or request activation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. HUBSPOT CRM */}
          <div className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white space-y-4 hover:border-[#17645F] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-[8px] bg-[#FF7A59]/10 flex items-center justify-center font-bold text-base text-[#FF7A59]">
                  H
                </div>
                <Badge variant={catalogItems.hubspot?.enabled ? 'brand' : 'gray'} size="sm">
                  {catalogItems.hubspot?.enabled ? 'Connected' : 'Ready for API Key'}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#17191A]">HubSpot CRM</h3>
              <p className="text-xs text-[#5D5E5F] leading-relaxed">
                Sync website inquiries, surrogate applicants, and consultation bookings directly into HubSpot contacts and custom deal pipelines.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E1E0DD] flex items-center justify-between">
              <span className="text-[11px] text-[#8BB2AF] font-medium">CRM &amp; Pipelines</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setHubspotModalOpen(true)}
              >
                Configure
              </Button>
            </div>
          </div>

          {/* 2. GOOGLE WORKSPACE (MEET & CALENDAR) */}
          <div className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white space-y-4 hover:border-[#17645F] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-[8px] bg-[#4285F4]/10 flex items-center justify-center font-bold text-base text-[#4285F4]">
                  G
                </div>
                <Badge variant={catalogItems.google_meet?.enabled ? 'brand' : 'gray'} size="sm">
                  {catalogItems.google_meet?.enabled ? 'Connected' : 'Ready for OAuth'}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#17191A]">Google Workspace &amp; Meet</h3>
              <p className="text-xs text-[#5D5E5F] leading-relaxed">
                Automatically push consultations to staff Google Calendars and generate dynamic, secure Google Meet room URLs for video calls.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E1E0DD] flex items-center justify-between">
              <span className="text-[11px] text-[#8BB2AF] font-medium">Calendar &amp; Video</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSelectedCatalogItem({
                    id: 'google_meet',
                    name: 'Google Workspace (Calendar & Meet)',
                    category: 'Calendar & Video',
                    description: 'Sync consultations to staff Google Calendars and generate dynamic Google Meet links.',
                    status: 'ready',
                    enabled: false,
                  })
                }
              >
                View Setup
              </Button>
            </div>
          </div>

          {/* 3. WHATSAPP BUSINESS CLOUD API */}
          <div className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white space-y-4 hover:border-[#17645F] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-[8px] bg-[#25D366]/10 flex items-center justify-center font-bold text-base text-[#25D366]">
                  W
                </div>
                <Badge variant="gray" size="sm">
                  Planned
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#17191A]">WhatsApp Business API</h3>
              <p className="text-xs text-[#5D5E5F] leading-relaxed">
                Automated 24h WhatsApp appointment reminders, surrogate pregnancy check-in broadcasts, and instant intake notifications.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E1E0DD] flex items-center justify-between">
              <span className="text-[11px] text-[#8BB2AF] font-medium">Messaging</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSelectedCatalogItem({
                    id: 'whatsapp',
                    name: 'WhatsApp Business Cloud API',
                    category: 'Messaging',
                    description: 'Automated 24h appointment reminders, intake notices, and surrogate communication broadcasts.',
                    status: 'planned',
                    enabled: false,
                  })
                }
              >
                Details
              </Button>
            </div>
          </div>

          {/* 4. TRANSACTIONAL EMAIL (RESEND / BREVO) */}
          <div className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white space-y-4 hover:border-[#17645F] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-[8px] bg-[#17645F]/10 flex items-center justify-center font-bold text-base text-[#17645F]">
                  <Mail01 className="w-4 h-4 text-[#17645F]" />
                </div>
                <Badge variant="gray" size="sm">
                  Planned
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#17191A]">Transactional Email (Resend / Brevo)</h3>
              <p className="text-xs text-[#5D5E5F] leading-relaxed">
                Enterprise deliverability for payment receipts, clinical intake agreements, and appointment reschedule notices with DKIM/SPF.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E1E0DD] flex items-center justify-between">
              <span className="text-[11px] text-[#8BB2AF] font-medium">Email Dispatch</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSelectedCatalogItem({
                    id: 'resend',
                    name: 'Transactional Email (Resend / Brevo)',
                    category: 'Email Dispatch',
                    description: 'Enterprise deliverability for payment receipts, intake agreements, and coordinator notifications.',
                    status: 'planned',
                    enabled: false,
                  })
                }
              >
                Details
              </Button>
            </div>
          </div>

          {/* 5. CLINICAL EMR (BRIDGE CLINIC GATEWAY) */}
          <div className="p-5 rounded-[10px] border border-[#E1E0DD] bg-white space-y-4 hover:border-[#17645F] transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-[8px] bg-indigo-50 flex items-center justify-center font-bold text-base text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
                <Badge variant="gray" size="sm">
                  Planned
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-[#17191A]">Bridge Clinic EMR Gateway</h3>
              <p className="text-xs text-[#5D5E5F] leading-relaxed">
                Direct clinical interface for receiving ultrasound reports, infectious screening clearance, and embryology lab vitrification notes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#E1E0DD] flex items-center justify-between">
              <span className="text-[11px] text-[#8BB2AF] font-medium">Clinical &amp; Lab</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setSelectedCatalogItem({
                    id: 'clinic_emr',
                    name: 'Bridge Clinic EMR Gateway',
                    category: 'Clinical & Lab',
                    description: 'Electronic clinical interface for receiving ultrasound scans, infectious panels, and embryology updates.',
                    status: 'planned',
                    enabled: false,
                  })
                }
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* HubSpot Configuration Modal */}
      <Modal
        isOpen={hubspotModalOpen}
        onClose={() => setHubspotModalOpen(false)}
        title="HubSpot CRM Integration"
        description="Plug in your HubSpot Private App Access Token to auto-sync client inquiries and candidates."
        footer={
          <>
            <Button variant="secondary" onClick={() => setHubspotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (hubspotAccessToken) {
                  await fetch('/api/admin/integrations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      hubspot_enabled: true,
                      hubspot_access_token: hubspotAccessToken,
                    }),
                  });
                  toast('HubSpot Connected', 'HubSpot access token saved and sync enabled.', 'success');
                  fetchIntegrations();
                }
                setHubspotModalOpen(false);
              }}
            >
              Save HubSpot Connection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="HubSpot Private App Access Token"
            type="password"
            value={hubspotAccessToken}
            onChange={(e) => setHubspotAccessToken(e.target.value)}
            placeholder="pat-na1-..."
          />
          <p className="text-[11px] text-[#5D5E5F]">
            Created in HubSpot Settings &gt; Integrations &gt; Private Apps with scopes `crm.objects.contacts.write` and `crm.objects.deals.write`.
          </p>
          <div className="space-y-2 pt-2 border-t border-[#E1E0DD]">
            <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer">
              <input
                type="checkbox"
                checked={hubspotSyncInquiries}
                onChange={(e) => setHubspotSyncInquiries(e.target.checked)}
                className="w-4 h-4 accent-[#17645F]"
              />
              <span>Auto-sync new client inquiries into HubSpot Contacts</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#17191A] cursor-pointer">
              <input
                type="checkbox"
                checked={hubspotSyncApplications}
                onChange={(e) => setHubspotSyncApplications(e.target.checked)}
                className="w-4 h-4 accent-[#17645F]"
              />
              <span>Auto-sync surrogate and donor applications into Candidate Pipeline</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Catalog Details Modal */}
      {selectedCatalogItem && (
        <Modal
          isOpen={Boolean(selectedCatalogItem)}
          onClose={() => setSelectedCatalogItem(null)}
          title={selectedCatalogItem.name}
          description={`Category: ${selectedCatalogItem.category}`}
          footer={
            <Button variant="secondary" onClick={() => setSelectedCatalogItem(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs leading-relaxed text-[#2E3031]">
            <p>{selectedCatalogItem.description}</p>
            <div className="p-3.5 rounded-[8px] bg-[#FAF9F6] border border-[#E1E0DD] space-y-1.5">
              <h4 className="font-semibold text-[#17191A]">Readiness Status:</h4>
              <p>
                This integration is registered in the Zizo architecture. Whenever you have the credentials or want us to activate this service, let us know and we will plug it into the workflow!
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
