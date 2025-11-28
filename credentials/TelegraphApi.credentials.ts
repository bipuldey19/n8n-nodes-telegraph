import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelegraphApi implements ICredentialType {
	name = 'telegraphApi';
	displayName = 'Telegraph API';
	documentationUrl = 'https://telegra.ph/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
		},
	];
}
