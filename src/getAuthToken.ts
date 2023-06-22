import { generateCsrfToken } from '.';
import HttpClient from './HttpClient';
import { _bearer } from './constants';
import { debug } from './utils/debug';

// source: https://www.autohotkey.com/boards/viewtopic.php?t=116786&p=520608

/**
 * Web App login authentication
 * @param credentials Email, Username, and Password
 * @returns
 */
export async function getAuthToken(credentials?: {
	email: string;
	username: string;
	password: string;
}) {
	const baseHeaders = {
		'User-Agent':
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
		Pragma: 'no-cache',
		'Cache-Control': 'no-cache, no-store',
		'If-Modified-Since': 'Sat, 1 Jan 2000 00:00:00 GMT',
		Origin: 'https://twitter.com',
		Referer: 'https://twitter.com/',
	};
	const webLoginUrl = 'https://twitter.com/i/flow/login';

	const http = new HttpClient();

	// Open Twitter Login flow
	const document = (await http.get(webLoginUrl)) as Buffer;

	// Get Guest Token from document
	const match = document
		.toString('utf-8')
		.match(/.cookie=\"(?<gt>(gt=.+?));/g)?.[0];
	if (!match) throw new Error('Guest Token was not found');
	const [, guestToken] = match.split('"')[1].replace(';', '').split('=');

	const bearer = _bearer;
	// Return Guest Token if credentials are not provided
	if (!credentials)
		return { guestToken, csrfToken: generateCsrfToken(), bearer };

	const { email, username, password } = credentials;

	let flowToken = await flow_1_checkLogin();

	await flow_2_beginWebLoginFlow();

	const flow_3_response = await flow_3_submitUsername();
	const flow3ResponseText = flow_3_response.toString('utf-8');

	if (flow3ResponseText.includes('LoginEnterAlternateIdentifierSubtask')) {
		await flow_4_sumbitEmail();
	}

	await flow_5_sumbitPassword();

	await flow_6_checkForLogin();

	const { auth_token } = http.cookieJar.cookies;
	return {
		authToken: auth_token,
		csrfToken: generateCsrfToken(),
		guestToken,
		bearer,
	};

	async function flow_6_checkForLogin() {
		debug('Check for Login');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json',
			{
				flow_token: flowToken,
				subtask_inputs: [
					{
						subtask_id: 'AccountDuplicationCheck',
						check_logged_in_account: { link: 'AccountDuplicationCheck_false' },
					},
				],
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		flowToken = extractFlowTokenFromJSON(
			response,
			'Possibly flagged as suspicious login. Login to Twitter to resolve: https://twitter.com/home .',
		);
	}

	async function flow_5_sumbitPassword() {
		debug('Submit Password');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json',
			{
				flow_token: flowToken,
				subtask_inputs: [
					{
						subtask_id: 'LoginEnterPassword',
						enter_password: { password: password, link: 'next_link' },
					},
				],
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		flowToken = extractFlowTokenFromJSON(
			response,
			'Please check if provided Password is correct.',
		);
	}

	async function flow_4_sumbitEmail() {
		debug('Submit Email');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json',
			{
				flow_token: flowToken,
				subtask_inputs: [
					{
						subtask_id: 'LoginEnterAlternateIdentifierSubtask',
						enter_text: { text: email, link: 'next_link' },
					},
				],
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		flowToken = extractFlowTokenFromJSON(
			response,
			'Please check if provided Email is correct.',
		);
	}

	async function flow_3_submitUsername() {
		debug('Submit Username');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json',
			{
				flow_token: flowToken,
				subtask_inputs: [
					{
						subtask_id: 'LoginEnterUserIdentifierSSO',
						settings_list: {
							setting_responses: [
								{
									key: 'user_identifier',
									response_data: { text_data: { result: username } },
								},
							],
							link: 'next_link',
						},
					},
				],
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		flowToken = extractFlowTokenFromJSON(
			response,
			'Please check if provided Username is correct.',
		);

		return response;
	}

	async function flow_2_beginWebLoginFlow() {
		debug('Starting Web Login Flow');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json',
			{
				flow_token: flowToken,
				subtask_inputs: [],
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		flowToken = extractFlowTokenFromJSON(response);
	}

	async function flow_1_checkLogin() {
		debug('Checking if Logged in');
		const response = (await http.post(
			'https://api.twitter.com/1.1/onboarding/task.json?flow_name=login',
			{
				input_flow_data: {
					flow_context: {
						debug_overrides: {},
						start_location: { location: 'manual_link' },
					},
				},
				subtask_versions: {
					action_list: 2,
					alert_dialog: 1,
					app_download_cta: 1,
					check_logged_in_account: 1,
					choice_selection: 3,
					contacts_live_sync_permission_prompt: 0,
					cta: 7,
					email_verification: 2,
					end_flow: 1,
					enter_date: 1,
					enter_email: 2,
					enter_password: 5,
					enter_phone: 2,
					enter_recaptcha: 1,
					enter_text: 5,
					enter_username: 2,
					generic_urt: 3,
					in_app_notification: 1,
					interest_picker: 3,
					js_instrumentation: 1,
					menu_dialog: 1,
					notifications_permission_prompt: 2,
					open_account: 2,
					open_home_timeline: 1,
					open_link: 1,
					phone_verification: 4,
					privacy_options: 1,
					security_key: 3,
					select_avatar: 4,
					select_banner: 2,
					settings_list: 7,
					show_code: 1,
					sign_up: 2,
					sign_up_review: 4,
					tweet_selection_urt: 1,
					update_users: 1,
					upload_media: 1,
					user_recommendations_list: 4,
					user_recommendations_urt: 1,
					wait_spinner: 3,
					web_modal: 1,
				},
			},
			{
				...baseHeaders,
				'content-type': 'application/json',
				authorization: bearer,
				'x-guest-token': guestToken,
			},
		)) as Buffer;

		return extractFlowTokenFromJSON(response);
	}

	function extractFlowTokenFromJSON(
		response: Buffer,
		flowErrorMessage?: string,
	): string {
		const data = Buffer.from(response).toString();
		const unsualLoginMessage =
			'There was unusual login activity on your account. To help keep your account safe, please enter your phone number or username to verify it’s you.';
		if (data.includes('unusual')) throw new Error(unsualLoginMessage);

		const flowToken = JSON.parse(data)['flow_token'];
		if (!flowToken)
			throw new Error(
				`Error in Login flow. Flow Token is undefined: ${flowErrorMessage}`
					? `: ${flowErrorMessage}`
					: '',
			);
		return flowToken;
	}
}
