// Dependencies
import AnJS from '../src/core.js';
import { $ } from '../src/index.js';
import { request } from '../src/request.js';

// Mock global fetch API
global.fetch = jest.fn();

describe('request() Function Direct Tests', () => {
    let mockResponse;
    let baseUrl;

    beforeEach(() => {
        baseUrl = 'http://localhost';

        mockResponse = {
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            json: jest.fn().mockResolvedValue({ message: 'Success' }),
            text: jest.fn().mockResolvedValue('Success'),
        };

        global.fetch.mockResolvedValue(mockResponse);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should send a simple GET request', async () => {
        await request('/direct-get');

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/direct-get`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        });
    });

    test('should send a POST request with JSON data', async () => {
        await request('/direct-post', 'POST', { key: 'value' });

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/direct-post`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: 'value' }),
        });
    });

    test('should process FormData properly', async () => {
        const formData = new FormData();
        formData.append('key', 'value');

        await request('/direct-form', 'POST', formData);

        expect(fetch).toHaveBeenCalledWith(`${baseUrl}/direct-form`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData,
        });
    });

    test('should timeout properly when set', async () => {
        global.fetch.mockImplementation(() =>
            new Promise(resolve => setTimeout(() => resolve(mockResponse), 10000))
        );

        await expect(request('/direct-timeout', 'GET', null, { timeout: 100 }))
            .rejects.toThrow('Request timed out: /direct-timeout');
    });
});

describe('AnJS HTTP Requests', () => {
    let mockResponse;
    let baseUrl;
    let abortController;

    beforeEach(() => {
        baseUrl = 'http://localhost';

        // Mock successful fetch response
        mockResponse = {
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            json: jest.fn().mockResolvedValue({ message: 'Success' }),
            text: jest.fn().mockResolvedValue('Success'),
        };

        global.fetch.mockResolvedValue(mockResponse);
        abortController = new AbortController();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Misc', () => {
        test('should pass signal to fetch when provided', async () => {
            const controller = $.abortController();
            await new AnJS().request('/signal-test', 'GET', null, { signal: controller.signal });

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/signal-test`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal,
            });
        });

        test('should encode data as URL-encoded form data when Content-Type is set', async () => {
            const data = { key: 'value' };
            await new AnJS().request('/form-test', 'POST', data, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/form-test`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data).toString(),
            });
        });

        test('should not apply timeout when set to 0', async () => {
            const mockPromise = Promise.resolve({ message: 'Success' });
            const result = await new AnJS().request('/no-timeout', 'GET', null, { timeout: 0 });

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/no-timeout`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('should handle request with no body', async () => {
            await new AnJS().request('/no-body-test', 'POST', null);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/no-body-test`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
            });
        });

        test('should disable timeout when set to 0', async () => {
            await new AnJS().request('/no-timeout-test', 'GET', null, { timeout: 0 });

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/no-timeout-test`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
        });
    });

    describe('request() Method Tests', () => {
        test('should handle request with only URL', async () => {
            await new AnJS().request('/default-test');

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/default-test`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
        });

        test('should make a GET request without explicitly setting method', async () => {
            const result = await new AnJS().request('/get-test');

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/get-test`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('should make a POST request with JSON data', async () => {
            const data = { key: 'value' };
            const result = await new AnJS().request('/post-test', 'POST', data);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/post-test`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('should make a request with FormData body', async () => {
            const formData = new FormData();
            formData.append('key', 'value');

            await new AnJS().request('/formdata-test', 'POST', formData);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/formdata-test`, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: formData,
            });
        });

        test('should make a request with URL-encoded form data', async () => {
            const data = { key: 'value' };

            await new AnJS().request('/urlencoded-test', 'POST', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/urlencoded-test`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data).toString(),
            });
        });

        test('should use AbortController to cancel a request', async () => {
            const controller = $.abortController();

            // Mock fetch to reject with AbortError
            global.fetch.mockRejectedValueOnce(new DOMException('The user aborted a request.', 'AbortError'));

            const fetchPromise = new AnJS().request('/abort-test', 'GET', null, { signal: controller.signal });

            controller.abort();

            await expect(fetchPromise).rejects.toThrow('The user aborted a request.');
        });

        test('should reject when response is not ok', async () => {
            mockResponse.ok = false;
            mockResponse.status = 404;
            fetch.mockResolvedValue(mockResponse);

            await expect(new AnJS().request('/error-test')).rejects.toThrow('HTTP 404 at /error-test');
        });

        test('should handle request timeout', async () => {
            global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResponse), 10000)));

            await expect(new AnJS().request('/timeout-test', 'GET', null, { timeout: 100 })).rejects.toThrow('Request timed out: /timeout-test');
        });

        test('should return text when response is not JSON', async () => {
            mockResponse.headers.get = () => 'text/plain';
            mockResponse.text = jest.fn().mockResolvedValue('Plain text response');

            const result = await new AnJS().request('/text-test');
            expect(result).toBe('Plain text response');
        });

        test('should handle missing or invalid Content-Type headers', async () => {
            mockResponse.headers.get = () => null;
            mockResponse.text = jest.fn().mockResolvedValue('Fallback text response');

            const result = await new AnJS().request('/no-header-test');
            expect(result).toBe('Fallback text response');
        });
    });

    describe('Shortcut Methods', () => {
        test('$.get() should make a GET request', async () => {
            const result = await $.get('/get-test');

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/get-test`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('$.post() should make a POST request with JSON data', async () => {
            const data = { key: 'value' };
            const result = await $.post('/post-test', data);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/post-test`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('$.delete() should make a DELETE request', async () => {
            await $.delete('/delete-test');

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/delete-test`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json' },
            });
        });

        test('$.put() should make a PUT request with JSON data', async () => {
            const data = { key: 'updated' };
            const result = await $.put('/put-test', data);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/put-test`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            expect(result).toEqual({ message: 'Success' });
        });

        test('$.patch() should make a PATCH request with JSON data', async () => {
            const data = { key: 'patched' };
            const result = await $.patch('/patch-test', data);

            expect(fetch).toHaveBeenCalledWith(`${baseUrl}/patch-test`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            expect(result).toEqual({ message: 'Success' });
        });
    });
});