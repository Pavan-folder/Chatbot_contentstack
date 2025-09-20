'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var Chat = function (_a) {
    var apiUrl = _a.apiUrl, _b = _a.provider, provider = _b === void 0 ? 'openai' : _b, apiKey = _a.apiKey;
    var _c = react.useState([]), messages = _c[0], setMessages = _c[1];
    var _d = react.useState(''), input = _d[0], setInput = _d[1];
    var _e = react.useState(false), isLoading = _e[0], setIsLoading = _e[1];
    var messagesEndRef = react.useRef(null);
    var scrollToBottom = function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' });
    };
    react.useEffect(function () {
        scrollToBottom();
    }, [messages]);
    var sendMessage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var userMessage, response, reader, decoder, botMessageText_1, botMessage_1, _a, done, value, chunk, lines, _i, lines_1, line, data, parsed, error_1, errorMessage_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!input.trim())
                        return [2 /*return*/];
                    userMessage = {
                        id: Date.now().toString(),
                        text: input,
                        sender: 'user',
                        timestamp: new Date(),
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [userMessage], false); });
                    setInput('');
                    setIsLoading(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch("".concat(apiUrl, "/chat"), {
                            method: 'POST',
                            headers: __assign({ 'Content-Type': 'application/json' }, (apiKey && { 'Authorization': "Bearer ".concat(apiKey) })),
                            body: JSON.stringify({ message: input, provider: provider }),
                        })];
                case 2:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error('Failed to send message');
                    }
                    reader = (_b = response.body) === null || _b === void 0 ? void 0 : _b.getReader();
                    decoder = new TextDecoder();
                    botMessageText_1 = '';
                    botMessage_1 = {
                        id: (Date.now() + 1).toString(),
                        text: '',
                        sender: 'bot',
                        timestamp: new Date(),
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [botMessage_1], false); });
                    _c.label = 3;
                case 3:
                    return [4 /*yield*/, reader.read()];
                case 4:
                    _a = _c.sent(), done = _a.done, value = _a.value;
                    if (done)
                        return [3 /*break*/, 5];
                    chunk = decoder.decode(value);
                    lines = chunk.split('\n');
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        if (line.startsWith('data: ')) {
                            data = line.slice(6);
                            if (data === '[DONE]')
                                break;
                            try {
                                parsed = JSON.parse(data);
                                if (parsed.content) {
                                    botMessageText_1 += parsed.content;
                                    setMessages(function (prev) {
                                        return prev.map(function (msg) {
                                            return msg.id === botMessage_1.id ? __assign(__assign({}, msg), { text: botMessageText_1 }) : msg;
                                        });
                                    });
                                }
                            }
                            catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                    return [3 /*break*/, 3];
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_1 = _c.sent();
                    console.error('Error sending message:', error_1);
                    errorMessage_1 = {
                        id: (Date.now() + 2).toString(),
                        text: 'Sorry, there was an error processing your message.',
                        sender: 'bot',
                        timestamp: new Date(),
                    };
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [errorMessage_1], false); });
                    return [3 /*break*/, 8];
                case 7:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var handleKeyPress = function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    return (jsxRuntime.jsxs("div", __assign({ style: { width: '400px', height: '600px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'column' } }, { children: [jsxRuntime.jsxs("div", __assign({ style: { flex: 1, padding: '16px', overflowY: 'auto' } }, { children: [messages.map(function (message) { return (jsxRuntime.jsx("div", __assign({ style: { marginBottom: '12px', textAlign: message.sender === 'user' ? 'right' : 'left' } }, { children: jsxRuntime.jsx("div", __assign({ style: {
                                display: 'inline-block',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f1f1',
                                color: message.sender === 'user' ? 'white' : 'black',
                                maxWidth: '80%',
                                wordWrap: 'break-word',
                            } }, { children: message.text })) }), message.id)); }), isLoading && (jsxRuntime.jsx("div", __assign({ style: { textAlign: 'left', marginBottom: '12px' } }, { children: jsxRuntime.jsx("div", __assign({ style: { display: 'inline-block', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f1f1f1' } }, { children: "Typing..." })) }))), jsxRuntime.jsx("div", { ref: messagesEndRef })] })), jsxRuntime.jsx("div", __assign({ style: { padding: '16px', borderTop: '1px solid #ccc' } }, { children: jsxRuntime.jsxs("div", __assign({ style: { display: 'flex' } }, { children: [jsxRuntime.jsx("input", { type: "text", value: input, onChange: function (e) { return setInput(e.target.value); }, onKeyPress: handleKeyPress, placeholder: "Type your message...", style: { flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }, disabled: isLoading }), jsxRuntime.jsx("button", __assign({ onClick: sendMessage, disabled: isLoading || !input.trim(), style: { marginLeft: '8px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' } }, { children: "Send" }))] })) }))] })));
};

exports.Chat = Chat;
//# sourceMappingURL=index.js.map
