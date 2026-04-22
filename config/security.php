<?php

return [
    'headers' => [
        'content_security_policy' => env(
            'SECURITY_CONTENT_SECURITY_POLICY',
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'"
        ),
        'strict_transport_security' => env(
            'SECURITY_HSTS',
            'max-age=31536000; includeSubDomains'
        ),
    ],
];
