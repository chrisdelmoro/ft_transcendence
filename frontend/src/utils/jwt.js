function base64UrlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


// Simple HMAC SHA-256 hash function
function hashHMACSHA256(message, secret) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    return crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']
    ).then(key => {
        return crypto.subtle.sign('HMAC', key, messageData);
    }).then(signature => {
        return arrayBufferToBase64Url(signature);
    });
}

// Function to create a JWT
export function createJWT(payload) {
    
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const payload = {
        sub: '1234567890',
        name: 'John Doe',
        iat: Math.floor(Date.now() / 1000)
    };

    const secret = 'test-secret-key';

    // Encode Header
    const encodedHeader = base64UrlEncode(JSON.stringify(header));

    // Encode Payload
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Create Signature
    const token = `${encodedHeader}.${encodedPayload}`;
    const signature = base64UrlEncode(hashHMACSHA256(token, secret));

    // Combine all parts
    return `${token}.${signature}`;
}
