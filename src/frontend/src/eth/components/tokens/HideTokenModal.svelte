<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import { isNullishOrEmpty } from '$lib/utils/input.utils';
	import { toastsError } from '$lib/stores/toasts.store';
	import { setUserToken } from '$lib/api/backend.api';
	import HideTokenModal from '$lib/components/tokens/HideTokenModal.svelte';
	import type { Identity } from '@dfinity/agent';
	import { onMount } from 'svelte';
	import { assertNonNullish, toNullable } from '@dfinity/utils';
	import { token } from '$lib/stores/token.store';
	import type { OptionErc20UserToken } from '$eth/types/erc20-user-token';
	import type { EthereumNetwork } from '$eth/types/network';
	import { loadUserTokens } from '$eth/services/erc20.services';

	let selectedToken: OptionErc20UserToken;

	// We must clone the reference to avoid the UI to rerender once we remove the token from the store.
	onMount(() => (selectedToken = $token as OptionErc20UserToken));

	const assertHide = (): { valid: boolean } => {
		const contractAddress = selectedToken?.address;

		if (isNullishOrEmpty(contractAddress)) {
			toastsError({
				msg: { text: $i18n.tokens.error.invalid_contract_address }
			});
			return { valid: false };
		}

		return { valid: true };
	};

	const hideToken = async (params: { identity: Identity }) => {
		assertNonNullish(selectedToken);

		const { version, symbol, network, address, decimals } = selectedToken;
		const { chainId } = network as EthereumNetwork;

		await setUserToken({
			...params,
			token: {
				chain_id: chainId,
				decimals: toNullable(decimals),
				contract_address: address,
				symbol: toNullable(symbol),
				version: toNullable(version),
				enabled: toNullable(false)
			}
		});
	};

	const updateUi = (params: { identity: Identity }): Promise<void> => loadUserTokens(params);
</script>

<HideTokenModal {assertHide} {hideToken} {updateUi} />
