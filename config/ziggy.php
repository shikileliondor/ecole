<?php

return [
    'groups' => [
        'public' => [
            'sanctum.csrf-cookie',
            'login',
            'logout',
            'register',
            'password.*',
            'verification.*',
        ],
        'app' => [
            'dashboard',
            'eleves.*',
            'parametres.*',
            'notes-bulletins.*',
            'emplois-du-temps.*',
            'classes.*',
            'inscriptions.*',
            'absences.*',
            'personnel.*',
            'finances.*',
            'api.sms.*',
            'sms.*',
            'notifications.*',
            'profile.*',
            'storage.local',
            'storage.local.upload',
            'logout',
        ],
    ],
];
