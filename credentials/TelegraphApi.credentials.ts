import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelegraphApi implements ICredentialType {
	name = 'telegraphApi';
	displayName = 'Telegraph API';
	documentationUrl = 'https://telegra.ph/api';
	icon = 'file:../nodes/Telegraph/telegraph.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
	test = {
		request: {
			baseURL: 'https://api.telegra.ph',
			url: '/getAccountInfo',
			qs: {
				fields: '["short_name"]',
			},
		},
	};
}
