import { ckEthHelperContractAddress } from '$eth/api/cketh-minter.api';
import {
	ckEthHelperContractAddressStore,
	type CkEthHelperContractAddressData
} from '$eth/stores/cketh.store';
import { CKETH_MINTER_CANISTER_ID } from '$icp/constants/icrc.constants';
import { queryAndUpdate } from '$lib/actors/query.ic';
import { toastsError } from '$lib/stores/toasts.store';
import type { ETH_ADDRESS } from '$lib/types/address';
import type { TokenStandard } from '$lib/types/token';
import { AnonymousIdentity } from '@dfinity/agent';
import { isNullish } from '@dfinity/utils';
import { get } from 'svelte/store';

export const loadCkEthHelperContractAddress = async () => {
	const addressInStore = get(ckEthHelperContractAddressStore);

	// We try to load only once per session the help contract address
	if (addressInStore !== undefined) {
		return;
	}

	await queryAndUpdate<ETH_ADDRESS>({
		request: ({ identity: _, certified }) =>
			ckEthHelperContractAddress({
				minterCanisterId: CKETH_MINTER_CANISTER_ID,
				identity: new AnonymousIdentity(),
				certified
			}),
		onLoad: ({ response: data, certified }) =>
			ckEthHelperContractAddressStore.set({ data, certified }),
		onCertifiedError: ({ error }) => {
			// We silence the error here because we display a visual error when we try to effectively use the information
			console.error(error);

			ckEthHelperContractAddressStore.reset();
		},
		identity: new AnonymousIdentity()
	});
};

export const assertCkEthHelperContractAddressLoaded = ({
	helperContractAddress,
	tokenStandard
}: {
	helperContractAddress: CkEthHelperContractAddressData;
	tokenStandard: TokenStandard;
}): { valid: boolean } => {
	if (tokenStandard === 'ethereum' && isNullish(helperContractAddress)) {
		toastsError({
			msg: {
				text: `Try again in few seconds, a ckETH configuration parameter is not yet loaded.`
			}
		});
		return { valid: false };
	}

	if (tokenStandard === 'ethereum' && helperContractAddress?.certified !== true) {
		toastsError({
			msg: {
				text: `Try again in few seconds, a ckETH configuration parameter has not yet certified.`
			}
		});
		return { valid: false };
	}

	return { valid: true };
};