import { ref, onMounted } from 'vue';

/**
 * Fetches /api/order/{token} once on mount. No polling — order status changes
 * (paid / underpaid / expired) are detected and surfaced by the original
 * checkout page in the user's other tab, not here.
 *
 * Returns:
 *   loading: boolean
 *   data:    { amount_owed, wallet_address, order_status } | null
 *   error:   'not_found' | 'network' | null
 */
export function useOrderStatus(token, env) {
  const loading = ref(true);
  const data = ref(null);
  const error = ref(null);

  onMounted(async () => {
    try {
      // POST so the token stays in the request body — never in URL path,
      // never in CF Pages access logs, never cached by an HTTP intermediary.
      const r = await fetch('/api/order', {
        method: 'POST',
        cache: 'no-store',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(env === 'sandbox' ? { token, env } : { token }),
      });
      if (r.status === 404) {
        error.value = 'not_found';
        return;
      }
      if (!r.ok) {
        error.value = 'network';
        return;
      }
      data.value = await r.json();
    } catch (_) {
      error.value = 'network';
    } finally {
      loading.value = false;
    }
  });

  return { loading, data, error };
}
