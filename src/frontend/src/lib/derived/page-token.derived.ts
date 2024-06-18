import { ETHEREUM_TOKEN, ICP_TOKEN, SEPOLIA_TOKEN } from '$env/tokens.env';
import { erc20Tokens } from '$eth/derived/erc20.derived';
import { icrcTokens } from '$icp/derived/icrc.derived';
import { routeToken } from '$lib/derived/nav.derived';
import type { OptionToken } from '$lib/types/token';
import { isNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

/**
 * A token derived from the route URL - i.e. if the URL contains a query parameters "token", then this store tries to derive the object from it.
 */
export const pageToken: Readable<OptionToken> = derived(
	[routeToken, erc20Tokens, icrcTokens],
	([$routeToken, $erc20Tokens, $icrcTokens]) => {
		if (isNullish($routeToken)) {
			return undefined;
		}

		if ($routeToken === ICP_TOKEN.name) {
			return ICP_TOKEN;
		}

		return [...$erc20Tokens, ...$icrcTokens, ETHEREUM_TOKEN, SEPOLIA_TOKEN].find(
			({ name }) => name === $routeToken
		);
	}
);