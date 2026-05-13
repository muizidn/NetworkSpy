export interface HttpStatusInfo {
  code: number;
  message: string;
  description: string;
}

export const HTTP_STATUS_CODES: Record<number, HttpStatusInfo> = {
  // 1xx Informational
  100: { code: 100, message: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
  101: { code: 101, message: "Switching Protocols", description: "The requester has asked the server to switch protocols." },
  102: { code: 102, message: "Processing", description: "The server has received and is processing the request, but no response is available yet." },
  103: { code: 103, message: "Early Hints", description: "Used to return some response headers before final HTTP message." },

  // 2xx Success
  200: { code: 200, message: "OK", description: "The request has succeeded." },
  201: { code: 201, message: "Created", description: "The request has succeeded and a new resource has been created as a result." },
  202: { code: 202, message: "Accepted", description: "The request has been received but not yet acted upon." },
  203: { code: 203, message: "Non-Authoritative Information", description: "The returned metadata is not exactly the same as is available from the origin server." },
  204: { code: 204, message: "No Content", description: "The request has succeeded but there is no content to send for this request." },
  205: { code: 205, message: "Reset Content", description: "The server successfully processed the request, but is not returning any content." },
  206: { code: 206, message: "Partial Content", description: "The server is delivering only part of the resource due to a range header sent by the client." },
  207: { code: 207, message: "Multi-Status", description: "Provides status for multiple independent operations (WebDAV)." },
  208: { code: 208, message: "Already Reported", description: "The members of a DAV binding have already been enumerated in a preceding part of the (multistatus) response." },
  226: { code: 226, message: "IM Used", description: "The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance." },

  // 3xx Redirection
  300: { code: 300, message: "Multiple Choices", description: "The request has more than one possible response." },
  301: { code: 301, message: "Moved Permanently", description: "The URL of the requested resource has been changed permanently." },
  302: { code: 302, message: "Found", description: "The URL of the requested resource has been changed temporarily." },
  303: { code: 303, message: "See Other", description: "The server sent this response to direct the client to get the requested resource at another URI with a GET request." },
  304: { code: 304, message: "Not Modified", description: "This is used for caching purposes. It tells the client that the response has not been modified." },
  305: { code: 305, message: "Use Proxy", description: "The requested resource must be accessed through the proxy given by the Location field." },
  307: { code: 307, message: "Temporary Redirect", description: "The server sends this response to direct the client to get the requested resource at another URI with the same method that was used in the prior request." },
  308: { code: 308, message: "Permanent Redirect", description: "The resource is now permanently located at another URI, specified by the Location: HTTP Response header." },

  // 4xx Client Error
  400: { code: 400, message: "Bad Request", description: "The server could not understand the request due to invalid syntax." },
  401: { code: 401, message: "Unauthorized", description: "Authentication is required and has failed or has not yet been provided." },
  402: { code: 402, message: "Payment Required", description: "Reserved for future use. The original intention was that this code might be used as part of some form of digital cash or micro payment scheme." },
  403: { code: 403, message: "Forbidden", description: "The client does not have access rights to the content." },
  404: { code: 404, message: "Not Found", description: "The server can not find the requested resource." },
  405: { code: 405, message: "Method Not Allowed", description: "The request method is known by the server but has been disabled and cannot be used." },
  406: { code: 406, message: "Not Acceptable", description: "The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers." },
  407: { code: 407, message: "Proxy Authentication Required", description: "Authentication is required to be done by a proxy." },
  408: { code: 408, message: "Request Timeout", description: "This response is sent on an idle connection by some servers, even without any previous request by the client." },
  409: { code: 409, message: "Conflict", description: "The request conflicts with the current state of the server." },
  410: { code: 410, message: "Gone", description: "The requested content has been permanently deleted from server, with no forwarding address." },
  411: { code: 411, message: "Length Required", description: "Server rejected the request because the Content-Length header field is not defined and the server requires it." },
  412: { code: 412, message: "Precondition Failed", description: "The client has indicated preconditions in its headers which the server does not meet." },
  413: { code: 413, message: "Payload Too Large", description: "Request entity is larger than limits defined by server." },
  414: { code: 414, message: "URI Too Long", description: "The URI requested by the client is longer than the server is willing to interpret." },
  415: { code: 415, message: "Unsupported Media Type", description: "The media format of the requested data is not supported by the server." },
  416: { code: 416, message: "Range Not Satisfiable", description: "The range specified by the Range header field in the request can't be fulfilled." },
  417: { code: 417, message: "Expectation Failed", description: "This response code means the expectation indicated by the Expect request header field can't be met by the server." },
  418: { code: 418, message: "I'm a teapot", description: "The server refuses the attempt to brew coffee with a teapot." },
  419: { code: 419, message: "Page Expired", description: "Commonly used by frameworks (like Laravel) when a CSRF token is missing or expired." },
  420: { code: 420, message: "Enhance Your Calm", description: "Returned by the Twitter Search and Trends API when the client is being rate limited." },
  421: { code: 421, message: "Misdirected Request", description: "The request was directed at a server that is not able to produce a response." },
  422: { code: 422, message: "Unprocessable Entity", description: "The request was well-formed but was unable to be followed due to semantic errors." },
  423: { code: 423, message: "Locked", description: "The resource that is being accessed is locked (WebDAV)." },
  424: { code: 424, message: "Failed Dependency", description: "The request failed due to failure of a previous request (WebDAV)." },
  425: { code: 425, message: "Too Early", description: "Indicates that the server is unwilling to risk processing a request that might be replayed." },
  426: { code: 426, message: "Upgrade Required", description: "The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol." },
  428: { code: 428, message: "Precondition Required", description: "The origin server requires the request to be conditional." },
  429: { code: 429, message: "Too Many Requests", description: "The user has sent too many requests in a given amount of time ('rate limiting')." },
  431: { code: 431, message: "Request Header Fields Too Large", description: "The server is unwilling to process the request because its header fields are too large." },
  444: { code: 444, message: "No Response", description: "Nginx internal code used to instruct the server to return nothing to the client and close the connection immediately." },
  451: { code: 451, message: "Unavailable For Legal Reasons", description: "The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government." },
  499: { code: 499, message: "Client Closed Request", description: "Nginx internal code used when the client has closed the connection before the server has the opportunity to send the HTTP headers." },

  // 5xx Server Error
  500: { code: 500, message: "Internal Server Error", description: "The server has encountered a situation it doesn't know how to handle." },
  501: { code: 501, message: "Not Implemented", description: "The request method is not supported by the server and cannot be handled." },
  502: { code: 502, message: "Bad Gateway", description: "The server, while working as a gateway to get a response needed to handle the request, got an invalid response." },
  503: { code: 503, message: "Service Unavailable", description: "The server is not ready to handle the request." },
  504: { code: 504, message: "Gateway Timeout", description: "The server is acting as a gateway and cannot get a response in time." },
  505: { code: 505, message: "HTTP Version Not Supported", description: "The HTTP version used in the request is not supported by the server." },
  506: { code: 506, message: "Variant Also Negotiates", description: "Internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself." },
  507: { code: 507, message: "Insufficient Storage", description: "The server is unable to store the representation needed to successfully complete the request (WebDAV)." },
  508: { code: 508, message: "Loop Detected", description: "The server detected an infinite loop while processing the request (WebDAV)." },
  509: { code: 509, message: "Bandwidth Limit Exceeded", description: "The server has exceeded the bandwidth specified by the server administrator." },
  510: { code: 510, message: "Not Extended", description: "Further extensions to the request are required for the server to fulfill it." },
  511: { code: 511, message: "Network Authentication Required", description: "The client needs to authenticate to gain network access." },
  520: { code: 520, message: "Unknown Error", description: "Cloudflare: The 520 error is used as a 'catch-all' response for when the origin server returns something unexpected." },
  521: { code: 521, message: "Web Server Is Down", description: "Cloudflare: The origin server has refused the connection from Cloudflare." },
  522: { code: 522, message: "Connection Timed Out", description: "Cloudflare: Cloudflare could not negotiate a TCP handshake with the origin server." },
  523: { code: 523, message: "Origin Is Unreachable", description: "Cloudflare: Cloudflare could not reach the origin server; for example, if the DNS records for the origin server are incorrect." },
  524: { code: 524, message: "A Timeout Occurred", description: "Cloudflare: Cloudflare was able to complete a TCP connection to the origin server, but the server did not respond with an HTTP response before the connection timed out." },
  525: { code: 525, message: "SSL Handshake Failed", description: "Cloudflare: Cloudflare could not negotiate an SSL/TLS handshake with the origin server." },
  526: { code: 526, message: "Invalid SSL Certificate", description: "Cloudflare: Cloudflare could not validate the SSL certificate on the origin web server." },
  527: { code: 527, message: "Railgun Error", description: "Cloudflare: The 527 error indicates that the request timed out or failed after the WAN connection had been established." },
  530: { code: 530, message: "Site is Frozen", description: "Cloudflare: The site is frozen due to inactivity or other administrative reasons." },
};

export const getHttpStatusInfo = (code: string | number): HttpStatusInfo | undefined => {
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : (typeof code === 'number' ? code : NaN);
  return HTTP_STATUS_CODES[numericCode];
};
