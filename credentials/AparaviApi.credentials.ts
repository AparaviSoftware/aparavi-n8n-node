import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AparaviApi implements ICredentialType {
	name = 'aparaviApi';
	displayName = 'Aparavi API';
	documentationUrl = 'https://docs.aparavi.com';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Aparavi DTC API key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://eaas.aparavi.com',
			url: '/pipe/validate',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				pipeline: {
					components: [
						{
							id: 'test_webhook',
							provider: 'webhook',
							config: {
								hideForm: true,
								mode: 'Source',
								type: 'webhook',
							},
						},
					],
					source: 'test_webhook',
				},
			},
		},
	};
}
