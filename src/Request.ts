import {Client} from "./Client";
import XhrRequest from "./XhrRequest";
import {IServerResponse, IRequestOptions, IStringMap} from "./Interfaces";
import {ApiAiRequestError} from "./Errors";

export default class Request {

    private uri;
    private requestMethod;
    private headers;

    constructor (private apiAiClient : Client, private options: IRequestOptions) {

        this.uri = this.apiAiClient.getApiBaseUrl() + 'query?v=' + this.apiAiClient.getApiVersion();
        this.requestMethod = XhrRequest.Method.POST;
        this.headers = {
            'Authorization': 'Bearer ' + this.apiAiClient.getAccessToken()
        };

        this.options.lang = this.apiAiClient.getApiLang();
        this.options.sessionId = this.apiAiClient.getSessionId();

    }

    public perform () : Promise<IServerResponse> {

        console.log('performing test request on URI', this.uri, 'with options:', this.options, 'with headers', this.headers);
        
        return XhrRequest.post(this.uri, <IStringMap> this.options, this.headers)
            .then(Request.handleSuccess.bind(this))
            .catch(Request.handleError.bind(this));
    }

    private static handleSuccess(xhr: XMLHttpRequest) : Promise<IServerResponse> {
        return Promise.resolve(JSON.parse(xhr.responseText));
    }

    private static handleError(xhr: XMLHttpRequest) : Promise<IServerResponse> {

        let error = null;

        try {
            let serverResponse: IServerResponse = JSON.parse(xhr.responseText);
            if (serverResponse.status && serverResponse.status.errorDetails) {
                error = new ApiAiRequestError(serverResponse.status.errorDetails, serverResponse.status.code);
            } else {
                error = new ApiAiRequestError(xhr.statusText, xhr.status);
            }
        } catch (e) {
            error = new ApiAiRequestError(xhr.statusText, xhr.status);
        }

        return Promise.reject(error);
    }

}