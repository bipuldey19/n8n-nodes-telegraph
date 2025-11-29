import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	IDataObject,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { markdownToTelegraph, htmlToTelegraph } from './markdownToTelegraph';

export class Telegraph implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegraph',
		name: 'telegraph',
		icon: 'file:Telegraph.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume Telegraph API',
		defaults: {
			name: 'Telegraph',
		},
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'telegraphApi',
				required: true,
				displayOptions: {
					hide: {
						resource: ['account'],
						operation: ['create'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Page',
						value: 'page',
					},
				],
				default: 'page',
			},
			{

				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new Telegraph account',
						action: 'Create an account',
					},
					{
						name: 'Edit',
						value: 'edit',
						description: 'Update information about a Telegraph account',
						action: 'Edit an account',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get information about a Telegraph account',
						action: 'Get an account',
					},
					{
						name: 'Revoke Access Token',
						value: 'revokeAccessToken',
						description: 'Revoke access_token and generate a new one',
						action: 'Revoke access token',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['page'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new Telegraph page',
						action: 'Create a page',
					},
					{
						name: 'Edit',
						value: 'edit',
						description: 'Edit an existing Telegraph page',
						action: 'Edit a page',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a Telegraph page',
						action: 'Get a page',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get a list of pages belonging to a Telegraph account',
						action: 'Get many pages',
					},
					{
						name: 'Get Views',
						value: 'getViews',
						description: 'Get the number of views for a Telegraph article',
						action: 'Get views',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Short Name',
				name: 'short_name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['create'],
					},
				},
				description: 'Account name, helps users with several accounts remember which they are currently using',
			},
			{
				displayName: 'Short Name',
				name: 'short_name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['edit'],
					},
				},
				description: 'New account name',
			},
			{
				displayName: 'Author Name',
				name: 'author_name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Default author name used when creating new articles',
			},
			{
				displayName: 'Author URL',
				name: 'author_url',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Default profile link',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'multiOptions',
				options: [
					{
						name: 'Auth URL',
						value: 'auth_url',
					},
					{
						name: 'Author Name',
						value: 'author_name',
					},
					{
						name: 'Author URL',
						value: 'author_url',
					},
					{
						name: 'Page Count',
						value: 'page_count',
					},
					{
						name: 'Short Name',
						value: 'short_name',
					},
				],
				default: ['short_name', 'author_name', 'author_url'],
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['get'],
					},
				},
				description: 'List of account fields to return',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Page title',
			},
			{
				displayName: 'Content Format',
				name: 'contentFormat',
				type: 'options',
				options: [
					{
						name: 'Markdown',
						value: 'markdown',
						description: 'Write content in Markdown format',
					},
					{
						name: 'HTML',
						value: 'html',
						description: 'Write content in HTML format',
					},
					{
						name: 'JSON (Telegraph Format)',
						value: 'json',
						description: 'Write content in Telegraph Node JSON format',
					},
				],
				default: 'markdown',
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Format of the content input',
			},
			{
				displayName: 'Content',
				name: 'contentMarkdown',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
						contentFormat: ['markdown'],
					},
				},
				description: 'Content in Markdown format. Supports: headings (#), bold (**), italic (*), links [text](URL), images ![alt](URL), lists, code blocks, blockquotes (>), and more.',
				placeholder: '### My Article\n\nThis is a **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n> A blockquote\n\n[Link](https://example.com)',
			},
			{
				displayName: 'Content',
				name: 'contentHtml',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
						contentFormat: ['html'],
					},
				},
				description: 'Content in HTML format',
				placeholder: '<h3>My Article</h3>\n<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'json',
				default: '[]',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
						contentFormat: ['json'],
					},
				},
				description: 'Content in Telegraph Node JSON format (Array of Node objects)',
			},
			{
				displayName: 'Author Name',
				name: 'author_name',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Author name, displayed below the article\'s title',
			},
			{
				displayName: 'Author URL',
				name: 'author_url',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit'],
					},
				},
				description: 'Profile link',
			},
			{
				displayName: 'Return Content',
				name: 'return_content',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['create', 'edit', 'get'],
					},
				},
				description: 'Whether a content field will be returned in the Page object',
			},
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['edit', 'get', 'getViews'],
					},
				},
				description: 'Path to the Telegraph page',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 200,
				},
				default: 50,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getAll'],
					},
				},
				description: 'Max number of results to return',
			},
			{
				displayName: 'Offset',
				name: 'offset',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getAll'],
					},
				},
				description: 'Sequential number of the first page to be returned',
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				typeOptions: {
					minValue: 2000,
					maxValue: 2100,
				},
				default: 2025,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getViews'],
					},
				},
			},
			{
				displayName: 'Month',
				name: 'month',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 12,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getViews'],
					},
				},
			},
			{
				displayName: 'Day',
				name: 'day',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 31,
				},
				default: 1,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getViews'],
					},
				},
			},
			{
				displayName: 'Hour',
				name: 'hour',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 24,
				},
				default: 0,
				displayOptions: {
					show: {
						resource: ['page'],
						operation: ['getViews'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				const qs: IDataObject = {};
				let method: IHttpRequestMethods = 'GET';
				let endpoint = '';
				let accessToken = '';
				if (!(resource === 'account' && operation === 'create')) {
					const credentials = await this.getCredentials('telegraphApi');
					accessToken = credentials.accessToken as string;
					qs.access_token = accessToken;
				}

				if (resource === 'account') {
					if (operation === 'create') {
						endpoint = 'createAccount';
						qs.short_name = this.getNodeParameter('short_name', i) as string;
						const authorName = this.getNodeParameter('author_name', i) as string;
						if (authorName) qs.author_name = authorName;
						const authorUrl = this.getNodeParameter('author_url', i) as string;
						if (authorUrl) qs.author_url = authorUrl;
					} else if (operation === 'edit') {
						endpoint = 'editAccountInfo';
						const shortName = this.getNodeParameter('short_name', i) as string;
						if (shortName) qs.short_name = shortName;
						const authorName = this.getNodeParameter('author_name', i) as string;
						if (authorName) qs.author_name = authorName;
						const authorUrl = this.getNodeParameter('author_url', i) as string;
						if (authorUrl) qs.author_url = authorUrl;
					} else if (operation === 'get') {
						endpoint = 'getAccountInfo';
						const fields = this.getNodeParameter('fields', i) as string[];
						qs.fields = JSON.stringify(fields);
					} else if (operation === 'revokeAccessToken') {
						endpoint = 'revokeAccessToken';
					}
				} else if (resource === 'page') {
					if (operation === 'create') {
						endpoint = 'createPage';
						method = 'POST';
						qs.title = this.getNodeParameter('title', i) as string;
						
						// Handle different content formats
						const contentFormat = this.getNodeParameter('contentFormat', i) as string;
						let content: unknown;
						if (contentFormat === 'markdown') {
							const markdownContent = this.getNodeParameter('contentMarkdown', i) as string;
							content = markdownToTelegraph(markdownContent);
						} else if (contentFormat === 'html') {
							const htmlContent = this.getNodeParameter('contentHtml', i) as string;
							content = htmlToTelegraph(htmlContent);
						} else {
							content = this.getNodeParameter('content', i);
						}
						qs.content = typeof content === 'string' ? content : JSON.stringify(content);
						
						const authorName = this.getNodeParameter('author_name', i) as string;
						if (authorName) qs.author_name = authorName;
						const authorUrl = this.getNodeParameter('author_url', i) as string;
						if (authorUrl) qs.author_url = authorUrl;
						const returnContent = this.getNodeParameter('return_content', i) as boolean;
						if (returnContent) qs.return_content = returnContent;

					} else if (operation === 'edit') {
						endpoint = 'editPage';
						method = 'POST';
						const path = this.getNodeParameter('path', i) as string;
						endpoint = `${endpoint}/${path}`;
						
						qs.title = this.getNodeParameter('title', i) as string;
						const contentFormat = this.getNodeParameter('contentFormat', i) as string;
						let content: unknown;
						if (contentFormat === 'markdown') {
							const markdownContent = this.getNodeParameter('contentMarkdown', i) as string;
							content = markdownToTelegraph(markdownContent);
						} else if (contentFormat === 'html') {
							const htmlContent = this.getNodeParameter('contentHtml', i) as string;
							content = htmlToTelegraph(htmlContent);
						} else {
							content = this.getNodeParameter('content', i);
						}
						qs.content = typeof content === 'string' ? content : JSON.stringify(content);
						const authorName = this.getNodeParameter('author_name', i) as string;
						if (authorName) qs.author_name = authorName;
						const authorUrl = this.getNodeParameter('author_url', i) as string;
						if (authorUrl) qs.author_url = authorUrl;
						const returnContent = this.getNodeParameter('return_content', i) as boolean;
						if (returnContent) qs.return_content = returnContent;

					} else if (operation === 'get') {
						endpoint = 'getPage';
						const path = this.getNodeParameter('path', i) as string;
						endpoint = `${endpoint}/${path}`;
						const returnContent = this.getNodeParameter('return_content', i) as boolean;
						if (returnContent) qs.return_content = returnContent;

					} else if (operation === 'getAll') {
						endpoint = 'getPageList';
						qs.limit = this.getNodeParameter('limit', i) as number;
						qs.offset = this.getNodeParameter('offset', i) as number;

					} else if (operation === 'getViews') {
						endpoint = 'getViews';
						const path = this.getNodeParameter('path', i) as string;
						endpoint = `${endpoint}/${path}`;
						
						const year = this.getNodeParameter('year', i) as number;
						if (year) qs.year = year;
						const month = this.getNodeParameter('month', i) as number;
						if (month) qs.month = month;
						const day = this.getNodeParameter('day', i) as number;
						if (day) qs.day = day;
						const hour = this.getNodeParameter('hour', i) as number;
						if (hour) qs.hour = hour;
				}
			}

				const responseData = await this.helpers.httpRequest({
					method,
					url: `https://api.telegra.ph/${endpoint}`,
					qs,
					json: true,
				});

					if (!responseData.ok) {
						throw new NodeOperationError(this.getNode(), `Telegraph API Error: ${responseData.error}`);
					}

					const result = responseData.result as IDataObject;
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(result),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
